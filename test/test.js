require.config({
	baseUrl:"./",
	paths : {
		"Tone" : "../Tone",
		"chai" : "./testDeps/chai",
		"Recorder" : "./testDeps/recorder"
	},
	shim : {
		"Recorder" : {
			exports : "Recorder"
		}
	}
});

require(["tests/Timing", "tests/Signal", "tests/Math", "tests/Transport", "tests/Sources"], function(){
	if (window.mochaPhantomJS) { 
		mochaPhantomJS.run(); 
	} else { 
		mocha.run(); 
	}
});