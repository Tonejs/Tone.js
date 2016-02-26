define(["Tone/effect/Convolver", "helper/Basic", "helper/EffectTests", "Tone/core/Buffer"], 
function (Convolver, Basic, EffectTests, Buffer) {
	describe("Effect", function(){

		Basic(Convolver);

		var ir = new Buffer();

		before(function(done){
			ir.load("./audio/berlin_tunnel_ir.wav", function(){
				done();
			});
		});

		EffectTests(Convolver, undefined, function(conv){
			conv.buffer = ir;
		});

		context("API", function(){

			it ("can pass in options in the constructor", function(){
				var convolver = new Convolver({
					"url" : "./audio/berlin_tunnel_ir.wav",
				});
				convolver.dispose();
			});

			it ("invokes the onload function when loaded", function(done){
				var convolver = new Convolver({
					"url" : "./audio/berlin_tunnel_ir.wav",
					"onload" : function(){
						convolver.dispose();
						done();
					}
				});
			});
		});
	});
});