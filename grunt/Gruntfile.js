module.exports = function(grunt) {

	// Project configuration.
	grunt.initConfig({
		//pkg: grunt.file.readJSON("package.json"),
		jsdoc : {
			src : {
				src: ["../Tone/**/*.js", "!../Tone/*/preset/*", "../README.md"], 
				options: {
					destination: "../doc",
					template : "./vendor",
					configure : "./vendor/jsdoc.conf.json",
					private : false
				}
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
			min: {
				options: {
					baseUrl: "../",
					name : "main",
					out: "./Tone.min.js.tmp",
					optimize : "uglify2"
				}
			}
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
			removeRequireStringMin: {
				options: {
					process: function(src) {
						var withoutRequire = src.substr(0, src.indexOf("require([") - 1);
						return withoutRequire;
					},
				},
				files: {
					"../build/Tone.min.js" : ["./Tone.min.js.tmp"],
				}
			}
		},
		clean: {
			options: {
				force: true,
			},
			dist: ["../main.js","./Tone.js.tmp"],
			min: ["../main.js","./Tone.min.js.tmp"],
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
					wrapper: [grunt.file.read("./fragments/before.preset.frag"), grunt.file.read("./fragments/after.frag")]
				}
			},
			min: {
				src: ["../build/Tone.min.js"],
				dest: "../build/Tone.min.js",
				options: {
					wrapper: [grunt.file.read("./fragments/before.frag.min"), grunt.file.read("./fragments/after.frag.min")]
				}
			}
		},
		indent: {
			dist: {
				src: ["./Tone.js.tmp"],
				dest: "./Tone.js.tmp",
				options: {
					style: "tab",
					size: 4,
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
	
	// Default task(s).
	grunt.registerTask("docs", ["jsdoc:src"]);
	grunt.registerTask("npm", ["copy:npm"]);
	grunt.registerTask("presets", ["concat:presets", "wrap:presets"]);
	grunt.registerTask("min", ["concat:dist", "requirejs:min", "concat:removeRequireStringMin", "clean:min", "wrap:min"]);
	grunt.registerTask("build", ["concat:dist","requirejs:compile","concat:removeRequireString", "clean:dist", "wrap:dist"]);
	grunt.registerTask("buildall", ["build", "min", "presets"]);
	grunt.registerTask("dist", ["buildall", "docs", "npm"]);
	
};