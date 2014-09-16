module.exports = function(grunt) {

	// Project configuration.
	grunt.initConfig({
		//pkg: grunt.file.readJSON("package.json"),
		jsdoc : {
			src : {
				src: ["../Tone/**/*.js", "!../Tone/*/preset/*", "../README.md"], 
				options: {
					destination: "../doc",
					template : "./doc_config/vendor",
					configure : "./doc_config/vendor/jsdoc.conf.json",
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
					dest: "./npm/Tone.js"
				}, {
					src : ["../Tone/**"],
					dest : "./npm/Tone/"
				}, {
					src : ["../README.md"],
					dest : "./npm/README.md"
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
					process: function(src, filepath) {
						var withoutRequire = src.substr(0, src.indexOf("require([") - 1);
						return withoutRequire;
					},
				},
				files: {
					"../build/Tone.js": ["./Tone.js.tmp"],
				}
			}, 
			removeRequireStringMin: {
				options: {
					process: function(src, filepath) {
						var withoutRequire = src.substr(0, src.indexOf("require([") - 1);
						return withoutRequire;
					},
				},
				files: {
					"../build/Tone.min.js": ["./Tone.min.js.tmp"],
				}
			}
		},
		clean: {
			options: {
				force: true,
			},
			dist: ["../main.js","./Tone.js.tmp"],
			min: ["../main.js","./Tone.min.js.tmp"],
		}
	});

	// Load the plugin that provides the "uglify" task.
	grunt.loadNpmTasks("grunt-jsdoc");
	grunt.loadNpmTasks("grunt-contrib-requirejs");
	grunt.loadNpmTasks("grunt-contrib-concat");
	grunt.loadNpmTasks("grunt-contrib-clean");
	grunt.loadNpmTasks("grunt-contrib-copy");
	
	// Default task(s).
	grunt.registerTask("docs", ["jsdoc:src"]);
	grunt.registerTask("npm", ["copy:npm"]);
	grunt.registerTask("presets", ["concat:presets"]);
	grunt.registerTask("min", ["concat:dist", "requirejs:min", "concat:removeRequireStringMin", "clean:min"]);
	grunt.registerTask("build", ["concat:dist","requirejs:compile","concat:removeRequireString","clean:dist"]);
	grunt.registerTask("buildall", ["build", "min", "presets"]);
	grunt.registerTask("dist", ["buildall", "docs", "npm"]);
	
};