define(["Tone/core/Tone", "Tone/effect/AutoWah"], function(Tone){

	/**
	 *  named presets for the AutoWah
	 *  @const
	 *  @static
	 *  @type {Object}
	 */
	Tone.AutoWah.prototype.preset = {
		"talker" : {
			"baseFrequency" : 100,
			"octaves" : 4,
			"sensitivity" : 0,
			"Q" : 2,
			"gain" : 10,
			"rolloff" : -12,
			/** attributes for the envelope follower */
			"follower" : {
				"attack" : 0.05,
				"release" : 0.2
			}
		},
		"yes" : {
			"baseFrequency" : 250,
			"octaves" : 5,
			"sensitivity" : 0,
			"Q" : 2,
			"gain" : 20,
			"rolloff" : -24,
			/** attributes for the envelope follower */
			"follower" : {
				"attack" : 0.1,
				"release" : 0.2
			}
		},
		"springy" : {
			"baseFrequency" : 10,
			"octaves" : 8,
			"sensitivity" : 0,
			"Q" : 1,
			"gain" : 10,
			"rolloff" : -48,
			/** attributes for the envelope follower */
			"follower" : {
				"attack" : 0.02,
				"release" : 1
			}
		}
	};

	return Tone.AutoWah.prototype.preset;
});