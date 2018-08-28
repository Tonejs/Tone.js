const glob = require("glob");
const fs = require("fs");
const { resolve } = require("path");
const argv = require("yargs")
	.alias("i", "file")
	.alias("d", "dir")
	.argv;

/**
 *  COLLECT TESTS
 */
function collectTests(){
	return new Promise((done, error) => {
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
