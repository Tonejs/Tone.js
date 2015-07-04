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
var concatCss = require("gulp-concat-css");

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
		}))
		//surround the file with the header/footer
		.pipe(insert.prepend(fs.readFileSync("./fragments/before.frag").toString()))
		.pipe(insert.append(fs.readFileSync("./fragments/after.frag").toString()))
		//clean up the files
		.pipe(gulp.dest("../build/"));
	stream.on("end", function(){
		del(["./toneMain.js"], done);
	});
});

gulp.task("build", ["buildrequire"], function(){
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
			.pipe(rename("Tone.min.js"))
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
