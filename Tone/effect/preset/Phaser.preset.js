define(["Tone/core/Tone", "Tone/effect/AutoWah"], function(Tone){

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
			"stages" : 4,
			"Q" : 2,
			"baseFrequency" : 700,
			"feedback" : 0
		},
		"landing" : {
			"rate" : 0.5,
			"depth" : 1.2,
			"stages" : 12,
			"Q" : 20,
			"baseFrequency" : 800,
			"feedback" : 0.9
		},
		"bubbles" : {
			"rate" : 4.5,
			"depth" : 0.4,
			"stages" : 6,
			"Q" : 2,
			"baseFrequency" : 300,
			"feedback" : 0.6
		}
	};

	return Tone.Phaser.prototype.preset;
});