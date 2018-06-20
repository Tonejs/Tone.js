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

/**
 *  COLLECT DEPENDENCIES
 */
gulp.task("collectDependencies", function(done){
	//collect all of the files into one file prefixed with 'require'
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
 *  COLLECT TESTS
 */
gulp.task("collectTests", function(done){
	var tests = "../test/!(helper|deps|examples)/*.js";
	if (typeof argv.file === "string"){
		tests = `../test/*/${argv.file}.js`;
	} else if (typeof argv.dir === "string"){
		tests = `../test/${argv.dir}/*.js`;
	}
	glob(tests, (err, files) => {
		var reqString = files.map(r => `require("${r}");`).join("\n");
		fs.writeFile("../test/test.js", reqString, done);
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

/**
 *  COVERALLS
 */
gulp.task("coveralls", function(){
	return gulp.src("../test/coverage/**/lcov.info")
		.pipe(coveralls());
});
