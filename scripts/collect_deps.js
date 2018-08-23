const glob = require("glob");
const { resolve, relative } = require("path");
const fs = require("fs");

/**
 *  COLLECT DEPENDENCIES
 */
function collectDependencies(){
	return new Promise((done, error) => {
		//collect all of the files into one file prefixed with 'require'
		glob(resolve(__dirname, "../Tone/*/*.js"), (e, files) => {
			if (e){
				error(e);
			}
			const modules = files.filter(f => !f.includes("Tone/core/Tone"));
			//write it to disk
			// const relativePath = "./" + relative(resolve(__dirname, "../Tone"), modules[0]);
			let reqString = modules.map(r => `require("./${relative(resolve(__dirname, "../Tone"), r)}");`).join("\n");
			reqString += "\nmodule.exports = require(\"./core/Tone\");\n";
			fs.writeFile(resolve(__dirname, "../Tone/index.js"), reqString, e => {
				if (e){
					error(e);
				}
				done();
			});
		});
	});
}

collectDependencies();
