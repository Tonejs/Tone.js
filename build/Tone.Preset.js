define(["Tone/core/Tone", "Tone/effect/AutoWah"], function(Tone){

	/**
	 *  named presets for the AutoWah
	 *  @const
	 *  @static
	 *  @type {Object}
	 */
	Tone.AutoWah.prototype.preset = {
		"talker" : {
			"baseFrequency" : 100,
			"octaves" : 4,
			"sensitivity" : 0,
			"Q" : 2,
			"gain" : 10,
			"rolloff" : -12,
			/** attributes for the envelope follower */
			"follower" : {
				"attack" : 0.05,
				"release" : 0.2
			}
		},
		"yes" : {
			"baseFrequency" : 250,
			"octaves" : 5,
			"sensitivity" : 0,
			"Q" : 2,
			"gain" : 20,
			"rolloff" : -24,
			/** attributes for the envelope follower */
			"follower" : {
				"attack" : 0.1,
				"release" : 0.2
			}
		},
		"springy" : {
			"baseFrequency" : 10,
			"octaves" : 8,
			"sensitivity" : 0,
			"Q" : 1,
			"gain" : 10,
			"rolloff" : -48,
			/** attributes for the envelope follower */
			"follower" : {
				"attack" : 0.02,
				"release" : 1
			}
		}
	};

	return Tone.AutoWah.prototype.preset;
});
define(["Tone/core/Tone", "Tone/effect/Chorus"], function(Tone){

	/**
	 *  named presets for the Chorus
	 *  @const
	 *  @static
	 *  @type {Object}
	 */
	Tone.Chorus.prototype.preset = {
		"ether" : {
			"rate" : 0.3, 
			"delayTime" : 8,
			"type" : "triangle",
			"depth" : 0.8,
			"feedback" : 0.7
		},
		"harmony" : {
			"rate" : 12, 
			"delayTime" : 3.5,
			"type" : "sine",
			"depth" : 0.8,
			"feedback" : 0.2
		},
		"rattler" : {
			"rate" : "16n", 
			"delayTime" : 15,
			"type" : "square",
			"depth" : 0.2,
			"feedback" : 0.8
		}
	};

	return Tone.Chorus.prototype.preset;
});
define(["Tone/core/Tone", "Tone/effect/Freeverb"], function(Tone){

	/**
	 *  named presets for Freeverb
	 *  @const
	 *  @static
	 *  @type {Object}
	 */
	Tone.Freeverb.prototype.preset = {
		"sewer" : {
			"roomSize" : 0.8, 
			"dampening" : 0.05
		},
		"glassroom" : {
			"roomSize" : 0.6, 
			"dampening" : 0.9
		},
		"bigplate" : {
			"roomSize" : 0.9, 
			"dampening" : 0.2
		}
	};

	return Tone.Freeverb.prototype.preset;
});
define(["Tone/core/Tone", "Tone/effect/Phaser"], function(Tone){

	/**
	 *  named presets for the Phaser
	 *  @const
	 *  @static
	 *  @type {Object}
	 */
	Tone.Phaser.prototype.preset = {
		"testing" : {
			"rate" : 10,
			"depth" : 0.2,
			"Q" : 2,
			"baseFrequency" : 700,
			"feedback" : 0
		},
		"landing" : {
			"rate" : 4,
			"depth" : 1.2,
			"Q" : 20,
			"baseFrequency" : 800,
			"feedback" : 0.9
		},
		"bubbles" : {
			"rate" : 0.5,
			"depth" : 5,
			"Q" : 8,
			"baseFrequency" : 250,
			"feedback" : 0.5
		}
	};

	return Tone.Phaser.prototype.preset;
});
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
define(["Tone/core/Tone", "Tone/instrument/MonoSynth"], function(Tone){

	/**
	 *  named presets for the MonoSynth
	 *  @const
	 *  @static
	 *  @type {Object}
	 */
	Tone.MonoSynth.prototype.preset = {
		"Pianoetta" : {
			"portamento" : 0.0,
			"oscType" : "square",
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
			"oscType" : "triangle",
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
			"oscType" : "square",
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
			"oscType" : "sawtooth",
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
			"oscType" : "square",
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
		"Kick" : {
			"portamento" : 0.00,
			"oscType" : "square",
			"filter" : {
				"Q" : 2,
				"type" : "bandpass",
				"rolloff" : -12
			},
			"envelope" : {
				"attack" : 0.01,
				"decay" : 0.2,
				"sustain" : 0.0,
				"release" : 0.2
			},
			"filterEnvelope" : {
				"attack" : 0.01,
				"decay" : 0.2,
				"sustain" : 1,
				"release" : 0.4,
				"min" : 3000,
				"max" : 30
			}
		},
		"LaserSteps" : {
			"portamento" : 0.00,
			"oscType" : "sawtooth",
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