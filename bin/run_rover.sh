#!/bin/bash

cd /home/pi/Code/mars/src
./rover.py | tee /var/log/mars/output.log
