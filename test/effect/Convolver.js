define(["Tone/effect/Convolver", "helper/Basic", "helper/EffectTests", "Tone/core/Buffer"], 
function (Convolver, Basic, EffectTests, Buffer) {

	if (window.__karma__){
		Buffer.baseUrl = "/base/test/";
	}

	describe("Convolver", function(){

		Basic(Convolver);

		var ir = new Buffer();

		var testFile = "./audio/sineStereo.wav";

		before(function(done){
			ir.load(testFile, function(){
				done();
			});
		});

		// EffectTests(Convolver, ir);

		context("API", function(){

			it ("can pass in options in the constructor", function(){
				var convolver = new Convolver({
					"url" : testFile,
				});
				convolver.dispose();
			});

			it ("invokes the onload function when loaded", function(done){
				var convolver = new Convolver({
					"url" : testFile,
					"onload" : function(){
						convolver.dispose();
						done();
					}
				});
			});
		});
	});
});