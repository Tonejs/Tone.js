require.config({
	baseUrl:"./",
	paths : {
		"Tone" : "../Tone",
	},
});

require({FILES}, function(Test){
	Test.run(); 
});