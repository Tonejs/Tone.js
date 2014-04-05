//currently dependency is managed by specifiying the order
//will need another solution

var fs = require("fs");
var path = require("path");

function main() {

	"use strict";

	console.log('* Building Tone.js');

	var srcFolder = "../src/";

	var outputFile = "../Tone.js";
	//HEADER
	var now = new Date();
	fs.writeFileSync(outputFile, "// Tone.js Build "+now.toUTCString()+"\n\n");

	//first the core
	var outputContents = fs.readFileSync( srcFolder + 'core/Tone.js', {encoding: 'utf8' });
	fs.appendFileSync(outputFile, outputContents)

	//then the signal
	var signal = fs.readdirSync(srcFolder + 'signal');
	for (var i = 0; i < signal.length; i++){
		var file = signal[i];
		if (file.charAt(0) !== "."){
			var outputContents = fs.readFileSync( srcFolder + "signal/" + file, {encoding: 'utf8' });		
			fs.appendFileSync(outputFile, outputContents);
		} 
	}

	//then the components
	var components = fs.readdirSync(srcFolder + 'component');
	for (var i = 0; i < components.length; i++){
		var file = components[i];
		if (file.charAt(0) !== "."){
			var outputContents = fs.readFileSync( srcFolder + "component/" + file, {encoding: 'utf8' });		
			fs.appendFileSync(outputFile, outputContents);
		} 
	}

	//then the effects
	var effects = ["Effect.js", "AutoPanner.js", "FeedbackEffect.js", "FeedbackDelay.js", "PingPongDelay.js"];
	for (var i = 0; i < effects.length; i++){
		var file = effects[i];
		var outputContents = fs.readFileSync( srcFolder + "effects/" + file, {encoding: 'utf8' });		
		fs.appendFileSync(outputFile, outputContents);
	}

	//then the composites
	var composites = [];
	for (var i = 0; i < composites.length; i++){
		var file = composites[i];
		var outputContents = fs.readFileSync( srcFolder + "composite/" + file, {encoding: 'utf8' });		
		fs.appendFileSync(outputFile, outputContents);
	}

}

main();
// process.exit(0);