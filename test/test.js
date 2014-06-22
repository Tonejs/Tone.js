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

var allTests = ["tests/Core", "tests/Timing", "tests/Signal", "tests/Math", "tests/Transport", "tests/Sources"];
// var allTests = ["tests/Components"];

require(allTests, function(){
	mocha.run(); 
});