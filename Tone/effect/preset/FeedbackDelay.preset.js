define(["Tone/core/Tone", "Tone/effect/FeedbackDelay"], function(Tone){

	/**
	 *  named presets for FeedbackDelay
	 *  @const
	 *  @static
	 *  @type {Object}
	 */
	Tone.FeedbackDelay.prototype.preset = {
		"DecayDelay" : {
			"delayTime" : "8n", 
			"feedback" : 0.4
		},
		"Minimalism" : {
			"delayTime" : "4n", 
			"feedback" : 0.7
		},
		"CounterPoints" : {
			"delayTime" : "8t", 
			"feedback" : 0.2
		},
	};

	return Tone.FeedbackDelay.prototype.preset;
});