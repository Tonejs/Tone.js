const glob = require("glob");
const fs = require("fs");
const { posix } = require("path");
const argv = require("yargs")
	.alias("i", "file")
	.alias("d", "dir")
	.argv;

/**
 *  COLLECT TESTS
 */
function collectTests(){
	var tests = "../test/!(helper|deps|examples|html)/*.js";
	if (typeof argv.file === "string"){
		tests = `../test/*/${argv.file}.js`;
	} else if (typeof argv.dir === "string"){
		tests = `../test/${argv.dir}/*.js`;
	}
	const files = glob.sync(posix.resolve(__dirname, tests));
	var reqString = files.map(r => `import "${r}";`).join("\n");
	fs.writeFileSync(posix.resolve(__dirname, "../test/test.js"), reqString);
}

collectTests();
