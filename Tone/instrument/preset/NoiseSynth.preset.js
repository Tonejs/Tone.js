define(["Tone/core/Tone", "Tone/instrument/NoiseSynth"], function(Tone){

	/**
	 *  named presets for the NoiseSynth
	 *  @const
	 *  @static
	 *  @type {Object}
	 */
	Tone.NoiseSynth.prototype.preset = {
		"LaserWind" : {
			"noise": {
				"type": "white",
			},
			"filter": {
				"type": "highpass",
				"rolloff": -24,
				"Q": 6,
			},
			"envelope": {
				"attack": 0.005,
				"decay": 0.1,
				"sustain": 0,
				"release": 1
			},
			"filterEnvelope": {
				"min": 20,
				"max": 4000,
				"exponent": 2,
				"attack": 0.06,
				"decay": 0.2,
				"sustain": 0,
				"release": 2
			}
		},
		"WindWind" : {
			"noise": {
				"type": "brown",
			},
			"filter": {
				"type": "lowpass",
				"rolloff": -24,
				"Q": 6,
			},
			"envelope": {
				"attack": 0.033,
				"decay": 0.15,
				"sustain": 0.38,
				"release": 1
			},
			"filterEnvelope": {
				"min": 1509.08,
				"max": 3976.53,
				"exponent": 2,
				"attack": 0.61,
				"decay": 0.76,
				"sustain": 0.20,
				"release": 0.33
			}
		},
		"Snare" : {
			"noise": {
				"type": "pink",
			},
			"filter": {
				"type": "highpass",
				"frequency": 0,
				"rolloff": -12,
				"Q": 3.7,
				"gain": 0
			},
			"envelope": {
				"attack": 0.024,
				"decay": 0.111,
				"sustain": 0,
				"release": 0.22
			},
			"filterEnvelope": {
				"min": 819.20,
				"max": 3510.98,
				"exponent": 2,
				"attack": 0.002,
				"decay": 0.02,
				"sustain": 0.02,
				"release": 0.013
			}
		}
	};

	return Tone.NoiseSynth.prototype.preset;
});