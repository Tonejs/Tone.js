define(["Tone/core/Tone", "Tone/instrument/MonoSynth"], function(Tone){

	/**
	 *  named presets for the MonoSynth
	 *  @const
	 *  @static
	 *  @type {Object}
	 */
	Tone.MonoSynth.preset = {
		"PanFluteSteelDrum" : {
			"portamento" : 0.05,
			"oscType" : "square",
			"detune" : 20,
			"filter" : {
				"Q" : 6,
				"type" : "lowpass"
			},
			"envelope" : {
				"attack" : 0.005,
				"decay" : 0.1,
				"sustain" : 0.9,
				"release" : 1
			},
			"filterEnvelope" : {
				"attack" : 0.06,
				"decay" : 0.2,
				"sustain" : 0.5,
				"release" : 2,
				"min" : 10,
				"max" : 4000
			}
		},
		"CasioPiano" : {
			"portamento" : 0.00,
			"oscType" : "sine",
			"detune" : 0,
			"filter" : {
				"Q" : 3,
				"type" : "lowpass"
			},
			"envelope" : {
				"attack" : 0.005,
				"decay" : 0.1,
				"sustain" : 0.9,
				"release" : 0.2
			},
			"filterEnvelope" : {
				"attack" : 0.06,
				"decay" : 0.2,
				"sustain" : 1,
				"release" : 2,
				"min" : 10,
				"max" : 8000
			}
		}
	};

	return Tone.MonoSynth.preset;
});