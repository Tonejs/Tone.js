define(["Tone/effect/Convolver", "helper/Basic", "helper/EffectTests", "Tone/core/Buffer"], 
function (Convolver, Basic, EffectTests, Buffer) {
	describe("Effect", function(){

		// Basic(Convolver);

		var ir = new Buffer();

		before(function(done){
			ir.load("./audio/berlin_tunnel_ir.wav", function(){
				done();
			});
		});

		EffectTests(Convolver, ir);

		context("API", function(){

			/*it ("can pass in options in the constructor", function(){
				var convolver = new Convolver({
					"min" : 2000,
					"max" : 4000,
					"type" : "sawtooth"
				});
				expect(convolver.min).to.be.closeTo(2000, 0.1);
				expect(convolver.max).to.be.closeTo(4000, 0.1);
				expect(convolver.type).to.equal("sawtooth");
				convolver.dispose();
			});

			it ("can be started and stopped", function(){
				var convolver = new Convolver();
				convolver.start().stop("+0.2");
				convolver.dispose();
			});

			it ("can get/set the options", function(){
				var convolver = new Convolver();
				convolver.set({
					"min" : 1200,
					"frequency" : 2.4,
					"type" : "triangle"
				});
				expect(convolver.get().min).to.be.closeTo(1200, 0.01);
				expect(convolver.get().frequency).to.be.closeTo(2.4, 0.01);
				expect(convolver.get().type).to.equal("triangle");
				convolver.dispose();
			});

			it ("can set the frequency and depth", function(){
				var convolver = new Convolver();
				convolver.depth.value = 0.4;
				convolver.frequency.value = 0.4;
				expect(convolver.depth.value).to.be.closeTo(0.4, 0.01);
				expect(convolver.frequency.value).to.be.closeTo(0.4, 0.01);
				convolver.dispose();
			});

			it ("can set the filter options", function(){
				var convolver = new Convolver();
				convolver.filter.Q.value = 2;
				expect(convolver.filter.Q.value).to.be.closeTo(2, 0.01);
				convolver.dispose();
			});*/
		});
	});
});