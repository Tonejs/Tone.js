/* globals process, __dirname */
const gulp = require("gulp");
const gutil = require("gulp-util");
const glob = require("glob");
const { execSync } = require("child_process");
// const concat = require("gulp-concat");
const path = require("path");
const fs = require("fs");
// const amdOptimize = require("amd-optimize");
// const replace = require("gulp-replace");
// const indent = require("gulp-indent");
// const insert = require("gulp-insert");
// const del = require("del");
// const uglify = require("gulp-uglify");
// const rename = require("gulp-rename");
// const sass = require("gulp-ruby-sass");
// const prefix = require("gulp-autoprefixer");
const eslint = require("gulp-eslint");
const coveralls = require("gulp-coveralls");
const argv = require("yargs")
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
	.alias("x", "examples")
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
		gutil.log(gutil.colors.magenta("files found:", files.length));
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

gulp.task("version", function(){

});

gulp.task("compile", ["collectDependencies"], function(){
	return gulp.src("./toneMain.js")
		// Traces all modules and outputs them in the correct order.
		.pipe(amdOptimize("gulp/toneMain", {
			baseUrl : "../",
			preserveComments : true
		}))
		.pipe(concat("Tone.js"))
		.pipe(replace("'use strict';", ""))
		//indent the contents
		.pipe(indent({
			tabs : true,
			amount : 1
		}))
		//replace the MainModule
		.pipe(replace(/\/\* BEGIN REQUIRE \*\/(.|\n)*/gm, ""))
		.pipe(replace("define('Tone/core/Tone', [], ", "Main("))
		//replace the ToneModules
		.pipe(replace(/define\(\s*'([^']*)'\s*\,\s*\[\s*'([^']*'\s*\,*\s*)+?\]\s*\,\s*/g, "Module("))
		.pipe(insert.prepend(fs.readFileSync("./fragments/before.frag").toString()))
		.pipe(gulp.dest("../build/"));
});

gulp.task("footer", ["compile"], function(){
	return gulp.src("../build/Tone.js")
		.pipe(insert.append(fs.readFileSync("./fragments/after.frag").toString()))
		.pipe(gulp.dest("../build/"));
});

gulp.task("minify", ["footer"], function(){
	return gulp.src("../build/Tone.js")
		.pipe(uglify({
			preserveComments : "some",
			compress : {
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

gulp.task("build", ["minify"], function(){
	return del(["./toneMain.js"]);
});

//default build
gulp.task("default", ["build"]);

/**
 *  Sass
 */
gulp.task("sass", function(){
	sass("../examples/style/examples.scss", { sourcemap : false })
		.pipe(prefix("last 2 version"))
		.pipe(gulp.dest("../examples/style/"));
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
	// var tests = ["../test/*/*.js", "!../test/helper/*.js", "!../test/deps/*.js", "!../test/examples/*.js", ];
	if (argv.file){
		tests = ["../test/*/"+argv.file+".js"];
	} else if (argv.signal || argv.core || argv.component || argv.instrument ||
				argv.source || argv.effect || argv.event || argv.type || argv.examples){
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
		if (argv.examples){
			tests.push("../test/examples/*.js");
		}
	}
	glob(tests, (err, files) => {
		var reqString = files.map(r => `require("${r}");`).join("\n");
		reqString += "\nmocha.run()\n";
		fs.writeFile("../test/test.js", reqString, done);
	});
});

function getFiles(globpath, cb){
	glob(globpath, function(err, files){
		const modules = files.filter(f => f.substring(3, f.length - 3));
		cb(modules);
	});
}

gulp.task("karma", done => {
	new KarmaServer({
		configFile : __dirname + "/karma.conf.js",
		singleRun : true
	}, done).start();
});

/**
 *  TEST ALL
 */
gulp.task("travis-test", ["lint", "karma-test"]);

/**
 *  COVERALLS
 */
gulp.task("coveralls", function(){
	return gulp.src("../test/coverage/**/lcov.info")
		.pipe(coveralls());
});
