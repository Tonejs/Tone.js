define(["Tone/core/Tone", "Tone/effect/Chorus"], function(Tone){

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