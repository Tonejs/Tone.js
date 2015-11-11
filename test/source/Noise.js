define(["helper/Basic", "Tone/source/Noise", "helper/SourceTests", "helper/OutputAudio"], 
	function (BasicTests, Noise, SourceTests, OutputAudio) {

	describe("Noise", function(){

		//run the common tests
		BasicTests(Noise);
		SourceTests(Noise);

		context("Get/Set", function(){

			it("can be constructed with an options object", function(){
				var noise = new Noise({
					"type" : "brown",
					"playbackRate" : 0.1
				});
				expect(noise.type).to.equal("brown");
				expect(noise.playbackRate.value).to.be.closeTo(0.1, 0.001);
				noise.dispose();
			});

			it("plays at different playbackRates", function(done){
				var noise;
				OutputAudio(function(dest){
					noise = new Noise("white");
					noise.playbackRate.value = 0.1;
					noise.connect(dest);
					noise.start();
				}, function(){
					noise.dispose();
					done();
				});
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

			it("outputs white noise", function(done){
				var noise;
				OutputAudio(function(dest){
					noise = new Noise("white");
					noise.connect(dest);
					noise.start();
				}, function(){
					noise.dispose();
					done();
				});
			});		

			it("outputs pink noise", function(done){
				var noise;
				OutputAudio(function(dest){
					noise = new Noise("pink");
					noise.connect(dest);
					noise.start();
				}, function(){
					noise.dispose();
					done();
				});
			});		

			it("outputs brown noise", function(done){
				var noise;
				OutputAudio(function(dest){
					noise = new Noise("brown");
					noise.connect(dest);
					noise.start();
				}, function(){
					noise.dispose();
					done();
				});
			});		
		});

	});
});