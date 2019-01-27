import UserAgentParser from "ua-parser-js";

var parsed = new UserAgentParser().getBrowser();

var name = parsed.name;

var version = parseInt(parsed.major);

function is(browser, above){
	above = above || 0;
	return name.includes(browser) && version >= above;
}

function isnt(browser, below){
	below = below || Infinity;
	return !(name.includes(browser) && version <= below);
}

function isntVersion(browser, version){
	return !(name.includes(browser) && version === version);
}

export default {
	//can disconnect from a specific node
	NODE_DISCONNECT : is("Chrome", 50),
	//doesn't seem to support the pluck synth
	PLUCK_SYNTH : isnt("Safari"),
	//offline rendering matches Chrome closely
	//chrome is the platform the files were rendered on
	//so it is the default for continuity testing
	CHROME_AUDIO_RENDERING : is("Chrome"),
	//has float time domain analyser
	ANALYZE_FLOAT_TIME_DOMAIN : AnalyserNode && typeof AnalyserNode.prototype.getFloatTimeDomainData === "function",
	//if the tests run in focus
	ONLINE_TESTING : isntVersion("Chrome", 71),
	//the close method resolves a promise
	AUDIO_CONTEXT_CLOSE_RESOLVES : isnt("Firefox") && isnt("Safari", 10),
	//if it supports gUM testing
	GET_USER_MEDIA : isnt("Safari"),
	RUN_EXAMPLES : isnt("Safari", 10)
};

