require.config({
	baseUrl:"./",
	paths : {
		"Tone" : "../Tone",
		"chai" : "./testDeps/chai",
	}
});

require(["tests/Timing", "tests/Signal", "tests/Math", "tests/Transport", "tests/Sources"], function(){
	mocha.run(); 
});