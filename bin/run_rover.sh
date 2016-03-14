#!/bin/bash

dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
logDir=/var/log/mars

mkdir -p $logDir

$dir/../src/main/python/rover.py | tee $logDir/output.log
