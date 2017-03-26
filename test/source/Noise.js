define(["helper/Basic", "Tone/source/Noise", "helper/SourceTests", "helper/OutputAudio"], 
	function (BasicTests, Noise, SourceTests, OutputAudio) {

	describe("Noise", function(){

		//run the common tests
		BasicTests(Noise);
		SourceTests(Noise);

		context("Get/Set", function(){

			it("can be constructed with an options object", function(){
				var noise = new Noise({
					"type" : "brown"
				});
				expect(noise.type).to.equal("brown");
				noise.dispose();
			});

			it("can set the playbackRate in the constructor", function(){
				var noise = new Noise({
					"playbackRate" : 2
				});
				expect(noise.playbackRate).to.equal(2);
				noise.dispose();
			});

			it("can set the playbackRate", function(){
				var noise = new Noise();
				noise.playbackRate = 3;
				expect(noise.playbackRate).to.equal(3);
				noise.dispose();
			});

		});

		context("Type", function(){

			it ("can be set to 3 noise types", function(){
				var noise = new Noise();
				var types = ["white", "brown", "pink"];
				for (var i = 0; i < types.length; i++){
					noise.type = types[i];
					expect(noise.type).to.equal(types[i]);
					
				}
				noise.dispose();
			});

			it ("cant set invalid type", function(){
				var noise = new Noise();
				expect(function(){
					noise.type = "else";
				}).to.throw(Error);
				noise.dispose();
			});

			it("outputs white noise", function(){
				return OutputAudio(function(){
					var noise = new Noise("white");
					noise.toMaster();
					noise.start();
				});
			});		

			it("outputs pink noise", function(){
				return OutputAudio(function(){
					var noise = new Noise("pink");
					noise.toMaster();
					noise.start();
				});
			});		

			it("outputs brown noise", function(){
				return OutputAudio(function(){
					var noise = new Noise("brown");
					noise.toMaster();
					noise.start();
				});
			});		
		});
	});
});