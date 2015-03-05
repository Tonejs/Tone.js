define(["Tone/core/Tone", "Tone/effect/Freeverb"], function(Tone){

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