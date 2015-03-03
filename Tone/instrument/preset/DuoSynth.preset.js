define(["Tone/core/Tone", "Tone/instrument/DuoSynth"], function(Tone){

	/**
	 *  named presets for the DuoSynth
	 *  @const
	 *  @static
	 *  @type {Object}
	 */
	Tone.DuoSynth.prototype.preset = {
		"Steely" : {
			"vibratoAmount" : 0.0,
			"vibratoRate" : 5,
			"vibratoDelay" : 1,
			"portamento" : 0,
			"harmonicity" : 1.99,
			"voice0" : {
				"volume" : -8,
				"portamento" : 0,
				"oscillator" : {
					"type" : "square"
				},
				"filter" : {
					"Q" : 2,
					"type" : "lowpass",
					"rolloff" : -12
				},
				"envelope" : {
					"attack" : 0.01,
					"decay" : 1,
					"sustain" : 0,
					"release" : 0.4
				},
				"filterEnvelope" : {
					"attack" : 0.001,
					"decay" : 0.01,
					"sustain" : 0.35,
					"release" : 1,
					"min" : 20,
					"max" : 8000
				}
			},
			"voice1" : {
				"volume" : -1,
				"portamento" : 0,
				"oscillator" : {
					"type" : "sine"
				},
				"filter" : {
					"Q" : 2,
					"type" : "lowpass",
					"rolloff" : -12
				},
				"envelope" : {
					"attack" : 0.25,
					"decay" : 4,
					"sustain" : 0,
					"release" : 0.8
				},
				"filterEnvelope" : {
					"attack" : 0.03,
					"decay" : 0.25,
					"sustain" : 0.7,
					"release" : 1,
					"min" : 1000,
					"max" : 2500
				}
			}
		},
		"Unicorn" : {
			"vibratoAmount" : 0.5,
			"vibratoRate" : 5,
			"vibratoDelay" : 1,
			"portamento" : 0.1,
			"harmonicity" : 1.005,
			"voice0" : {
				"volume" : -2,
				"portamento" : 0,
				"oscillator" : {
					"type" : "sawtooth"
				},
				"filter" : {
					"Q" : 1,
					"type" : "lowpass",
					"rolloff" : -24
				},
				"envelope" : {
					"attack" : 0.01,
					"decay" : 0.25,
					"sustain" : 0.4,
					"release" : 1.2
				},
				"filterEnvelope" : {
					"attack" : 0.001,
					"decay" : 0.05,
					"sustain" : 0.3,
					"release" : 2,
					"min" : 100,
					"max" : 10000
				}
			},
			"voice1" : {
				"volume" : -10,
				"portamento" : 0,
				"oscillator" : {
					"type" : "sawtooth"
				},
				"filter" : {
					"Q" : 2,
					"type" : "bandpass",
					"rolloff" : -12
				},
				"envelope" : {
					"attack" : 0.25,
					"decay" : 4,
					"sustain" : 0.1,
					"release" : 0.8
				},
				"filterEnvelope" : {
					"attack" : 0.05,
					"decay" : 0.05,
					"sustain" : 0.7,
					"release" : 2,
					"min" : 5000,
					"max" : 2000
				}
			}
		},
		"Organic" : {
			"vibratoAmount": 0.3,
			"vibratoRate": 3.5,
			"harmonicity": 1.5,
			"voice0": {
				"volume" : -6,
				"oscillator": {
					"frequency": 0,
					"type": "sine",
				},
				"filter": {
					"type": "lowpass",
					"rolloff": -12,
					"Q": 2.8,
				},
				"envelope": {
					"attack": 0.0070,
					"decay": 0,
					"sustain": 1,
					"release": 0.056682076
				},
				"filterEnvelope": {
					"min": 219.80,
					"max": 1049.54942,
					"exponent": 2,
					"attack": 0.00704,
					"decay": 0.0278,
					"sustain": 0.065,
					"release": 0.0749
				},
			},
			"voice1": {
				"volume" : -20,
				"oscillator": {
					"type": "sine",
				},
				"filter": {
					"type": "highpass",
					"rolloff": -12,
					"Q": 4.55,
				},
				"envelope": {
					"attack": 0.011,
					"decay": 0.016,
					"sustain": 0.7464,
					"release": 0.074
				},
				"filterEnvelope": {
					"min": 298.20,
					"max": 80.43,
					"exponent": 2,
					"attack": 0.0035,
					"decay": 0.0060,
					"sustain": 1,
					"release": 0.108
				},
			},
			"portamento": 0
		}
	};


	return Tone.DuoSynth.prototype.preset;
});