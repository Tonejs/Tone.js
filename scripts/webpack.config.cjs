const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");

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
		path: path.resolve(__dirname, "../build"),
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

// /////////////////////////////////////
// Scratch
// create a file called examples/scratch.ts to test things out locally
// /////////////////////////////////////

const scratch = Object.assign({}, defaults, {
	entry: {
		scratch: "../examples/scratch.ts",
	},
	output: {
		path: path.resolve(__dirname, "../scratch"),
		filename: "[name].js",
	},
	devtool: "source-map",
	plugins: [
		new HtmlWebpackPlugin({
			filename: "index.html",
		}),
	],
	devServer: {
		static: {
			directory: path.join(__dirname, "../scratch/"),
		},
		hot: true,
		port: 9000,
	},
});

module.exports = (env) => {
	if (env.test) {
		return test;
	} else if (env.production) {
		return production;
	} else if (env.scratch) {
		return scratch;
	}
};
