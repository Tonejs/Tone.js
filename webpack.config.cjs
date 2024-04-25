/* eslint-disable @typescript-eslint/no-var-requires */
const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");

// /////////////////////////////////////
// Defaults
// /////////////////////////////////////

const defaults = {
	mode: "development",
	context: __dirname,
	entry: {
		Tone: "./Tone/index.ts",
	},
	output: {
		path: path.resolve(__dirname, "build"),
		filename: "[name].js",
		library: "Tone",
		libraryTarget: "umd",
		globalObject: "typeof self !== 'undefined' ? self : this",
	},
	resolve: {
		extensions: [".ts", ".js"]
	},
	module: {
		rules: [
			{
				test: /\.ts$/,
				use: "ts-loader",
				exclude: /(node_modules)/,
			}
		]
	},
	devtool: "cheap-source-map",
};

// /////////////////////////////////////
// Scratch
// /////////////////////////////////////

const scratch = Object.assign({}, defaults, {
	entry: {
		scratch: "./examples/scratch.ts",
	},
	plugins: [
		new HtmlWebpackPlugin({
			template: "./examples/scratch.html"
		})
	],
});

// /////////////////////////////////////
// Tests
// /////////////////////////////////////

const test = Object.assign({}, defaults, {
	entry: {
		test: "./test/test.js",
	},
	plugins: [
		new HtmlWebpackPlugin({
			filename: "test.html",
			template: "./test/index.html",
		})
	],
});

// /////////////////////////////////////
// Production
// /////////////////////////////////////

const production = Object.assign({}, defaults, {
	mode: "production",
	devtool: "source-map",
});

module.exports = env => {
	if (env.test) {
		return test;
	} else if (env.production) {
		return production;
	} else {
		return scratch;
	}
};
