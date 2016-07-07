(function(root, factory){

	//UMD
	if ( typeof define === "function" && define.amd ) {
		define(function() {
			return factory();
		});
	} else if (typeof module === "object") {
		module.exports = factory();
 	} else {
		root.Tone = factory();
	}

}(this, function(){

	"use strict";
	
	var Tone;
	//constructs the main Tone object
	function Main(func){
		Tone = func();
	}
	//invokes each of the modules with the main Tone object as the argument
	function Module(func){
		func(Tone);
	}