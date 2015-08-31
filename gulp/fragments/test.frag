require.config({
	baseUrl:"./",
	paths : {
		"Tone" : "../Tone",
		"Test" : "helper/Test"
	},
});

require({FILES}, function(Test){
	Test.run(); 
});