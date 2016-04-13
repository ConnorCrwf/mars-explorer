#!/usr/bin/env python

import os
import random
import logging
from ConfigParser import ConfigParser

from twisted.internet import reactor
from twisted.internet.defer import inlineCallbacks

from autobahn.twisted.util import sleep
from autobahn.twisted.wamp import ApplicationSession, ApplicationRunner

logger = logging.getLogger(__name__)


class Component(ApplicationSession):

    @inlineCallbacks
    def onJoin(self, details):
        logger.info('Connected to realm "{}" (sessionid={})'.format(
            details.realm, details.session))
        self.rover_id = str(self.config.extra['rover_id'])
        yield self.subscribe(self.on_sensor_update,
                             'mars.rover.' + self.rover_id + '.sensors')

        while True:
            self.publish('mars.station.' + self.rover_id + '.heartbeat')
            self.publish('mars.rover.' + self.rover_id + '.navigation',
                         *self.get_navigation())
            yield sleep(1)

    def on_sensor_update(self, sensor_data):
        self.log.debug(sensor_data)

    def get_navigation(self):
        return random.uniform(-1, 1), random.uniform(-1, 1)

    def onLeave(self, details):
        self.disconnect()

    def onDisconnect(self):
        reactor.stop()

def main():
    config = ConfigParser()
    config_file = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'config.ini')
    config.read(config_file)

    logger.setLevel(getattr(logging, config.get('logging', 'level')))
    logging.basicConfig(format='[%(levelname)-5s] %(asctime)-15s %(name)10s %(message)s')

    host = config.get('main', 'host')
    port = config.get('main', 'port')
    address = u'ws://{}:{}/ws'.format(host, port)
    realm = u'mars'

    # Start application
    logger.info('Connecting to {} in realm "{}"...'.format(address, realm))
    runner = ApplicationRunner(address, realm, extra={
        'config': config,
        'rover_id': 1
    })
    runner.run(Component)

if __name__ == '__main__':
    main()
