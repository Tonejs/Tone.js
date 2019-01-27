const glob = require("glob");
const { resolve, relative } = require("path");
const fs = require("fs");

/**
 *  COLLECT DEPENDENCIES
 */
function collectDependencies(){
	const files = glob.sync(resolve(__dirname, "../Tone/!(shim)/!(Tone).js"));
	const modules = files.map(f => f.slice(0, -3));
	let reqString = modules.map(r => {
		const relativePath = relative(resolve(__dirname, "../Tone"), r);
		// const exportName = r.split("/")[r.split("/").length - 1];
		// return `export { default as ${exportName} } from "./${relativePath}";`;
		// return `import "./${relativePath}";`;
		return `require("./${relativePath}");`;
	}).join("\n");
	// reqString += "\nexport { default } from \"./core/Tone\";\n";
	reqString += "\nmodule.exports = require(\"./core/Tone\").default;\n";
	fs.writeFileSync(resolve(__dirname, "../Tone/index.js"), reqString);
}

collectDependencies();
