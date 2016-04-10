(function () {
    var module = angular.module('mars.leap', []);

    /**
     * Map a value from one range to another.
     *
     * @param {number} value value to convert
     * @param {number} aMin minimum of the start range
     * @param {number} aMax maximum of the start range
     * @param {number} bMin minimum of the end range
     * @param {number} bMax maximum of the end range
     */
    function map(value,  aMin, aMax, bMin, bMax) {
        return bMin + (bMax - bMin) * ((value - aMin) / (aMax - aMin));
    }

    module.provider('leap', function () {
        var _config;
        var previousMotorValues = [0, 0];
        var controllerOptions = {};

        this.config = function (config) {
            _config = config;
        };

        var start = function (rover) {
            var that = this;
            var motorLeft = document.querySelector('.motor-left');
            var motorRight = document.querySelector('.motor-right');

            Leap.loop(function(frame) {
                var leftHandDetected = false;
                var rightHandDetected = false;
                var motorValues = [0, 0];
                var handValues = [0, 0];
                var i;
                // Iterate over hands
                for (i = 0; i < frame.hands.length; i++) {
                    var hand = frame.hands[i];
                    var handIndex = (hand.type === 'left') ? 0 : 1;

                    if (hand.type === 'left') {
                        leftHandDetected = true;
                    } else {
                        rightHandDetected = true;
                    }

                    var value = hand.sphereCenter[2].toFixed(_config.precision);
                    handValues[handIndex] = value;

                    if (value > _config.stopZone[0] && value < _config.stopZone[1]) {
                        value = 0;
                    } else if (value >= _config.stopZone[1]) {
                        value = map(value, _config.stopZone[1], _config.max, 0, -1);
                    } else {
                        value = map(value, _config.min, _config.stopZone[0], 1, 0);
                    }
                    value = value.toFixed(_config.precision);
                    motorValues[handIndex] = value;
                }

                // Warn user if hand is not detected
                if (!leftHandDetected && !motorLeft.classList.contains('warning')) {
                    motorLeft.classList.add('warning');
                } else if (leftHandDetected && motorLeft.classList.contains('warning')) {
                    motorLeft.classList.remove('warning');
                }
                if (!rightHandDetected && !motorRight.classList.contains('warning')) {
                    motorRight.classList.add('warning');
                } else if (rightHandDetected && motorRight.classList.contains('warning')) {
                    motorRight.classList.remove('warning');
                }


                if (frame.hands.length === 0) {
                    rover.navigation.left = 0;
                    rover.navigation.right = 0;
                    return;
                }

                if (previousMotorValues[0] !== motorValues[0] || previousMotorValues[1] !== motorValues[1]) {
                    console.debug(handValues + " => " + motorValues);
                    rover.navigation.left = motorValues[0];
                    rover.navigation.right = motorValues[1];
                }

                previousMotorValues[0] = motorValues[0];
                previousMotorValues[1] = motorValues[1];
            });
        };

        this.$get = function () {
            return {
                start: start
            };
        };
    });
}());
