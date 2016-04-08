(function () {
    var app = angular.module('mars', []);

    app.value('serverConfig', {
        wamp: {
            url: 'ws://127.0.0.1:8080/ws',
            //url: 'ws://192.168.0.200:8080/ws',
            realm: 'mars',
        },
        leap: {
        	precision: 1,
        	min: -50,
        	max: 100,
        	stopZone: [-20, 30]
        }
    });

    app.service('wamp', function (serverConfig) {
        var connection = new autobahn.Connection(serverConfig.wamp);
        return connection;
    });

    app.service('leap', function (serverConfig) {
        var leap = {
            config: serverConfig.leap,
            initialize: function (rovers) {
                //var leftMotor = document.querySelector('#left-motor-' + rovers[0].id);
                //var rightMotor = document.querySelector('#right-motor-' + rovers[0].id);

                console.log('done');
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

                var that = this;
                var previousMotorValues = [0, 0];
                var controllerOptions = {};
                var motorLeft = document.querySelector('.motor-left');
                var motorRight = document.querySelector('.motor-right');

                Leap.loop(function(frame) {
                    var config = that.config;
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

                        var value = hand.sphereCenter[2].toFixed(config.precision);
                        handValues[handIndex] = value;

                        if (value > config.stopZone[0] && value < config.stopZone[1]) {
                            value = 0;
                        } else if (value >= config.stopZone[1]) {
                            value = map(value, config.stopZone[1], config.max, 0, -1);
                        } else {
                            value = map(value, config.min, config.stopZone[0], 1, 0);
                        }
                        value = value.toFixed(config.precision);
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
                        rovers[0].navigation.left = 0;
                        rovers[0].navigation.right = 0;
                        return;
                    }

                    if (previousMotorValues[0] !== motorValues[0] || previousMotorValues[1] !== motorValues[1]) {
                        console.debug(handValues + " => " + motorValues);
                        rovers[0].navigation.left = motorValues[0];
                        rovers[0].navigation.right = motorValues[1];
                    }

                    previousMotorValues[0] = motorValues[0];
                    previousMotorValues[1] = motorValues[1];
                });
            }
        };
        return leap;
    });

    app.controller('StationController', function (wamp, leap) {
        var stationController = this;

        this.getRovers = function () {
            // TODO Remove after testing
            var id = document.querySelector('#rover-id').value;
            var rovers = [
                {
                    id: id,
                    heartbeat: '',
                    sensors: {
                        range: 0,
                        camera: {
                            uri: 'http://192.168.1.201/html/cam_pic_new.php?pDelay=40000'
                        }
                    },
                    navigation: {
                        left: 0,
                        right: 0
                    }
                }
            ];
            return rovers;
        };
        this.rovers = this.getRovers();

        this.getMarkers = function (markerCount) {
            var markers = [];
            for (var i = 1; i < markerCount + 1; i++) {
                markers.push({ id: i, found: false });
            }
            return markers;
        };
        this.markers = this.getMarkers(6);


        wamp.onopen = function (session) {
            console.log('Autobahn connected: ' + session.id);
            stationController.session = session;
            leap.initialize(stationController.rovers);

            for (var rover of stationController.rovers) {
                rover.initialize(session);
                // TODO Fix scope
                initializeAr(rover.getCameraElement(), stationController.markers);
            }
        };

        wamp.ondisconnect = function () {
            console.log('Autobahn disconnected');
        };

        wamp.open();
    });

    app.directive('rover', function () {
        return {
            restrict: 'E',
            templateUrl: 'rover.html',
            controller: function ($scope, $element) {
                var rover = $scope.rover;

                rover.initialize = function (session) {
                    rover.session = session;

                    console.log('Initializing rover ' + this.id);
                    session.subscribe('mars.rover.' + this.id + '.heartbeat', function () {
                        $scope.$apply(function () {
                            rover.heartbeat = Math.round(new Date().getTime() / 1000);
                        });
                    });
                    session.subscribe('mars.rover.' + this.id + '.sensors', function (sensors) {
                        $scope.$apply(function () {
                            rover.sensors = sensors[0];
                        });
                    });

                    var motorControls = $element[0].querySelectorAll('.motor');
                    var leftMotorEl = $element[0].querySelector('.motor-left');
                    var rightMotorEl = $element[0].querySelector('.motor-right');
                    var updateMotorControls = function () {
                        var left = leftMotorEl.value;
                        var right = rightMotorEl.value;
                        rover.navigation.left = left;
                        rover.navigation.right = right;
                        rover.session.publish('mars.rover.' + rover.id + '.navigation', [left, right]);
                    };
                    for (var motorControl of motorControls) {
                        motorControl.addEventListener('change', updateMotorControls);
                    }
                };
                rover.getCameraElement = function () {
                    return $element[0].querySelector('.camera-container');
                };

                $scope.debug = function () {
                    for (var el of $element[0].querySelectorAll('.camera-layer')) {
    					el.style.display = (el.style.display === 'none') ? 'inherit' : 'none';
    				}
                };

                $scope.shutdown = function () {
                    rover.session.publish('mars.rover.' + rover.id + '.shutdown');
                };
            },
            controllerAs: 'roverCtl',
        };
    });

    app.directive('marker', function () {
        return {
            restrict: 'E',
            templateUrl: 'marker.html',
            controller: function ($scope, $element) {
                var marker = $scope.marker;
            },
            controllerAs: 'markerCtl',
        };
    });

})();
