#!/usr/bin/env python

import random

from twisted.internet import reactor
from twisted.internet.defer import inlineCallbacks

from autobahn.twisted.util import sleep
from autobahn.twisted.wamp import ApplicationSession, ApplicationRunner


class Component(ApplicationSession):

    @inlineCallbacks
    def onJoin(self, details):
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
    uri = u'ws://localhost:8080/ws'
    realm = u'mars'

    # Start application
    runner = ApplicationRunner(uri, realm, extra={
        'rover_id': 1
    })
    runner.run(Component)
