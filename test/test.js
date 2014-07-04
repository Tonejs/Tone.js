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
// var allTests = ["tests/Core", "tests/Signal"];

require(allTests, function(){
	//mobile browsers will not start hte audio context without users input
	var startButton = document.querySelector("button");
	startButton.onclick = function(){
		mocha.run();
		startButton.remove(); 
	};
});