define(["Tone/core/Tone", "Tone/instrument/MonoSynth"], function(Tone){

	/**
	 *  named presets for the MonoSynth
	 *  @const
	 *  @static
	 *  @type {Object}
	 */
	Tone.MonoSynth.prototype.preset = {
		"CoolGuy" : {
			"portamento" : 0.0,
			"oscillator" : {
				"type" : "pwm",
				"modulationFrequency" : 1
			},
			"filter" : {
				"Q" : 6,
				"type" : "lowpass",
				"rolloff" : -24 
			},
			"envelope" : {
				"attack" : 0.025,
				"decay" : 0.3,
				"sustain" : 0.9,
				"release" : 2
			},
			"filterEnvelope" : {
				"attack" : 0.245,
				"decay" : 0.131,
				"sustain" : 0.5,
				"release" : 2,
				"min" : 20,
				"max" : 3000
			}
		},
		"Pianoetta" : {
			"portamento" : 0.0,
			"oscillator" : {
				"type" : "square"
			},
			"filter" : {
				"Q" : 6,
				"type" : "lowpass",
				"rolloff" : -24 
			},
			"envelope" : {
				"attack" : 0.005,
				"decay" : 3,
				"sustain" : 0,
				"release" : 0.45
			},
			"filterEnvelope" : {
				"attack" : 0.001,
				"decay" : 0.32,
				"sustain" : 0.9,
				"release" : 3,
				"min" : 700,
				"max" : 3500
			}
		},
		"Barky" : {
			"portamento" : 0.01,
			"oscillator" : {
				"type" : "triangle"
			},
			"filter" : {
				"Q" : 3,
				"type" : "highpass",
				"rolloff" : -12
			},
			"envelope" : {
				"attack" : 0.05,
				"decay" : 0.15,
				"sustain" : 0.6,
				"release" : 1
			},
			"filterEnvelope" : {
				"attack" : 0.02,
				"decay" : 0.2,
				"sustain" : 0.8,
				"release" : 1.5,
				"min" : 3000,
				"max" : 250
			}
		},
		"Bassy" : {
			"portamento" : 0.08,
			"oscillator" : {
				"type" : "square"
			},
			"filter" : {
				"Q" : 4,
				"type" : "lowpass",
				"rolloff" : -24
			},
			"envelope" : {
				"attack" : 0.04,
				"decay" : 0.06,
				"sustain" : 0.4,
				"release" : 1
			},
			"filterEnvelope" : {
				"attack" : 0.01,
				"decay" : 0.1,
				"sustain" : 0.6,
				"release" : 1.5,
				"min" : 50,
				"max" : 350
			}
		},
		"BrassCircuit" : {
			"portamento" : 0.01,
			"oscillator" : {
				"type" : "sawtooth"
			},
			"filter" : {
				"Q" : 2,
				"type" : "lowpass",
				"rolloff" : -12
			},
			"envelope" : {
				"attack" : 0.1,
				"decay" : 0.1,
				"sustain" : 0.6,
				"release" : 0.5
			},
			"filterEnvelope" : {
				"attack" : 0.05,
				"decay" : 0.8,
				"sustain" : 0.4,
				"release" : 1.5,
				"min" : 2000,
				"max" : 5000
			}
		},
		"Pizz" : {
			"portamento" : 0.00,
			"oscillator" : {
				"type" : "square"
			},
			"filter" : {
				"Q" : 2,
				"type" : "highpass",
				"rolloff" : -24
			},
			"envelope" : {
				"attack" : 0.01,
				"decay" : 0.2,
				"sustain" : 0.0,
				"release" : 0.2
			},
			"filterEnvelope" : {
				"attack" : 0.01,
				"decay" : 0.1,
				"sustain" : 0.0,
				"release" : 0.1,
				"min" : 900,
				"max" : 500
			}
		},
		"LaserSteps" : {
			"portamento" : 0.00,
			"oscillator" : {
				"type" : "sawtooth"
			},
			"filter" : {
				"Q" : 2,
				"type" : "bandpass",
				"rolloff" : -24
			},
			"envelope" : {
				"attack" : 0.01,
				"decay" : 0.1,
				"sustain" : 0.2,
				"release" : 0.6
			},
			"filterEnvelope" : {
				"attack" : 0.02,
				"decay" : 0.4,
				"sustain" : 1,
				"release" : 0.2,
				"min" : 0,
				"max" : 7500
			}
		}
	};

	return Tone.MonoSynth.prototype.preset;
});