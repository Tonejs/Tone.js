//currently dependency is managed by specifiying the order
//will need another solution

var fs = require("fs");
var path = require("path");

function main() {

	"use strict";

	console.log('* Building Tone.js');

	var srcFolder = "../src/";

	//first the core
	var outputContents = fs.readFileSync( srcFolder + 'core/Tone.js', {encoding: 'utf8' });

	//then the components
	var components = fs.readdirSync(srcFolder + 'components');
	for (var i = 0; i < components.length; i++){
		var file = components[i];
		outputContents += fs.readFileSync( srcFolder + "components/" + file, {encoding: 'utf8' });		
	}

	//then the effects
	var effects = ["Effect.js", "FeedbackEffect.js", "FeedbackDelay.js", "PingPongDelay.js"];
	for (var i = 0; i < effects.length; i++){
		var file = effects[i];
		outputContents += fs.readFileSync( srcFolder + "effects/" + file, {encoding: 'utf8' });		
	}

	//write the output
	fs.writeFileSync("../Tone.js", outputContents);


	//and the GUI
	var GUIs = ["GUI.js", "GUI.Button.js", "GUI.Bar.js", "GUI.Fader.js", "GUI.Meter.js", 
		"GUI.ParamFader.js", "GUI.Transport.js", "GUI.GainFader.js", "GUI.Envelope.js", "GUI.Compressor.js"];

	var GUIouput = "";
	for (var i = 0; i < GUIs.length; i++){
		var file = GUIs[i];
		GUIouput += fs.readFileSync( srcFolder + "GUI/" + file, {encoding: 'utf8' });	
	}

	//write the GUI
	fs.writeFileSync("../Tone.GUI.js", GUIouput);
}

main();
// process.exit(0);