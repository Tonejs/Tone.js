// const gutil = require("gulp-util");
// const concat = require("gulp-concat");
// const amdOptimize = require("amd-optimize");
// const replace = require("gulp-replace");
// const indent = require("gulp-indent");
// const insert = require("gulp-insert");
// const del = require("del");
// const uglify = require("gulp-uglify");
// const rename = require("gulp-rename");
// const sass = require("gulp-ruby-sass");
// const prefix = require("gulp-autoprefixer");
const gulp = require("gulp");
const glob = require("glob");
const { execSync } = require("child_process");
const path = require("path");
const fs = require("fs");
const eslint = require("gulp-eslint");
const coveralls = require("gulp-coveralls");
const argv = require("yargs")
	.alias("i", "file")
	.alias("d", "dir")
	.argv;

const { version, dev } = require("../Tone/version.js");
const KarmaServer = require("karma").Server;

const VERSION = version;
const TMP_FOLDER = "../tmp";

/**
 *  BUILDING
 */

//collect all of the files into one file prefixed with 'require'
gulp.task("collectDependencies", function(done){
	glob("../Tone/*/*.js", function(err, files){
		var modules = [];
		// gutil.log(gutil.colors.magenta("files found:", files.length));
		files.forEach(function(file){
			//remove the precedding ../ and the trailing .js
			var module = file.substring(3, file.length - 3);
			if (module !== "Tone/core/Tone"){
				modules.push(module);
			}
		});
		//write it to disk
		var reqString = modules.map(r => `require("${r}");`).join("\n");
		reqString += "\nmodule.exports = require(\"Tone/core/Tone\");\n";
		fs.writeFile("../Tone/index.js", reqString, done);
	});
});

/**
 *  LINTING
 */
gulp.task("lint", function(){
	return gulp.src("../Tone/*/*.js")
		.pipe(eslint())
		.pipe(eslint.format())
		.pipe(eslint.failAfterError());
});

gulp.task("lint-fix", function(){
	return gulp.src("../Tone/*/*.js")
		.pipe(eslint({
			fix : true
		}))
		.pipe(eslint.format())
		.pipe(eslint.failAfterError())
		.pipe(gulp.dest("../Tone"));
});

gulp.task("collectTests", function(done){
	var tests = "../test/!(helper|deps|examples)/*.js";
	if (argv.file){
		tests = `../test/*/${argv.file}.js`;
	} else if (argv.dir){
		tests = `../test/${argv.dir}/*.js`;
	}
	glob(tests, (err, files) => {
		var reqString = files.map(r => `require("${r}");`).join("\n");
		fs.writeFile("../test/test.js", reqString, done);
	});
});

/**
 *  COVERALLS
 */
gulp.task("coveralls", function(){
	return gulp.src("../test/coverage/**/lcov.info")
		.pipe(coveralls());
});
