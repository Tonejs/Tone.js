// Karma configuration
const path = require("path");
const argv = require("yargs")
	.option("grep", {
		default: "",
	})
	.argv;

let BROWSERS = ["HeadlessChrome", "HeadlessFirefox", "Safari"];

if (process.env.BROWSER === "chrome") {
	BROWSERS = ["HeadlessChrome"];
} else if (process.env.BROWSER === "firefox") {
	BROWSERS = ["HeadlessFirefox"];
} else if (process.env.BROWSER === "safari") {
	BROWSERS = ["Safari"];
} else {
	BROWSERS = ["HeadlessChrome", "HeadlessFirefox"];
}

module.exports = function(config) {
	const configuration = {

		// base path that will be used to resolve all patterns (eg. files, exclude)
		basePath : "../",

		// frameworks to use
		// available frameworks: https://npmjs.org/browse/keyword/karma-adapter
		frameworks : ["mocha", "karma-typescript"],

		// list of files / patterns to load in the browser
		files : [
			"test/**/*.ts",
			"Tone/**/*.ts",
			{ pattern : "test/audio/**", included : false },
			{ pattern : "test/html/**", included : false },
		],

		// Karma Typescript compiler options
		karmaTypescriptConfig: {
			compilerOptions : {
				// baseUrl: ".",
				// module: "commonjs",
				// paths : {
				// 	"../Tone" : ["./Tone"],
				// 	// "@tonejs/plot": ["./node_modules/@tonejs/plot/dist/index.d.ts"],
				// },
			},
			bundlerOptions: {
				resolve: {
					directories: ["Tone", "node_modules", "test"],
				},
			},
			coverageOptions : {
				exclude: /.*\.test\.ts$/i,
			},
			reports: {
				html: path.resolve(__dirname, "../coverage"),
				lcovonly: path.resolve(__dirname, "../coverage"),
			},
			tsconfig: "./tsconfig.json",
		},

		// list of files to exclude
		exclude : [
			"node_modules/*",
		],

		// preprocess matching files before serving them to the browser
		// available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
		preprocessors: {
			"**/*.ts": "karma-typescript",
			// "Tone/**/*.ts": "coverage",
		},

		// test results reporter to use
		// possible values: 'dots', 'progress'
		// available reporters: https://npmjs.org/browse/keyword/karma-reporter
		reporters : ["dots", "karma-typescript"],

		// coverageReporter : {
		// 	type : "lcov",
		// 	dir: path.resolve(__dirname, "../coverage"),
		// },

		//plugins
		plugins : [
			"karma-typescript",
			// "karma-coverage",
			"karma-mocha",
			"karma-chrome-launcher",
			"karma-firefox-launcher",
			"karma-safari-launcher",
			// "karma-sourcemap-loader",
		],

		client : {
			mocha : {
				grep: argv.grep,
				reporter : "html",
				timeout : 10000,
				ui : "bdd",
			},
		},

		// web server port
		port : 9876,

		// enable / disable colors in the output (reporters and logs)
		colors : true,

		// set the inactivity level to longer
		browserNoActivityTimeout : 40000,

		// level of logging
		// possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
		logLevel: config.LOG_ERROR,

		// enable / disable watching file and executing tests whenever any file changes
		autoWatch : false,
		// restartOnFileChange : true,

		// start these browsers
		// available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
		browsers : BROWSERS,

		// Continuous Integration mode
		// if true, Karma captures browsers, runs the tests and exits
		singleRun : false,

		// Concurrency level
		// how many browser should be started simultaneous
		// concurrency: process.env.TRAVIS ? 1 : Infinity,
		concurrency : Infinity,

		//custom launcher for travis
		customLaunchers : {
			HeadlessChrome : {
				base : "ChromeHeadless",
				flags : ["--no-sandbox", "--use-fake-ui-for-media-stream", "--use-fake-device-for-media-stream",
						"--autoplay-policy=no-user-gesture-required"],
			},
			HeadlessFirefox : {
				base : "Firefox",
				flags : ["-headless"],
				prefs : {
					"focusmanager.testmode" : true,
					"media.navigator.permission.disabled" : true,
				},
			},
			OnlineChrome: {
				base: "Chrome",
				flags: ["--no-sandbox", "--use-fake-ui-for-media-stream", "--use-fake-device-for-media-stream",
					"--autoplay-policy=no-user-gesture-required"],
			},
		},
	};

	config.set(configuration);
};
