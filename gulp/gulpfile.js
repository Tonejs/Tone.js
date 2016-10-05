var gulp = require("gulp");
var gutil = require("gulp-util");
var glob = require("glob");
var tap = require("gulp-tap");
var concat = require("gulp-concat");
var path = require("path");
var fs = require("fs");
var amdOptimize = require("amd-optimize");
var replace = require("gulp-replace");
var indent = require("gulp-indent");
var insert = require("gulp-insert");
var del = require("del");
var uglify = require("gulp-uglify");
var rename = require("gulp-rename");
var sass = require("gulp-ruby-sass");
var prefix = require("gulp-autoprefixer");
var openFile = require("gulp-open");
var argv = require("yargs")
			.alias("f", "file")
			.alias("s", "signal")
			.alias("i", "instrument")
			.alias("o", "source")
			.alias("v", "event")
			.alias("t", "control")
			.alias("e", "effect")
			.alias("c", "core")
			.alias("m", "component")
			.alias("y", "type")
			.argv;
var webserver = require("gulp-webserver");
var KarmaServer = require("karma").Server;

/**
 *  BUILDING
 */

//collect all of the files into one file prefixed with 'require'
gulp.task("collectDependencies", function(done) {
	glob("../Tone/*/*.js", function(err, files){
		var modules = [];
		gutil.log(gutil.colors.magenta("files found:", files.length));
		files.forEach(function(file){
			//remove the precedding ../ and the trailing .js
			var module = file.substring(3, file.length - 3);
			modules.push(module);
		});
		//write it to disk
		var reqString = "/* BEGIN REQUIRE */ require("+JSON.stringify(modules)+", function(){});";
		fs.writeFile("toneMain.js", reqString, done);
	});
});

gulp.task("compile", ["collectDependencies"], function(done){
	gulp.src("./toneMain.js")
		// Traces all modules and outputs them in the correct order.
		.pipe(amdOptimize("gulp/toneMain", {
			baseUrl : "../",
			preserveComments : true
		}))
		.pipe(concat("Tone.js"))
		.pipe(replace("'use strict';", ""))
		//indent the contents
		.pipe(indent({
			tabs:true,
			amount:1
		}))
		//replace the MainModule
		.pipe(replace(/\/\* BEGIN REQUIRE \*\/(.|\n)*/gm, ""))
		.pipe(replace("define('Tone/core/Tone', [], ", "Main("))
		//replace the ToneModules
		.pipe(replace(/define\(\s*'([^']*)'\s*\,\s*\[\s*'([^']*'\s*\,*\s*)+?\]\s*\,\s*/g, "Module("))
		.pipe(insert.prepend(fs.readFileSync("./fragments/before.frag").toString()))
		.pipe(gulp.dest("../build/"))
		.pipe(concat("p5.Tone.js"))
		.pipe(gulp.dest("../build/"))
		.on("end", done);
});

gulp.task("footer", ["compile"], function(done){
	gulp.src("../build/Tone.js")
		.pipe(insert.append(fs.readFileSync("./fragments/after.frag").toString()))
		.pipe(gulp.dest("../build/"))
		.on("end", done);
});

gulp.task("p5Footer", ["compile"], function(done){
	gulp.src("../build/p5.Tone.js")
		.pipe(insert.append(fs.readFileSync("./fragments/p5-after.frag").toString()))
		.pipe(gulp.dest("../build/"))
		.on("end", done);
});

gulp.task("build", ["footer", "p5Footer"], function(){
	gulp.src("../build/Tone.js")
		.pipe(uglify({
				preserveComments : "some",
				compress: {
					dead_code : true,
					evaluate : true,
					loops : true,
					if_return : true,
					hoist_vars : true,
					booleans : true,
					conditionals : true,
					sequences : true,
					comparisons : true,
					hoist_funs : true,
					join_vars : true,
					cascade : true,
				},
			}))
		.pipe(rename({
			suffix : ".min"
		}))
		// .pipe(del(["./toneMain.js"]))
		.pipe(gulp.dest("../build/"));
});

gulp.task("cleanup", ["build"], function(){
	del(["./toneMain.js"]);
});

//default build
gulp.task("default", ["cleanup"], function(){});

/**
 *  Sass
 */
gulp.task("sass", function () {
    sass("../examples/style/examples.scss", {sourcemap: false})
        .pipe(prefix("last 2 version"))
        .pipe(gulp.dest("../examples/style/"));
});

gulp.task("example", function() {
  gulp.watch(["../examples/style/examples.scss"], ["sass"]);
});

/**
 *  THE WEBSERVER
 */
gulp.task("server", function(){
	gulp.src("../")
		.pipe(webserver({
			// livereload: false,
			directoryListing: true,
			port : 3000,
			open: false
		}));
});

/**
 *  TEST RUNNER
 */
gulp.task("browser-test", ["server", "collectTests"], function(){
	gulp.src("../test/index.html")
		.pipe(openFile({uri: "http://localhost:3000/test"}));
});

gulp.task("karma-test", function (done) {
  new KarmaServer({
    configFile: __dirname + '/karma.conf.js',
    singleRun: true
  }, done).start();
});

gulp.task("collectTests", function(done){
	var tests = ["../test/*/*.js", "!../test/helper/*.js", "!../test/tests/*.js"];
	if (argv.file){
		tests = ["../test/*/"+argv.file+".js"];
	} else if (argv.signal || argv.core || argv.component || argv.instrument || 
				argv.source || argv.effect || argv.event || argv.type){
		tests = [];
		if (argv.signal){
			tests.push("../test/signal/*.js");
		}
		if (argv.core){
			tests.push("../test/core/*.js");
		}
		if (argv.source){
			tests.push("../test/source/*.js");
		}
		if (argv.instrument){
			tests.push("../test/instrument/*.js");
		}
		if (argv.component){
			tests.push("../test/component/*.js");
		}
		if (argv.effect){
			tests.push("../test/effect/*.js");
		}
		if (argv.event){
			tests.push("../test/event/*.js");
		}
		if (argv.type){
			tests.push("../test/type/*.js");
		}
	} 
	// console.log(argv.signal === undefined);
	var allFiles = [];
	var task = gulp.src(tests)
		.pipe(tap(function(file){
			var fileName = path.relative("../test/", file.path);
			allFiles.push(fileName.substring(0, fileName.length - 3));
		}));
	task.on("end", function(){
		//build a require string
		allFiles.unshift("Test");
		var innerTask = gulp.src("./fragments/test.frag")
			.pipe(replace("{FILES}", JSON.stringify(allFiles)))
			.pipe(rename("Main.js"))
			.pipe(gulp.dest("../test/"));
		innerTask.on("end", done);
	});
});