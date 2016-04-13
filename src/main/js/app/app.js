(function () {
    var app = angular.module('mars', ['mars.rover', 'mars.ar', 'mars.leap', 'mars.util']);

    app.config(function (leapProvider, wampProvider, timerProvider) {
        leapProvider.config({
        	precision: 1,
        	min: -50,
        	max: 100,
        	stopZone: [-20, 30]
        });
        wampProvider.config({
            //url: 'ws://127.0.0.1:8080/ws',
            url: 'ws://192.168.1.200:8080/ws',
            realm: 'mars',
        });
        timerProvider.setElement(document.querySelector('#time'));
    });

    app.controller('StationController', function (ar, leap, wamp, timer) {
        var stationController = this;

        this.getRover = function () {
            // TODO Remove after testing
            var id = document.querySelector('#rover-id').value;
            var cameraUri = 'http://192.168.1.20' + id + '/html/cam_pic_new.php?pDelay=40000';
            var rover = {
                id: id,
                heartbeat: '',
                sensors: {
                    range: 0,
                    camera: {
                        uri: cameraUri
                    }
                },
                navigation: {
                    left: 0,
                    right: 0
                }
            };
            return rover;
        };

        wamp.onopen = function (session) {
            console.log('Autobahn connected: ' + session.id);

            var rover = stationController.rover;
            rover.initialize();
            rover.wampSubscribe(session);
            leap.start(rover);
            ar.start(rover);
        };
        wamp.ondisconnect = function () {
            console.log('Autobahn disconnected');
        };

        this.rover = this.getRover();

        timer.start();
        wamp.open();
    });
})();
