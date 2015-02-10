require.config({
	baseUrl:"./",
	paths : {
		"Tone" : "../Tone",
		"chai" : "./testDeps/chai",
		"Recorder" : "./testDeps/Tone.Recorder"
	},
});

var maxTimeout = 1000;

var allTests = ["tests/Core", "tests/Timing", "tests/Signal", "tests/SignalComparison", 
"tests/SignalMath", "tests/Transport", "tests/Sources", "tests/Components", 
"tests/Effect", "tests/Instruments", "tests/EffectPresets", "tests/InstrumentPresets", "tests/Expr"];
// var allTests = ["tests/Core", "tests/Signal"];

require(allTests, function(){
	mocha.run(); 
});