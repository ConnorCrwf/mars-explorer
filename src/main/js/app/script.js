   var autobahn = require('autobahn');
try {
   var leap = require('leap');
} catch (e) {
   // when running in browser, AutobahnJS will
   // be included without a module system
}
    
// Setup Leap loop with frame callback function
function startLeap(session, i) {
    var left_motor = document.querySelector('#left_motor' + i);
    var right_motor = document.querySelector('#right_motor' + i);
    
    var controllerOptions = {};
    Leap.loop(controllerOptions, function(frame) {
        var motor_values = [0, 0];
        var hand_values = [0, 0];
        // Iterate over hands
        for (i = 0; i < frame.hands.length; i++) {
            var hand = frame.hands[i];
            var hand_index = (hand.type === 'left') ? 0 : 1;
            
            var PRECISION = 3;
            var MIN = -50;
            var MAX = 100;
            var STOP_ZONE = [-20, 30];
            
            
            var value = hand.sphereCenter[2].toFixed(PRECISION);
            hand_values[hand_index] = value;
            
            if (value > STOP_ZONE[0] && value < STOP_ZONE[1]) {
                value = 0;
            } else if (value >= STOP_ZONE[1]) {
                value = map(value, STOP_ZONE[1], MAX, 0, -1);
            } else {
                value = map(value, MIN, STOP_ZONE[0], 1, 0);
            }
            value = value.toFixed(PRECISION);
            motor_values[hand_index] = value;//map(hand.sphereCenter[2], -50, 75, 1, -1);
        }
        
        console.log(hand_values + " => " + motor_values);
        
        left_motor.value = motor_values[0];
        right_motor.value = motor_values[1];
        
        var event = new Event('change');
        left_motor.dispatchEvent(event);
        right_motor.dispatchEvent(event);
    });
}

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

var connection = new autobahn.Connection({
   url: 'ws://127.0.0.1:8080/ws',
   realm: 'mars'
});

connection.onopen = function (session) {
  //session.call("wamp.subscription.list").then(session.log, session.log);

  for (var i = 1; i < 2; i++) {
    makeRoverDiv(i);
    updateHeartbeat(session, i);
    updateSensors(session, i);
    handleShutdown(session, i);
    handleMotorUpdate(session, i);
    startLeap(session, i);
  }
};

function handleMotorUpdate(session, i) {
  var left_motor = document.querySelector('#left_motor' + i);
  var left_motor_label = document.querySelector('#left_motor_label' + i);
  var right_motor = document.querySelector('#right_motor' + i);
  var right_motor_label = document.querySelector('#right_motor_label' + i);

  var motor_controls = document.querySelectorAll('#rover' + i + ' input.motor');
  for (var j = 0; j < motor_controls.length; j++) {
    motor_controls[j].addEventListener('change', function () {
      var left = left_motor.value;
      var right = right_motor.value;
      left_motor_label.innerHTML = left;
      right_motor_label.innerHTML = right;
      session.publish('mars.rover.' + i + '.navigation', [left, right]);
    });

  }
  
}

function handleShutdown(session, i) {
  document.querySelector('#rover' + i + ' button').addEventListener('click', function () {
    session.publish('mars.rover.' + i + '.shutdown');
  });
}

function updateSensors(session, i) {
  var el = document.querySelector('#rover' + i + ' p.range');
  handler = function (data) {
    el.innerHTML = 'Range: ' + data[0].range;
  };
  session.subscribe('mars.rover.' + i + '.sensors', handler);
}

function updateHeartbeat(session, i) {
  var el = document.querySelector('#rover' + i + ' p.heartbeat');
  handler = function () {
    document.querySelector('#rover' + i + ' p').innerHTML = 'Last Heartbeat: ' + Date();
  };
  session.subscribe('mars.rover.' + i + '.heartbeat', handler);
}


function makeRoverDiv(i) {
    var div = document.createElement('div');
    div.id = 'rover' + i;
    document.body.appendChild(div);

    var name = document.createElement('h1');
    name.innerHTML = 'Rover ' + i;
    div.appendChild(name);

    var image = document.createElement('img');
    image.src = 'http://192.168.0.20' + i + '/html/cam_pic_new.php?pDelay=40000';
    image.alt = '[Rover ' + i + ' webcam]';
    div.appendChild(image);

    var heartbeat = document.createElement('p');
    heartbeat.classList.add('heartbeat');
    heartbeat.innerHTML = 'Last Heartbeat:';
    div.appendChild(heartbeat);

    var range = document.createElement('p');
    range.classList.add('range');
    range.innerHTML = 'Range:';
    div.appendChild(range);

    var left_motor = document.createElement('input');
    left_motor.classList.add('motor');
    left_motor.id = 'left_motor' + i;
    left_motor.type = 'range';
    left_motor.value = 0;
    left_motor.min = -1;
    left_motor.max = 1;
    left_motor.step = 0.01;
    div.appendChild(left_motor);
    var left_motor_label = document.createElement('label');
    left_motor_label.id = 'left_motor_label' + i;
    left_motor_label.for = 'left_motor' + i;
    left_motor_label.innerHTML = 0;
    div.appendChild(left_motor_label);

    var right_motor = document.createElement('input');
    right_motor.classList.add('motor');
    right_motor.id = 'right_motor' + i;
    right_motor.type = 'range';
    right_motor.value = 0;
    right_motor.min = -1;
    right_motor.max = 1;
    right_motor.step = 0.01;
    div.appendChild(right_motor);
    var right_motor_label = document.createElement('label');
    right_motor_label.id = 'right_motor_label' + i;
    right_motor_label.innerHTML = 0;
    right_motor_label['for'] = 'right_motor' + i;

    div.appendChild(right_motor_label);
    var shutdown = document.createElement('button');
    shutdown.innerHTML = 'Shutdown';
    div.appendChild(shutdown);
}

connection.ondisconnect = function (session) {
  session.log('done');
};

connection.open();
