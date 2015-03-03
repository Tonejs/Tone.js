define(["Tone/core/Tone", "Tone/effect/PluckSynth"], function(Tone){

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