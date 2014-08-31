module.exports = function(grunt) {

	// Project configuration.
	grunt.initConfig({
		//pkg: grunt.file.readJSON("package.json"),
		jsdoc : {
			src : {
				src: ["../Tone/**/*.js", "../README.md"], 
				options: {
					destination: "../doc",
					template : "./doc_config/template",
					configure : "./doc_config/template/jsdoc.conf.json",
					private : false
				}
			},
			dist : {
				src: ["../Tone.js"], 
				options: {
					destination: "../doc",
					template : "./doc_config/template",
					configure : "./doc_config/template/jsdoc.conf.json",
					private : false
				}
			}
		},
		requirejs : {
			compile: {
				options: {
					baseUrl: "../",
					name : "main",
					out: "./Tone.js.tmp",
					optimize : "none"
				}
			}
		},
		copy : {
			npm : {
				files : [{
					expand : true,
					src: ["../Tone.js", "../Tone/**", "../README.md"], 
					dest: "./npm/Tone.js"
				}]
			}
		},
		concat: {
			dist: {
				options: {
					// Replace all "use strict" statements in the code with a single one at the top
					banner: "require([",
					separator: ",",
					process: function(src, filepath) {
						// remove the ".js". h@ckz0rs.
						return "\"" + filepath.substring(3,(filepath.length-3)) + "\"";
					},
					footer: "], function(){});",

				},
				files: {
					"../main.js": ["../Tone/**/*.js"],
				}
			},
			removeRequireString: {
				options: {
					process: function(src, filepath) {
						// remove the ".js". h@ckz0rs.
						var withoutRequire = src.substr(0, src.indexOf("require([") - 1);
						return withoutRequire;
					},
				},
				files: {
					"../Tone.js": ["./Tone.js.tmp"],
				}
			}
		},
		clean: {
			options: {
				force: true,
			},
			dist: ["../main.js","./Tone.js.tmp"]
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
	grunt.registerTask("dist", ["concat:dist","requirejs:compile","concat:removeRequireString","clean:dist","jsdoc:dist"]);
	grunt.registerTask("build", ["concat:dist","requirejs:compile","concat:removeRequireString","clean:dist"]);
	
};