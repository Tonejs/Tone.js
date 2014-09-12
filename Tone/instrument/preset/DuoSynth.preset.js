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
				"oscType" : "square",
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
				"oscType" : "sine",
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
				"oscType" : "sawtooth",
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
				"oscType" : "sawtooth",
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
		}
	};


	return Tone.DuoSynth.prototype.preset;
});