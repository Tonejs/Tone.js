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

var maxTimeout = 1000;

var allTests = ["tests/Core", "tests/Timing", "tests/Signal", "tests/SignalComparison", 
"tests/SignalMath", "tests/Transport", "tests/Sources", "tests/Components", "tests/Effect", "tests/Instruments"];
// var allTests = ["tests/Core", "tests/Effect"];

require(allTests, function(){
	mocha.run(); 
});