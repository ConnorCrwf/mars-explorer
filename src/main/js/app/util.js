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
            var hours = Math.floor(time/60);
            var minutes = time % 60;
            minutes = (("" + minutes).length > 1) ? minutes : "0" + minutes;
            timerEl.value = hours + ":" + minutes;
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
