(function () {
    var module = angular.module('mars.rover', []);

    module.directive('rover', function () {
        var leftMotorEl, rightMotorEl;
        return {
            restrict: 'E',
            templateUrl: 'rover.html',
            controller: function ($scope, $element) {
                var rover = $scope.rover;

                rover.initialize = function () {
                    console.log('Initializing rover ' + this.id);

                    rover.createMarkers(8);

                    var motorControls = $element[0].querySelectorAll('.motor');
                    leftMotorEl = $element[0].querySelector('.motor-left');
                    rightMotorEl = $element[0].querySelector('.motor-right');
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

                rover.wampSubscribe = function (session) {
                    this.session = session;
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
                };

                rover.createMarkers = function (count) {
                    this.markers = [];
                    for (var i = 0; i < count; i++) {
                        this.markers.push({ id: i, found: false, time: 0 });
                    }
                };

                rover.getMotorElement = function (direction) {
                    switch (direction.toLowerCase()) {
                        case 'left':  return leftMotorEl;
                        case 'right': return rightMotorEl;
                        default:      return undefined;
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
                    if (!this.session) { return; }
                    rover.session.publish('mars.rover.' + rover.id + '.shutdown');
                };
            },
            controllerAs: 'roverCtl',
        };
    });

    module.directive('marker', function () {
        return {
            restrict: 'E',
            templateUrl: 'marker.html',
            controller: function ($scope, $element) {
                var marker = $scope.marker;
            },
            controllerAs: 'markerCtl',
        };
    });

}());
