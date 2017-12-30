var tests = [];
for (var file in window.__karma__.files) {
	if (window.__karma__.files.hasOwnProperty(file)) {
		if (file.indexOf("/base/test/") === 0 && file.indexOf("js") !== -1 &&
		file.indexOf("karmaTest.js") === -1 && file.indexOf("helper") === -1 &&
		file.indexOf("deps") === -1) {
			tests.push(file);
		}
	}
}

tests.push("deps/babel-polyfill");

requirejs.config({
	// Karma serves files from '/base'
	baseUrl : "/base/test",

	paths : {
		"Tone" : "../Tone",
		"Test" : "./helper/Test",
		"Examples" : "../examples/scripts/ExampleList"
	},
	shim : {
		"Examples" : {
			exports : "ExampleList"
		}
	},

	// ask Require.js to load these files (all our tests)
	deps : tests,

	// start test run, once Require.js is done
	callback : window.__karma__.start
});
