(function () {
  var app = angular.module('mars', []);

  app.value('serverConfig', {
    url: 'ws://127.0.0.1:8080/ws',
    //url: 'ws://192.168.0.200:8080/ws',
    realm: 'mars'
  });

  app.service('wamp', function (serverConfig) {
    var connection = new autobahn.Connection(serverConfig);
    return connection;
  });

  app.controller('StationController', function (wamp) {
    var stationController = this;
    this.rovers = rovers;

    wamp.onopen = function (session) {
      console.log('Autobahn connected: ' + session.id);
      stationController.session = session;

      for (var i = 0; i < stationController.rovers.length; i++) {
        stationController.rovers[i].initialize(session);
      }
    };

    wamp.ondisconnect = function () {
      console.log('Autobahn disconnected');
    };

    wamp.open();

    this.getRovers = function () {
    };
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
            rover.heartbeat = Date();
          });
          session.subscribe('mars.rover.' + this.id + '.sensors', function (sensors) {
            rover.sensors = sensors[0];
          });

          var motorControls = $element[0].querySelectorAll('.motor');
          console.dir(motorControls);
          var leftMotorEl = $element[0].querySelector('.motor-left');
          var rightMotorEl = $element[0].querySelector('.motor-right');
          for (var i = 0; i < motorControls.length; i++) {
            motorControls[i].addEventListener('change', function () {
              console.log('changing motor');
              var left = leftMotorEl.value;
              var right = rightMotorEl.value;
              rover.navigation.left = left;
              rover.navigation.right = right;
              rover.session.publish('mars.rover.' + rover.id + '.navigation', [left, right]);
            });
          }
        };

        $scope.shutdown = function () {
          rover.session.publish('mars.rover.' + rover.id + '.shutdown');
        };
      },
      controllerAs: 'roverCtl',
    };
  });

  var rovers = [
    {
      id: 1,
      heartbeat: '',
      sensors: { 
        range: 0,
        camera: {
          uri: 'http://192.168.0.201/html/cam_pic_new.php?pDelay=40000'
        }
      },
      navigation: {
        left: 0,
        right: 0
      }
    },
    {
      id: 2,
      heartbeat: '',
      sensors: { 
        range: 0,
        camera: {
          uri: 'http://192.168.0.202/html/cam_pic_new.php?pDelay=40000'
        }
      },
      navigation: {
        left: 0,
        right: 0
      }
    }
  ];

})();
