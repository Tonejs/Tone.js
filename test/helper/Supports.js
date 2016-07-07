define(["helper/ua-parser"], function (UserAgentParser) {

	var parsed = new UserAgentParser().getBrowser();

	var name = parsed.name;

	var version = parseInt(parsed.major);

	function is(browser, above){
		above = above || 0;
		return name === browser && version >= above;
	}

	function isnt(browser, below){
		below = below || Infinity;
		return !(name === browser && version <= below);
	}

	return {
		//setValueCurveAtTime interpolates
		INTERPOLATED_VALUE_CURVE : is("Chrome", 46),
		//waveshaper has correct value at 0
		WAVESHAPER_0_POSITION : isnt("Safari"),
		//has stereo panner node
		STEREO_PANNER_NODE : isnt("Safari"),
		//can schedule a mixture of curves correctly
		ACCURATE_SIGNAL_SCHEDULING : is("Chrome"),
		//can disconnect from a specific node
		NODE_DISCONNECT : is("Chrome", 50),
		//stereo panner is equal power panning
		EQUAL_POWER_PANNER : isnt("Firefox"),
		//doesn't seem to support the pluck synth
		PLUCK_SYNTH : isnt("Safari"),
		//has float time domain analyser
		ANALYZE_FLOAT_TIME_DOMAIN : AnalyserNode && typeof AnalyserNode.prototype.getFloatTimeDomainData === "function",

	};
});