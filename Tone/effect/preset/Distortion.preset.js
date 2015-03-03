define(["Tone/core/Tone", "Tone/effect/Distortion"], function(Tone){

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