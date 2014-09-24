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