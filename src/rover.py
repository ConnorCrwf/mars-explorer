#!/usr/bin/env python

import uuid
import random

from twisted.internet import reactor
from twisted.internet.defer import inlineCallbacks

from autobahn.twisted.util import sleep
from autobahn.twisted.wamp import ApplicationSession, ApplicationRunner


class Component(ApplicationSession):

    @inlineCallbacks
    def onJoin(self, details):
        self.id_ = str(self.config.extra['id'] or uuid.uuid4())
        # results = yield self.subscribe(self)
        # failures = [r for r in results if isinstance(r, Failure)]
        yield self.subscribe(self.on_navigation_update,
                             'mars.rover.' + self.id_ + '.navigation')
        yield self.subscribe(self.on_shutdown_signal,
                             'mars.rover.' + self.id_ + '.shutdown')

        while True:
            self.publish('mars.rover.' + self.id_ + '.heartbeat')
            self.publish('mars.rover.' + self.id_ + '.sensors',
                         self.get_sensors())
            yield sleep(1)

    def on_navigation_update(self, left_motor, right_motor):
        self.log.info('{}, {}'.format(left_motor, right_motor))

    def on_shutdown_signal(self):
        self.log.info('Shutting down system')
        self.leave()

    def get_sensors(self):
        return {'range': random.uniform(0, 100)}

    def onLeave(self, details):
        self.disconnect()

    def onDisconnect(self):
        reactor.stop()


if __name__ == '__main__':
    address = u'ws://localhost:8080/ws'
    realm = u'mars'

    # Start application
    runner = ApplicationRunner(address, realm, extra={
        'id': 1
    })
    runner.run(Component)
