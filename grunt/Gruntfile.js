module.exports = function(grunt) {

	// Project configuration.
	grunt.initConfig({
		jsdoc : {
			src : {
				src: ["../Tone/*/*.js", "!../Tone/*/preset/*", "../README.md"], 
				options: {
					destination: "../docs",
					configure : "./jsdoc.conf.json",
					template: "./node_modules/jsdoc-oblivion/template",
					private : false
				},
			},
		},
		requirejs : {
			compile: {
				options: {
					baseUrl: "../",
					name : "main",
					out: "./Tone.js.tmp",
					optimize : "none"
				}
			},
		},
		copy : {
			npm : {
				files : [{
					expand : true,
					src: ["../build/Tone.js", "../build/Tone.min.js", "../build/Tone.Preset.js"], 
					dest: "../utils/npm/Tone.js"
				}, {
					src : ["../Tone/**"],
					dest : "../utils/npm/Tone/"
				}, {
					src : ["../README.md"],
					dest : "../utils/npm/README.md"
				}]
			}
		},
		concat: {
			dist: {
				options: {
					banner: "require([",
					separator: ",",
					process: function(src, filepath) {
						return "\"" + filepath.substring(3,(filepath.length-3)) + "\"";
					},
					footer: "], function(){});",

				},
				files: {
					//exclude presets
					"../main.js" : ["../Tone/**/*.js", "!../Tone/*/preset/*"],
				}
			},
			presets : {
				files: {
					"../build/Tone.Preset.js" : ["../Tone/**/preset/*.js"],
				}
			},
			removeRequireString: {
				options: {
					process: function(src) {
						var withoutRequire = src.substr(0, src.indexOf("require([") - 1);
						return withoutRequire;
					},
				},
				files: {
					"../build/Tone.js" : ["./Tone.js.tmp"],
				}
			}, 
		},
		clean: {
			options: {
				force: true,
			},
			dist: ["../main.js","./Tone.js.tmp"],
		},
		wrap: {
			dist: {
				src: ["../build/Tone.js"],
				dest: "../build/Tone.js",
				options: {
					wrapper: [grunt.file.read("./fragments/before.frag"), grunt.file.read("./fragments/after.frag")]
				}
			},
			presets: {
				src: ["../build/Tone.Preset.js"],
				dest: "../build/Tone.Preset.js",
				options: {
					wrapper: [grunt.file.read("./fragments/before.preset.frag"), grunt.file.read("./fragments/after.preset.frag")]
				}
			},
		},
		indent: {
			dist: {
				src: ["../build/Tone.js"],
				dest: "../build/Tone.js", 
				options: {
					style: "tab",
					size: 1,
					change: 1
				}
			},
			presets: {
				src: ["../build/Tone.Preset.js"],
				dest: "../build/Tone.Preset.js",
				options: {
					style: "tab",
					size: 1,
					change: 1
				}
			}
		},
		uglify : {
			min : {
				options : {
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
				},
				files: {
					"../build/Tone.min.js": ["../build/Tone.js"]
				}
			},
		},
		replace: {
			dist: {
				options: {
					patterns: [
					{
						match: /define\('([^']*)'\w*,\w*\[([^\]]*)\]\w*,\w*/g,
						replacement: "ToneModule("
					},
					{
						match: /define\('Tone\/core\/Tone',\[\],/gi,
						replacement: "MainModule("
					},
					{
						match: /\n"use strict";\n/g,
						replacement: ""
					}
				]
				},
				files: [{
					src: ["../build/Tone.js"], 
					dest: "../build/Tone.js"
				}]
			},
			presets: {
				options: {
					patterns: [
					{
						match: /define\(\w*\[([^\]]*)\]\w*,\w*/g,
						replacement: "TonePreset("
					}
				]
				},
				files: [{
					src: ["../build/Tone.Preset.js"], 
					dest: "../build/Tone.Preset.js"
				}]
			}
		}
	});

	// Load the plugin that provides the "uglify" task.
	grunt.loadNpmTasks("grunt-jsdoc");
	grunt.loadNpmTasks("grunt-wrap");
	grunt.loadNpmTasks("grunt-indent");
	grunt.loadNpmTasks("grunt-contrib-requirejs");
	grunt.loadNpmTasks("grunt-contrib-concat");
	grunt.loadNpmTasks("grunt-contrib-clean");
	grunt.loadNpmTasks("grunt-contrib-copy");
	grunt.loadNpmTasks("grunt-replace");
	grunt.loadNpmTasks("grunt-contrib-uglify");
	
	// Default task(s).
	grunt.registerTask("docs", ["jsdoc:src"]);
	grunt.registerTask("npm", ["copy:npm"]);
	grunt.registerTask("presets", ["concat:presets", "indent:presets", "replace:presets", "wrap:presets"]);
	grunt.registerTask("min", ["uglify:min"]);
	grunt.registerTask("build", ["concat:dist","requirejs:compile","concat:removeRequireString", "clean:dist", "indent:dist", "replace:dist", "wrap:dist"]);
	grunt.registerTask("buildall", ["build", "min", "presets"]);
	grunt.registerTask("dist", ["buildall", "docs", "npm"]);
	
};