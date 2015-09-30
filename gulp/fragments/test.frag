require.config({
	baseUrl:"./",
	paths : {
		"Tone" : "../Tone",
		"Test" : "helper/Test"
	},
});

window.MANUAL_TEST = false;

require({FILES}, function(Test){
	Test.run(); 
});