/* eslint-disable @typescript-eslint/no-var-requires */
const path = require("path");

// /////////////////////////////////////
// Defaults
// /////////////////////////////////////

const defaults = {
	mode: "development",
	context: __dirname,
	entry: {
		Tone: "../Tone/index.ts",
	},
	output: {
		path: path.resolve(__dirname, "../build/umd"),
		filename: "[name].js",
		library: "Tone",
		libraryTarget: "umd",
		globalObject: "typeof self !== 'undefined' ? self : this",
	},
	resolve: {
		extensionAlias: {
			".js": [".js", ".ts"],
		},
	},
	module: {
		rules: [
			{
				test: /\.ts$/,
				use: "ts-loader",
				exclude: /(node_modules)/,
			},
		],
	},
	devtool: "cheap-source-map",
};

// /////////////////////////////////////
// Production
// /////////////////////////////////////

const production = Object.assign({}, defaults, {
	mode: "production",
	devtool: "source-map",
});

module.exports = (env) => {
	if (env.test) {
		return test;
	} else if (env.production) {
		return production;
	} else {
		return scratch;
	}
};
