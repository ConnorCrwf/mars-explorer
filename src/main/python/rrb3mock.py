import random
import logging


class RRB3:

    def __init__(self, battery_voltage, motor_voltage):
        logging.info('Initializing RRB3Mock (battery_voltage={}, motor_voltage={})'.format(
            battery_voltage, motor_voltage))

    def get_distance(self):
        return random.uniform(0, 100)

    def set_led1(self, value):
        logging.info('LED 1 set to {}'.format(value))

    def set_led2(self, value):
        logging.info('LED 2 set to {}'.format(value))

    def stop(self):
        logging.info('Stopped')

    def cleanup(self):
        logging.info('Cleaned up')

    def set_motors(self, left, left_dir, right, right_dir):
        logging.info('Setting motors to [{}/{}, {}/{}]'.format(
            left, left_dir, right, right_dir))
