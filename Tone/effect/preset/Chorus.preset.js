define(["Tone/core/Tone", "Tone/effect/AutoWah"], function(Tone){

	/**
	 *  named presets for the AutoWah
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