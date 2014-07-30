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

var allTests = ["tests/Core", "tests/Timing", "tests/Signal", "tests/SignalComparison", "tests/SignalMath", "tests/Math", "tests/Transport", "tests/Sources", "tests/Components"];
// var allTests = ["tests/Core", "tests/Timing", "tests/Transport"];

require(allTests, function(){
	mocha.run(); 
});