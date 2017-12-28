// Karma configuration
// Generated on Mon Feb 01 2016 22:48:23 GMT-0500 (EST)

// var BROWSERS = ['HeadlessChrome', 'HeadlessFirefox', 'Safari']
var BROWSERS = ['Safari']

if (process.env.BROWSER === 'chrome'){
	BROWSERS = ['HeadlessChrome']
} else if (process.env.BROWSER === 'firefox'){
	BROWSERS = ['HeadlessFirefox']
} else if (process.env.BROWSER === 'safari'){
	BROWSERS = ['Safari']
}

module.exports = function(config) {
	var configuration = {

		// base path that will be used to resolve all patterns (eg. files, exclude)
		basePath: '../',


		// frameworks to use
		// available frameworks: https://npmjs.org/browse/keyword/karma-adapter
		frameworks: ['mocha', 'requirejs'],


		// list of files / patterns to load in the browser
		files: [
			// '../test/helper/Test.js',
			'test/karmaTest.js',
			{pattern: 'test/*/*.js', included: false},
			{pattern: 'examples/*.html', included: false},
			{pattern: 'examples/scripts/*.js', included: false},
			{pattern: 'examples/style/*.css', included: false},
			{pattern: 'examples/audio/*/*.mp3', included: false},
			{pattern: 'examples/audio/*.mp3', included: false},
			{pattern: 'examples/audio/*/*.png', included: false},
			{pattern: 'build/*.js', included: false},
			{pattern: 'test/audio/*', included: false},
			{pattern: 'Tone/*/*.js', included: false},
			],


		// list of files to exclude
		exclude: [],


		// preprocess matching files before serving them to the browser
		// available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
		preprocessors: {
			'Tone/!(shim)/*.js': ['coverage']
		},


		// test results reporter to use
		// possible values: 'dots', 'progress'
		// available reporters: https://npmjs.org/browse/keyword/karma-reporter
		reporters: ['dots', 'coverage'],

		coverageReporter: {
			type : 'lcov',
			dir : 'test/coverage/'
		},


		//plugins
		plugins : [
		'karma-coverage',
		'karma-mocha',
		'karma-requirejs',
		'karma-chrome-launcher',
		'karma-firefox-launcher',
		'karma-safari-launcher'
		],


		client: {
			mocha: {
				reporter: 'html', // change Karma's debug.html to the mocha web reporter
				ui: 'bdd'
			}
		},


		// web server port
		port: 9876,


		// enable / disable colors in the output (reporters and logs)
		colors: true,

		// set the inactivity level to longer
		browserNoActivityTimeout : 40000,


		// level of logging
		// possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
		logLevel: config.LOG_ERROR,


		// enable / disable watching file and executing tests whenever any file changes
		autoWatch: false,


		// start these browsers
		// available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
		browsers: BROWSERS,


		// Continuous Integration mode
		// if true, Karma captures browsers, runs the tests and exits
		singleRun: false,

		// Concurrency level
		// how many browser should be started simultaneous
		// concurrency: process.env.TRAVIS ? 1 : Infinity,
		concurrency: Infinity,

		//custom launcher for travis
		customLaunchers: {
			HeadlessChrome: {
				base: 'ChromeHeadless',
				flags: ['--no-sandbox', '--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream']
			},
			HeadlessFirefox: {
		        base: 'Firefox',
				flags: [ '-headless' ],
		        prefs: {
		            'media.navigator.permission.disabled': true,
					'focusmanager.testmode': true
		        }
		    }
		}
	};

	config.set(configuration);
};
