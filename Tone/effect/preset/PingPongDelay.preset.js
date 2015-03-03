define(["Tone/core/Tone", "Tone/effect/PingPongDelay"], function(Tone){

	/**
	 *  named presets for PingPongDelay
	 *  @const
	 *  @static
	 *  @type {Object}
	 */
	Tone.PingPongDelay.prototype.preset = {
		"SlowSteady" : {
			"delayTime" : "4n", 
			"feedback" : 0.2
		},
		"ThickStereo" : {
			"delayTime" : "16t", 
			"feedback" : 0.3
		},
		"RhythmicDelay" : {
			"delayTime" : "8n", 
			"feedback" : 0.6
		},
	};

	return Tone.PingPongDelay.prototype.preset;
});