define(["Tone/core/Tone", "Tone/effect/JCReverb"], function(Tone){

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