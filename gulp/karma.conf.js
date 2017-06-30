// Karma configuration
// Generated on Mon Feb 01 2016 22:48:23 GMT-0500 (EST)

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
			'Tone/*/*.js': ['coverage']
		},


		// test results reporter to use
		// possible values: 'dots', 'progress'
		// available reporters: https://npmjs.org/browse/keyword/karma-reporter
		reporters: ['progress', 'coverage'],

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
		'karma-firefox-launcher'
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
		browserNoActivityTimeout : 30000,


		// level of logging
		// possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
		logLevel: config.LOG_ERROR,


		// enable / disable watching file and executing tests whenever any file changes
		autoWatch: false,


		// start these browsers
		// available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
		browsers: ['HeadlessChrome'],


		// Continuous Integration mode
		// if true, Karma captures browsers, runs the tests and exits
		singleRun: false,

		// Concurrency level
		// how many browser should be started simultaneous
		concurrency: Infinity,

		//custom launcher for travis
		customLaunchers: {
			HeadlessChrome: {
				base: 'ChromeHeadless',
				flags: ['--disable-translate', '--disable-extensions', '--remote-debugging-port=9223', '--no-sandbox', '--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream']
			}
		}
	};

	config.set(configuration);
};
