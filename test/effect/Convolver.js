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

			// the buffers are set to 44.1 Khz, but i always get this error:
			// Error: Failed to set the 'buffer' property on 'ConvolverNode': The buffer sample rate of 48000 does not match the context rate of 44100 Hz.
			// EffectTests(Convolver, ir);

			context("API", function(){

				it("can pass in options in the constructor", function(){
					var convolver = new Convolver({
						"url" : testFile,
					});
					convolver.dispose();
				});

				it("invokes the onload function when loaded", function(done){
					var convolver = new Convolver({
						"url" : testFile,
						"onload" : function(){
							convolver.dispose();
							done();
						}
					});
				});

				it("load returns a Promise", function(done){
					var convolver = new Convolver();
					convolver.load(testFile).then(function(){
						convolver.dispose();
						done();
					});
				});

				it("load invokes the second callback", function(done){
					var convolver = new Convolver();
					convolver.load(testFile, function(){
						convolver.dispose();
						done();
					});
				});

				it("can be constructed with loaded buffer", function(done){
					var buffer = new Buffer({
						"url" : testFile,
						"onload" : function(){
							var convolver = new Convolver(buffer);
							expect(convolver.buffer).is.instanceOf(AudioBuffer);
							buffer.dispose();
							convolver.dispose();
							done();
						}
					});
				});

				it("can be constructed with unloaded buffer", function(done){
					var convolver = new Convolver({
						"url" : new Buffer({
							"url" : testFile,
							"onload" : function(){
								expect(convolver.buffer).is.instanceOf(AudioBuffer);
								convolver.dispose();
								done();
							}
						})
					});
				});
			});
		});
	});
