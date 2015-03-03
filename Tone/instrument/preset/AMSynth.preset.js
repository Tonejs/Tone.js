define(["Tone/core/Tone", "Tone/instrument/AMSynth"], function(Tone){

	/**
	 *  named presets for the AMSynth
	 *  @const
	 *  @static
	 *  @type {Object}
	 */
	Tone.AMSynth.prototype.preset = {
		"Sand" : {
			"harmonicity": 3,
			"carrier": {
				"oscillator": {
					"frequency": 0,
					"detune": 0,
					"type": "square",
					"phase": 0,
					"volume": 0
				},
				"filter": {
					"type": "highpass",
					"frequency": 0,
					"rolloff": -12,
					"Q": 0.93,
					"gain": 0
				},
				"envelope": {
					"attack": 0.003,
					"decay": 0.305,
					"sustain": 0.7,
					"release": 0.828
				},
				"filterEnvelope": {
					"min": 1509.0,
					"max": 7212.8,
					"exponent": 2,
					"attack": 0.0035,
					"decay": 0.0006,
					"sustain": 0.57,
					"release": 0.8
				},
				"portamento": 0
			},
			"modulator": {
				"oscillator": {
					"frequency": 0,
					"detune": 0,
					"type": "sine",
					"phase": 0,
					"volume": 0
				},
				"filter": {
					"type": "highpass",
					"frequency": 0,
					"rolloff": -12,
					"Q": 0.6,
					"gain": 0
				},
				"envelope": {
					"attack": 0.043,
					"decay": 0.13,
					"sustain": 0.047,
					"release": 0.040
				},
				"filterEnvelope": {
					"min": 1132.80,
					"max": 557.38,
					"exponent": 2,
					"attack": 0.17,
					"decay": 0.023,
					"sustain": 0.036,
					"release": 1
				},
				"portamento": 0
			},
			"portamento": 0
		}
	};


	return Tone.AMSynth.prototype.preset;
});