(function (root) {
	
	"use strict";

	function TonePreset(func){
		func(root.Tone);
	}
	TonePreset( function(Tone){

		/**
		 *  named presets for the AutoWah
		 *  @const
		 *  @static
		 *  @type {Object}
		 */
		Tone.AutoWah.prototype.preset = {
			"Talker" : {
				"baseFrequency" : 100,
				"octaves" : 4,
				"sensitivity" : 0,
				"Q" : 2,
				"gain" : 10,
				"rolloff" : -12,
				"follower" : {
					"attack" : 0.05,
					"release" : 0.2
				}
			},
			"Yes" : {
				"baseFrequency" : 250,
				"octaves" : 5,
				"sensitivity" : 0,
				"Q" : 2,
				"gain" : 20,
				"rolloff" : -24,
				"follower" : {
					"attack" : 0.1,
					"release" : 0.2
				}
			},
			"Springy" : {
				"baseFrequency" : 10,
				"octaves" : 8,
				"sensitivity" : 0,
				"Q" : 1,
				"gain" : 10,
				"rolloff" : -48,
				"follower" : {
					"attack" : 0.02,
					"release" : 1
				}
			}
		};

		return Tone.AutoWah.prototype.preset;
	});
	TonePreset( function(Tone){

		/**
		 *  named presets for the Chebyshev
		 *  @const
		 *  @static
		 *  @type {Object}
		 */
		Tone.Chebyshev.prototype.preset = {
			"Hornsy" : {
				"order" : 50,
				"oversample" : "none"
			},
			"Peaker" : {
				"order" : 11,
				"oversample" : "2x"
			},
			"CoinOperated" : {
				"order" : 108,
				"oversample" : "none"
			}
		};

		return Tone.Chebyshev.prototype.preset;
	});
	TonePreset( function(Tone){

		/**
		 *  named presets for the Chorus
		 *  @const
		 *  @static
		 *  @type {Object}
		 */
		Tone.Chorus.prototype.preset = {
			"Ether" : {
				"rate" : 0.3, 
				"delayTime" : 8,
				"type" : "triangle",
				"depth" : 0.8,
				"feedback" : 0.2
			},
			"Harmony" : {
				"rate" : 12, 
				"delayTime" : 3.5,
				"type" : "sine",
				"depth" : 0.8,
				"feedback" : 0.1
			},
			"Rattler" : {
				"rate" : "16n", 
				"delayTime" : 15,
				"type" : "square",
				"depth" : 0.2,
				"feedback" : 0.3
			}
		};

		return Tone.Chorus.prototype.preset;
	});
	TonePreset( function(Tone){

		/**
		 *  named presets for Distortion
		 *  @const
		 *  @static
		 *  @type {Object}
		 */
		Tone.Distortion.prototype.preset = {
			"Clean" : {
				"distortion" : 0.08, 
				"oversample" : "4x"
			},
			"Thick" : {
				"distortion" : 0.6, 
				"oversample" : "none"
			},
			"Growl" : {
				"distortion" : 1.4, 
				"oversample" : "2x"
			}
		};

		return Tone.Distortion.prototype.preset;
	});
	TonePreset( function(Tone){

		/**
		 *  named presets for FeedbackDelay
		 *  @const
		 *  @static
		 *  @type {Object}
		 */
		Tone.FeedbackDelay.prototype.preset = {
			"DecayDelay" : {
				"delayTime" : "8n", 
				"feedback" : 0.4
			},
			"Minimalism" : {
				"delayTime" : "4n", 
				"feedback" : 0.7
			},
			"CounterPoints" : {
				"delayTime" : "8t", 
				"feedback" : 0.2
			},
		};

		return Tone.FeedbackDelay.prototype.preset;
	});
	TonePreset( function(Tone){

		/**
		 *  named presets for Freeverb
		 *  @const
		 *  @static
		 *  @type {Object}
		 */
		Tone.Freeverb.prototype.preset = {
			"Sewer" : {
				"roomSize" : 0.8, 
				"dampening" : 0.05
			},
			"Glassroom" : {
				"roomSize" : 0.6, 
				"dampening" : 0.9
			},
			"Bigplate" : {
				"roomSize" : 0.9, 
				"dampening" : 0.2
			}
		};

		return Tone.Freeverb.prototype.preset;
	});
	TonePreset( function(Tone){

		/**
		 *  named presets for the JCReverb
		 *  @const
		 *  @static
		 *  @type {Object}
		 */
		Tone.JCReverb.prototype.preset = {
			"QuickSlap" : {
				"roomSize" : 0.1,
			},
			"BounceHall" : {
				"roomSize" : 0.8,
			},
			"NotNormal" : {
				"roomSize" : 0.5,
			},
		};

		return Tone.JCReverb.prototype.preset;
	});
	TonePreset( function(Tone){

		/**
		 *  named presets for the Phaser
		 *  @const
		 *  @static
		 *  @type {Object}
		 */
		Tone.Phaser.prototype.preset = {
			"Testing" : {
				"rate" : 10,
				"depth" : 0.2,
				"Q" : 2,
				"baseFrequency" : 700,
			},
			"Landing" : {
				"rate" : 4,
				"depth" : 1.2,
				"Q" : 20,
				"baseFrequency" : 800,
			},
			"Bubbles" : {
				"rate" : 0.5,
				"depth" : 5,
				"Q" : 8,
				"baseFrequency" : 250,
			}
		};

		return Tone.Phaser.prototype.preset;
	});
	TonePreset( function(Tone){

		/**
		 *  named presets for PingPongDelay
		 *  @const
		 *  @static
		 *  @type {Object}
		 */
		Tone.PingPongDelay.prototype.preset = {
			"SlowSteady" : {
				"delayTime" : "4n", 
				"feedback" : 0.2
			},
			"ThickStereo" : {
				"delayTime" : "16t", 
				"feedback" : 0.3
			},
			"RhythmicDelay" : {
				"delayTime" : "8n", 
				"feedback" : 0.6
			},
		};

		return Tone.PingPongDelay.prototype.preset;
	});
	TonePreset( function(Tone){

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
	TonePreset( function(Tone){

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
	TonePreset( function(Tone){

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
					"oscillator" : {
						"type" : "triangle"
					},
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
					"oscillator" : {
						"type" : "triangle"
					},
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
					"oscillator" : {
						"type" : "sine"
					},
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
					"oscillator" : {
						"type" : "square"
					},
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
					"oscillator" : {
						"type" : "sine"
					},
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
					"oscillator" : {
						"type" : "square"
					},
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
					"oscillator" : {
						"type" : "sine"
					},
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
	TonePreset( function(Tone){

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
	TonePreset( function(Tone){

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
	TonePreset( function(Tone){

		/**
		 *  named presets for the PluckSynth
		 *  @const
		 *  @static
		 *  @type {Object}
		 */
		Tone.PluckSynth.prototype.preset = {
			"Glassy" : {
				"attackNoise": 4,
				"dampening": 9200,
				"resonance": 1
			},
			"Violin" : {
				"attackNoise": 8,
				"dampening": 3200,
				"resonance": 0.8
			},
			"Plucky" : {
				"attackNoise": 0.8,
				"dampening": 2600,
				"resonance": 0.54
			}
		};

		return Tone.PluckSynth.prototype.preset;
	});
} (this));