require.config({
	baseUrl:"./",
	paths : {
		"Tone" : "../Tone",
	},
});

require(["Test", "Test/core/Gain"], function(Test){
	Test.run(); 
});