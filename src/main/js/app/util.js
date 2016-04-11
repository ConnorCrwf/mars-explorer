(function () {
    var module = angular.module('mars.util', []);

    module.provider('wamp', function () {
        var _config = {};
        this.config = function (config) {
            _config = config;
        };
        this.$get = function () {
            var connection = new autobahn.Connection(_config);
            return connection;
        };
    });

    module.provider('timer', function () {
        var warningTimeSec = 30;
        var timeout;
        var timerEl;
        var tick = function () {
            var timeValue = timerEl.value.split(":");
            var time = parseInt(timeValue[0]) * 60 + parseInt(timeValue[1]) - 1;
            time = (isNaN(time) || time < 0) ? 0 : time;

            if (time <= warningTimeSec) {
                timerEl.classList.add('text-warning');
            } else {
                timerEl.classList.remove('text-warning');
            }
            var minutes = Math.floor(time/60);
            var seconds = time % 60;
            minutes = (("" + minutes).length > 1) ? minutes : "0" + minutes;
            seconds = (("" + seconds).length > 1) ? seconds : "0" + seconds;
            timerEl.value = minutes + ":" + seconds;
        };

        this.setElement = function (el) {
            timerEl = el;
        };

        this.$get = ['$window', function ($window) {
            var that = this;
            return {
                start: function () {
                    timeout = $window.setInterval(tick, 1000);
                },
                stop: function () {
                    $window.clearTimeout(timeout);
                },
            };
        }];
    });
}());


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
