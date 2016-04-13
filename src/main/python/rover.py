#!/usr/bin/env python

import os
import uuid
import logging
from ConfigParser import ConfigParser

from twisted.internet import reactor
from twisted.internet.defer import inlineCallbacks
from twisted.internet.error import NoRouteError

from autobahn.twisted.util import sleep
from autobahn.twisted.wamp import ApplicationSession, ApplicationRunner

from client import Rover

logger = logging.getLogger(__name__)


class Component(ApplicationSession):

    @inlineCallbacks
    def onJoin(self, details):
        print(details)
        dir(details)
        self.conf = self.config.extra['config']
        self.id_ = str(self.conf.get('rover', 'id') or uuid.uuid4())
        self.rover = self.config.extra['rover']
        self.rate = float(self.conf.get('rover', 'rate'))
        # TODO Lookup exact IP address
        self.host = '192.168.1.2{}'.format(self.id_.zfill(2))
        self.camera_uri = 'http://{}/html/cam_pic_new.php?pDelay=40000'.format(self.host)

        yield self.subscribe(self.on_navigation_update, 'mars.rover.' + self.id_ + '.navigation')
        yield self.subscribe(self.on_signal, 'mars.rover.' + self.id_ + '.signal')

        while True:
            self.publish('mars.rover.' + self.id_ + '.heartbeat')
            self.publish('mars.rover.' + self.id_ + '.sensors', self.get_sensors())
            yield sleep(self.rate)

    def on_navigation_update(self, left_motor, right_motor):
        self.log.debug('{}, {}'.format(left_motor, right_motor))
        self.rover.set_motors(float(left_motor), float(right_motor))

    def on_reboot_signal(self):
        self.log.info('Rebooting system')
        self.rover.reboot()
        self.leave()

    def on_signal(self, signal):
        signal = signal.lower()
        self.log.info('Recieved signal {}'.format(signal))
        if signal in ['stop', 'shutdown', 'reboot', 'update']:
            result = getattr(self.rover, signal)()
            if not self.rover.is_running:
                self.leave()

    def get_sensors(self):
        return {
            'range': self.rover.get_range(),
            'camera': self.camera_uri
        }

    def onLeave(self, details):
        self.log.info('Leaving...')
        self.disconnect()

    def onDisconnect(self):
        reactor.stop()
        self.log.info('Disconnected')

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

    logger.info('Initializing rover interface...')
    rover = Rover(config)
    rover.start()

    logger.info('Connecting to {} in realm "{}"...'.format(address, realm))
    runner = ApplicationRunner(address, realm, extra={
        'config': config,
        'rover': rover
    })

    # Start application
    try:
        runner.run(Component)
    except NoRouteError:
        logger.error('Error connecting to {} {}'.format(address, realm))
    finally:
        rover.stop()

if __name__ == '__main__':
    main()
