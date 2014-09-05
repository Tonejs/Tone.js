define(["Tone/core/Tone", "Tone/instrument/FMSynth"], function(Tone){

	/**
	 *  named presets for the FMSynth
	 *  @const
	 *  @static
	 *  @type {Object}
	 */
	Tone.FMSynth.prototype.preset = {
		"Trumpet" : {
			"portamento" : 0,
			"harmonicity" : 1,
			"modulationIndex" : 4,
			"carrier" : {
				"volume" : 0,
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
					"sustain" : 0.7,
					"release" : 0.4
				},
				"filterEnvelope" : {
					"attack" : 0.06,
					"decay" : 0.07,
					"sustain" : 0.35,
					"release" : 0.8,
					"min" : 3000,
					"max" : 6500
				}
			},
			"modulator" : {
				"volume" : -6,
				"portamento" : 0,
				"oscType" : "triangle",
				"filter" : {
					"Q" : 0,
					"type" : "lowpass",
					"rolloff" : -12
				},
				"envelope" : {
					"attack" : 0.15,
					"decay" : 0.3,
					"sustain" : 1,
					"release" : 1.5
				},
				"filterEnvelope" : {
					"attack" : 0.03,
					"decay" : 0.25,
					"sustain" : 0.7,
					"release" : 1,
					"min" : 20000,
					"max" : 20000
				}
			}
		},
		"Koto" : {
			"portamento" : 0,
			"harmonicity" : 3.01,
			"modulationIndex" : 12.7,
			"carrier" : {
				"volume" : 0,
				"portamento" : 0,
				"oscType" : "triangle",
				"filter" : {
					"Q" : 2,
					"type" : "lowpass",
					"rolloff" : -12
				},
				"envelope" : {
					"attack" : 0.01,
					"decay" : 2,
					"sustain" : 0,
					"release" : 0.8
				},
				"filterEnvelope" : {
					"attack" : 0.06,
					"decay" : 0.07,
					"sustain" : 0.35,
					"release" : 0.8,
					"min" : 20000,
					"max" : 20000
				}
			},
			"modulator" : {
				"volume" : -1,
				"portamento" : 0,
				"oscType" : "sine",
				"filter" : {
					"Q" : 0,
					"type" : "lowpass",
					"rolloff" : -12
				},
				"envelope" : {
					"attack" : 0.02,
					"decay" : 2,
					"sustain" : 0,
					"release" : 0.8
				},
				"filterEnvelope" : {
					"attack" : 0.03,
					"decay" : 0.25,
					"sustain" : 0.7,
					"release" : 1,
					"min" : 20000,
					"max" : 20000
				}
			}
		},
		"ScratchAttack" : {
			"portamento" : 0,
			"harmonicity" : 10,
			"modulationIndex" : 50,
			"carrier" : {
				"volume" : 0,
				"portamento" : 0,
				"oscType" : "square",
				"filter" : {
					"Q" : 2,
					"type" : "lowpass",
					"rolloff" : -12
				},
				"envelope" : {
					"attack" : 0.08,
					"decay" : 0.3,
					"sustain" : 0,
					"release" : 1.2
				},
				"filterEnvelope" : {
					"attack" : 0.01,
					"decay" : 0.1,
					"sustain" : 0,
					"release" : 0.2,
					"min" : 200,
					"max" : 10000
				}
			},
			"modulator" : {
				"volume" : -6,
				"portamento" : 0,
				"oscType" : "sine",
				"filter" : {
					"Q" : 1,
					"type" : "highpass",
					"rolloff" : -48
				},
				"envelope" : {
					"attack" : 0.1,
					"decay" : 0.2,
					"sustain" : 0.3,
					"release" : 0.01
				},
				"filterEnvelope" : {
					"attack" : 0.2,
					"decay" : 0.2,
					"sustain" : 0.8,
					"release" : 0.01,
					"min" : 20,
					"max" : 2000
				}
			}
		},
		"DistGit" : {
			"portamento" : 0,
			"harmonicity" : 1,
			"modulationIndex" : 10,
			"carrier" : {
				"volume" : 0,
				"portamento" : 0,
				"oscType" : "square",
				"filter" : {
					"Q" : 2,
					"type" : "lowpass",
					"rolloff" : -12
				},
				"envelope" : {
					"attack" : 0.001,
					"decay" : 3.3,
					"sustain" : 0,
					"release" : 1.2
				},
				"filterEnvelope" : {
					"attack" : 0.05,
					"decay" : 0.15,
					"sustain" : 1,
					"release" : 1.5,
					"min" : 400,
					"max" : 4000
				}
			},
			"modulator" : {
				"volume" : -3,
				"portamento" : 0,
				"oscType" : "sine",
				"filter" : {
					"Q" : 1,
					"type" : "lowpass",
					"rolloff" : -48
				},
				"envelope" : {
					"attack" : 0.3,
					"decay" : 0.4,
					"sustain" : 1,
					"release" : 1.7
				},
				"filterEnvelope" : {
					"attack" : 0.02,
					"decay" : 0.02,
					"sustain" : 0.1,
					"release" : 1.5,
					"min" : 200,
					"max" : 200
				}
			}
		},
	};


	return Tone.FMSynth.prototype.preset;
});