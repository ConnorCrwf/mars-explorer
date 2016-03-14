// Load libraries
try {
	var autobahn = require('autobahn');
	var leap = require('leap');
} catch (err) {
  console.error(err);
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

var config = {
	roverId: 1,
  precision: 1,
  min: -50,
  max: 100,
  stopZone: [-20, 30]
};

(function (config) {

	var leftMotor = document.querySelector('#left_motor' + config.roverId);
	var rightMotor = document.querySelector('#right_motor' + config.roverId);

	var previousMotorValues = [0, 0];
	var controllerOptions = {};
	leap.loop(controllerOptions, function(frame) {
		var motorValues = [0, 0];
		var handValues = [0, 0];
    var i;
		// Iterate over hands
		for (i = 0; i < frame.hands.length; i++) {
			var hand = frame.hands[i];
			var handIndex = (hand.type === 'left') ? 0 : 1;

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



		if (previousMotorValues[0] !== motorValues[0] || previousMotorValues[1] !== motorValues[1]) {
			console.log(handValues + " => " + motorValues);

			leftMotor.value = motorValues[0];
			rightMotor.value = motorValues[1];


			var event = new Event('change');
			leftMotor.dispatchEvent(event);
			//rightMotor.dispatchEvent(event);
		}

		previousMotorValues[0] = motorValues[0];
		previousMotorValues[1] = motorValues[1];
	});
}(config));
