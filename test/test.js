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

function wasDisposed(obj, expect){
	for (var prop in obj){
		var member = obj[prop];
		if (typeof member !== "function" && 
			typeof member !== "string" && 
			typeof member !== "number" &&
			typeof member !== "boolean" &&
			!(member instanceof AudioContext)){
			expect(obj[prop]).to.equal(null);
		}
	}
}

var allTests = ["tests/Core", "tests/Timing", "tests/Signal", "tests/SignalComparison", 
"tests/SignalMath", "tests/Transport", "tests/Sources", "tests/Components", "tests/Effect", "tests/Instruments"];
// var allTests = ["tests/Core", "tests/Signal", "tests/Transport", "tests/Sources"];

require(allTests, function(){
	mocha.run(); 
});