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

// var allTests = ["tests/WebAudio", "tests/Timing", "tests/Signal", "tests/Math", "tests/Transport", "tests/Sources"];
var allTests = ["tests/WebAudio", "tests/Sources"];

require(allTests, function(){
	mocha.run(); 
});