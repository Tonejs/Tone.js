const glob = require("glob");
const fs = require("fs");
const { resolve } = require("path");
const argv = require("yargs")
	.alias("i", "file")
	.alias("d", "dir")
	.argv;

/**
 * Resolves a unix style variable on windows platforms
 * e.g.: $NODE_ENV => process.env.NODE_ENV
 * @param {string} variable variable received from argv
 */
function normalizeVariable(variable) {
	if (process.platform === "win32" && variable.startsWith("$")) {
		return process.env[variable.replace(/$\$/, "")];
	}
	return variable;
}

/**
 *  COLLECT TESTS
 */
function collectTests(){
	return new Promise((done, error) => {
		argv.file = normalizeVariable(argv.file);
		argv.dir = normalizeVariable(argv.dir);
		var tests = "../test/!(helper|deps|examples|html)/*.js";
		if (typeof argv.file === "string"){
			tests = `../test/*/${argv.file}.js`;
		} else if (typeof argv.dir === "string"){
			tests = `../test/${argv.dir}/*.js`;
		}
		glob(resolve(__dirname, tests), (e, files) => {
			if (e){
				error(e); 
			}
			var reqString = files.map(r => `require("${r}");`).join("\n");
			fs.writeFile(resolve(__dirname, "../test/test.js"), reqString, (e) => {
				if (e){
					error(e); 
				}
				done();
			});
		});
	});
}

collectTests();
