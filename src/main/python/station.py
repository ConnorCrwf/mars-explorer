#!/usr/bin/env python

import random
import logging
from ConfigParser import ConfigParser

from twisted.internet import reactor
from twisted.internet.defer import inlineCallbacks

from autobahn.twisted.util import sleep
from autobahn.twisted.wamp import ApplicationSession, ApplicationRunner


class Component(ApplicationSession):

    @inlineCallbacks
    def onJoin(self, details):
        logging.info('Connected to realm "{}" (sessionid={})'.format(
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
        print(sensor_data)

    def get_navigation(self):
        return random.uniform(-1, 1), random.uniform(-1, 1)

    def onLeave(self, details):
        self.disconnect()

    def onDisconnect(self):
        reactor.stop()

if __name__ == '__main__':
    config = ConfigParser()
    config.read('config.ini')

    host = config.get('main', 'host')
    port = config.get('main', 'port')
    address = u'ws://{}:{}/ws'.format(host, port)
    realm = u'mars'

    logging.getLogger().setLevel(logging.INFO)
    logging.info('Connecting to {} in realm "{}"...'.format(address, realm))

    # Start application
    runner = ApplicationRunner(address, realm, extra={
        'config': config,
        'rover_id': 1
    })
    runner.run(Component)
