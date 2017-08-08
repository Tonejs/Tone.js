/* globals process, __dirname */
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
var child_process = require("child_process");
var flatten = require("gulp-flatten");
var insert = require("gulp-insert");
var del = require("del");
var uglify = require("gulp-uglify");
var rename = require("gulp-rename");
var sass = require("gulp-ruby-sass");
var prefix = require("gulp-autoprefixer");
var openFile = require("gulp-open");
var jshint = require("gulp-jshint");
var coveralls = require("gulp-coveralls");
var git = require("gulp-git");
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
			.alias("x", "examples")
			.argv;
var KarmaServer = require("karma").Server;

var VERSION = fs.readFileSync("../Tone/core/Tone.js", "utf-8")
		.match(/(?:Tone\.version\s*=\s*)(?:'|")(.*)(?:'|");/m)[1];

var BRANCH = process.env.TRAVIS && !process.env.TRAVIS_PULL_REQUEST ? process.env.TRAVIS_BRANCH : "dev";

var TMP_FOLDER = "../tmp";

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
			tabs:true,
			amount:1
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

gulp.task("build", ["minify"], function(){
	return del(["./toneMain.js"]);
});

//default build
gulp.task("default", ["build"]);

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
 *  LINTING
 */
gulp.task("lint", function() {
	return gulp.src("../Tone/*/*.js")
		.pipe(jshint())
		.pipe(jshint.reporter("default"))
		.pipe(jshint.reporter("fail"));
});

gulp.task("karma-test", ["default"], function (done) {
  new KarmaServer({
    configFile: __dirname + "/karma.conf.js",
    singleRun: true
  }, done).start();
});

gulp.task("collectTests", function(done){
	var tests = ["../test/*/*.js", "!../test/helper/*.js", "!../test/tests/*.js"];
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

/**
 *  TEST ALL
 */
gulp.task("travis-test", ["lint", "karma-test"]);

/**
 *  COMMIT BUILD
 */
gulp.task("cloneBuild", function(done) {
	var gitUser = "";
	if (process.env.TRAVIS && process.env.GH_TOKEN){
		gitUser = process.env.GH_TOKEN+"@";
	}
	git.clone("https://"+gitUser+"github.com/Tonejs/build", {args: `${TMP_FOLDER}/build`}, done);
});

gulp.task("moveToDev", ["build", "cloneBuild"], function(){
	// move files to 'dev' folder
	return gulp.src("../build/*.js")
		.pipe(gulp.dest(`${TMP_FOLDER}/build/dev/`));
});

gulp.task("commitDev", ["moveToDev"], function(){
	process.chdir(`${TMP_FOLDER}/build`);
	return gulp.src("./dev/*")
		.pipe(git.add())
		.pipe(git.commit(`${VERSION} build #${process.env.TRAVIS_BUILD_NUMBER}: ${process.env.TRAVIS_COMMIT_MESSAGE}`));
});

gulp.task("pushBuild", ["commitDev"], function(done){
	if (process.env.TRAVIS && process.env.GH_TOKEN){
		// process.chdir(`${TMP_FOLDER}/build`);
		git.push("origin", "gh-pages", {args: " -f"}, function (err) {
			if (err) throw err;
			done();
		});
	} else {
		done();
	}
});

gulp.task("commitDevBuild", ["pushBuild"], function(){
	return del([`${TMP_FOLDER}/build`], { force : true});
});

/**
 *  COVERALLS
 */
gulp.task("coveralls", function(){
	return gulp.src("../test/coverage/**/lcov.info")
		.pipe(coveralls());
});

/**
 * JS DOC ATTRIBUTES 
 */

gulp.task("cloneSite", function(done){
	var gitUser = "";
	if (process.env.TRAVIS && process.env.GH_TOKEN){
		gitUser = process.env.GH_TOKEN+"@";
	}
	git.clone("https://"+gitUser+"github.com/Tonejs/tonejs.github.io", {args: `${TMP_FOLDER}/Site`}, done);
});

gulp.task("commitSite", ["buildJsdocs"], function(){
	process.chdir(`${TMP_FOLDER}/Site`);
	return gulp.src("*")
		.pipe(git.add())
		.pipe(git.commit(`${VERSION} build #${process.env.TRAVIS_BUILD_NUMBER}: ${process.env.TRAVIS_COMMIT_MESSAGE}`));
});

gulp.task("pushJSDocs", ["commitSite"], function(done){
	if (process.env.TRAVIS && process.env.GH_TOKEN){
		// process.chdir(`${TMP_FOLDER}/Site`);
		git.push("origin", "master", {args: " -f"}, function (err) {
			if (err) throw err;
			done();
		});
	} else {
		done();
	}
});

gulp.task("empty.md", ["cloneSite"], function(){
	return gulp.src("../Tone/*/*.js")
		.pipe(tap(function(file){
			var className = path.basename(file.path, ".js");
			var pathSplit = file.path.split("/");
			var category = pathSplit[pathSplit.length-2];
			file.contents = Buffer.from(`---\ntitle: ${className}\nlayout: ${className === "Type" ? "type" : "doc"}\nversion: ${VERSION}\ncategory: ${category}\nbranch: ${BRANCH}\n---`);
		}))
		.pipe(rename({extname: ".md"}))
		.pipe(flatten())
		.pipe(gulp.dest(`${TMP_FOLDER}/Site/_documentation/${VERSION}`))
		.pipe(tap(function(file){
			// and another one which just forwards
			var className = path.basename(file.path, ".md");
			file.contents = Buffer.from(`---\ntitle: ${className}\nlayout: forward\n---`);
		}))
		.pipe(gulp.dest(`${TMP_FOLDER}/Site/_documentation/`));
});

gulp.task("buildJsdocs", ["empty.md"], function(done){
	glob("../Tone/*/*.js", function(err, files){
		var docs = child_process.execSync(`./node_modules/.bin/jsdoc -X ${files.join(" ")}`);
		var dest = `${TMP_FOLDER}/Site/_data/jsdocs-${VERSION}.json`;
		fs.writeFile(dest, docs, done);
	});
});

gulp.task("commitJSDocs", ["pushJSDocs"], function(){
	return del([`${TMP_FOLDER}/Site`], { force : true});
});