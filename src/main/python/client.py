#!/usr/bin/env python

import ConfigParser
import logging
import threading
import time

import rrb3

CONFIG_FILE = 'config.ini'


class Rover(threading.Thread):

    def __init__(self, config):
	threading.Thread.__init__(self)

        self.config = config
	self.rate = float(self.config.get('rover', 'rate'))
	battery_voltage = self.config.get('hw', 'battery_voltage')
	motor_voltage = self.config.get('hw', 'motor_voltage')
        print 'Initializing rrb3...'
	self.rr = rrb3.RRB3(battery_voltage, motor_voltage)
        self.rr.set_led1(0)
        self.rr.set_led1(1)
        print 'Initialized rrb3'
        self.is_running = True

    def shutdown(self):
        self.rr.stop()
        self.rr.cleanup()
        self.is_running = False

    def run(self):
        while (self.is_running):
            time.sleep(self.rate)

    def get_range(self):
        distance = self.rr.get_distance()
        logging.info('Range: {}'.format(distance))
        return distance

    def set_motors(self, left, right):
        l = abs(left)
        r = abs(right)
        left_dir = 0 if l < 0 else 1
        right_dir = 0 if r < 0 else 1
        print('set_motors({}, {}, {}, {})'.format(l, left_dir, r, right_dir))
        self.rr.set_motors(l, left_dir, r, right_dir)


def main():
	config = ConfigParser.ConfigParser()
	config.read(CONFIG_FILE)
	Rover().start()

if __name__ == '__main__':
    logging.getLogger().setLevel(logging.INFO)
    logging.basicConfig(format='[%(levelname)-5s] %(message)s')
    main()
