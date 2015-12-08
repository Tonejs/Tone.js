var gulp = require("gulp");
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
			.argv;
var webserver = require("gulp-webserver");

/**
 *  BUILDING
 */

//collect all of the files into one file prefixed with 'require'
gulp.task("makerequire", function(done) {
	var allFiles = [];
	var task = gulp.src(["../Tone/*/*.js"])
		.pipe(tap(function(file){
			var fileName = path.relative("./", file.path);
			allFiles.push(fileName.substring(0, fileName.length - 3));
		}));
	task.on("end", function(){
		//build a require string
		var reqString = "require("+JSON.stringify(allFiles)+", function(){});";
		fs.writeFile("toneMain.js", reqString, function(err){
			if (err){
				console.log(err);
			}
			done();
		});
	});
});

//build the package from the requirefile
//replace all of the define strings
gulp.task("buildrequire", ["makerequire"], function(done){
	var stream = gulp.src("./toneMain.js")
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
		.pipe(replace("define('Tone/core/Tone', [], ", "Main("))
		//replace the ToneModules
		.pipe(replace(/define\(\s*'([^']*)'\s*\,\s*\[\s*'([^']*'\s*\,*\s*)+?\]\s*\,\s*/g, "Module("))
		.pipe(tap(function(file){
			var fileAsString = file.contents.toString();
			file.contents = new Buffer(fileAsString.substr(0, fileAsString.indexOf("require([") - 1));
			fs.writeFile("toneMain.js", file.contents, function(err){
				if (err){
					console.log(err);
				}
			});
		}))
		//surround the file with the header/footer
		.pipe(insert.prepend(fs.readFileSync("./fragments/before.frag").toString()))
		.pipe(insert.append(fs.readFileSync("./fragments/after.frag").toString()))
		//clean up the files
		.pipe(gulp.dest("../build/"));
	stream.on("end", done);
});

gulp.task("buildp5Tone", ["buildrequire"], function(done){
	var stream = gulp.src("./toneMain.js")
	.pipe(rename("p5.Tone.js"))
	//surround the file with the header/footer
		.pipe(insert.prepend(fs.readFileSync("./fragments/before.frag").toString()))
		.pipe(insert.append(fs.readFileSync("./fragments/p5-after.frag").toString()))
		//clean up the files
		.pipe(gulp.dest("../build/"));
	stream.on("end", function(){
		del(["./toneMain.js"], done);
	});
});

gulp.task("build", ["buildp5Tone"], function(){
		gulp.src("../build/{p5.Tone,Tone}.js")
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
			.pipe(rename(function(path) {
				path.basename += ".min";
			}))
			.pipe(gulp.dest("../build/"));
});

//default build
gulp.task("default", ["build"], function(){});

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
gulp.task("test", ["server", "collectTests"], function(){
	gulp.src("../test/index.html")
		.pipe(openFile({uri: "http://localhost:3000/test"}));
});

gulp.task("collectTests", function(done){
	var tests = ["../test/*/*.js", "!../test/helper/*.js", "!../test/tests/*.js"];
	if (argv.file){
		tests = ["../test/*/"+argv.file+".js"];
	} else if (argv.signal || argv.core || argv.component || argv.instrument || 
				argv.source || argv.effect || argv.event){
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