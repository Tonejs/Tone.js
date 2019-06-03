// Karma configuration
var path = require("path");

var BROWSERS = ["HeadlessChrome", "HeadlessFirefox", "Safari"];

if (process.env.BROWSER === "chrome"){
	BROWSERS = ["HeadlessChrome"];
} else if (process.env.BROWSER === "firefox"){
	BROWSERS = ["HeadlessFirefox"];
} else if (process.env.BROWSER === "safari"){
	BROWSERS = ["Safari"];
} else {
	BROWSERS = ["HeadlessChrome", "HeadlessFirefox"];
}

module.exports = function(config){
	var configuration = {

		// base path that will be used to resolve all patterns (eg. files, exclude)
		basePath : "../",

		// frameworks to use
		// available frameworks: https://npmjs.org/browse/keyword/karma-adapter
		frameworks : ["mocha"],

		// list of files / patterns to load in the browser
		files : [
			"test/test.js",
			{ pattern : "test/audio/*", included : false },
			{ pattern : "test/audio/*/*", included : false },
			{ pattern : "test/html/*", included : false },
			{ pattern : "build/*", included : false },
		],

		// list of files to exclude
		exclude : [],

		// preprocess matching files before serving them to the browser
		// available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
		preprocessors : {
			"test/test.js" : ["webpack", "sourcemap"],
		},

		// test results reporter to use
		// possible values: 'dots', 'progress'
		// available reporters: https://npmjs.org/browse/keyword/karma-reporter
		reporters : ["dots", "coverage"],

		coverageReporter : {
			type : "lcov",
			dir : "./coverage"
		},

		//plugins
		plugins : [
			"karma-coverage",
			"karma-mocha",
			"karma-webpack",
			"karma-chrome-launcher",
			"karma-firefox-launcher",
			"karma-safari-launcher",
			"karma-sourcemap-loader",
		],

		client : {
			mocha : {
				reporter : "html", // change Karma's debug.html to the mocha web reporter
				ui : "bdd"
			}
		},

		//webpack
		webpack : {
			mode : "development",
			resolve : {
				modules : [
					path.resolve(__dirname, "../node_modules"),
					path.resolve(__dirname, "../"),
					path.resolve(__dirname, "../test")
				],
			},
			module : {
				rules : [
					//enables correct coverage mapping
					{
						test : /\.js$/,
						use : { loader : "istanbul-instrumenter-loader", query : { esModules : true } },
						include : path.resolve(__dirname, "../Tone"),
						exclude : path.resolve(__dirname, "../Tone/shim")
					}
				]
			},
			devtool : "inline-source-map"
		},

		// web server port
		port : 9876,

		// enable / disable colors in the output (reporters and logs)
		colors : true,

		// set the inactivity level to longer
		browserNoActivityTimeout : 40000,

		// level of logging
		// possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
		logLevel : config.LOG_ERROR,

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
				flags : ["--no-sandbox", "--use-fake-ui-for-media-stream", "--use-fake-device-for-media-stream", "--autoplay-policy=no-user-gesture-required"]
			},
			HeadlessFirefox : {
				base : "Firefox",
				flags : ["-headless"],
				prefs : {
					"media.navigator.permission.disabled" : true,
					"focusmanager.testmode" : true
				}
			}
		}
	};

	config.set(configuration);
};
