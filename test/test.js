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

var recorderDelay = 0.5;
var recorderDuration = 0.1;
var maxTimeout = 1000;

var allTests = ["tests/Core", "tests/Timing", "tests/Signal", "tests/SignalComparison", 
"tests/SignalMath", "tests/Transport", "tests/Sources", "tests/Components", "tests/Effect"];
// var allTests = ["tests/Core", "tests/SignalComparison"];

require(allTests, function(){
	mocha.run(); 
});