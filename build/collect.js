//currently dependency is managed by specifiying the order
//will need another solution

var fs = require("fs");

function main() {

	"use strict";

	console.log('* Collecting Files');

	var srcFolder = "../src/";

	var outputFile = "../src/main.js";
	

	var dependencies = [];

	var topLevel = fs.readdirSync(srcFolder);
	for (var i = 0; i < topLevel.length; i++){
		var nested = topLevel[i];
		if (nested.charAt(0) !== "."){
			var nestedFiles = fs.readdirSync(srcFolder + nested);
			for (var j = 0; j < nestedFiles.length; j++){
				var file = nestedFiles[j];
				if (file.charAt(0) !== "."){
					var noJS = file.substring(0, file.length - 3);
					dependencies.push(nested + "/" + noJS);
				} 
			}
		} 
	}

	//make an output file
	var outputText = "require(["
	//add all of the dependencies
	for (var i = 0; i < dependencies.length; i++){
		outputText += ['"', dependencies[i], '"' ].join("");
		if (i < dependencies.length - 1){
			outputText += ", ";
		}
	}
	outputText += "], function(){});"
	fs.writeFileSync(outputFile, outputText);

}

main();
// process.exit(0);