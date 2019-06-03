const { resolve } = require("path");
const { execSync } = require("child_process");
const { appendFileSync } = require("fs");

function generateTypeScriptDefinition(){
	//generate the d.ts file
	execSync(`./node_modules/.bin/jsdoc -c ${resolve(__dirname, "./.tsdoc.json")}`);

	//append an export to the end
	appendFileSync(resolve(__dirname, "../tone.d.ts"), "\nexport = Tone;");
}

generateTypeScriptDefinition();
