require.config({
	baseUrl:"./",
	paths : {
		"Tone" : "../Tone",
		"Test" : "helper/Test",
		"Examples" : "../examples/scripts/ExampleList"
	},
	shim: {
		"Examples" : {
			exports : "ExampleList"
		}
	}
});

window.MANUAL_TEST = false;

require({FILES}, function(Test){
	Test.run(); 
});