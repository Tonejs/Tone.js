define(["Tone/core/Tone", "Tone/effect/Chebyshev"], function(Tone){

	/**
	 *  named presets for the Chebyshev
	 *  @const
	 *  @static
	 *  @type {Object}
	 */
	Tone.Chebyshev.prototype.preset = {
		"Hornsy" : {
			"order" : 50,
			"oversample" : "none"
		},
		"Peaker" : {
			"order" : 11,
			"oversample" : "2x"
		},
		"CoinOperated" : {
			"order" : 108,
			"oversample" : "none"
		}
	};

	return Tone.Chebyshev.prototype.preset;
});