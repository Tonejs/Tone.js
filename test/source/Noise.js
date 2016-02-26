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


		/*it("be scheduled to start in the future", function(done){
			var noise;
			var offline = new Offline();
			Test.offlineTest(1, function(dest){
				noise = new Noise();
				noise.connect(dest);
				noise.start("+0.1");
			}, function(sample, time){
				if (sample !== 0){
					expect(time).to.be.at.least(0.1);
				}
			}, function(){
				noise.dispose();
				done();
			});
		});

		it("can set the noise types", function(){
			var noise = new Noise();
			noise.type = "brown";
			noise.type = "white";
			noise.type = "pink";
			//even after started
			noise.start();
			noise.type = "brown";
			noise.type = "white";
			noise.type = "pink";
			noise.stop();
			noise.dispose();
		});

		it("can be created with an options object", function(){
			var noise = new Noise({
				"type" : "brown"
			});
			expect(noise.type).to.equal("brown");
			noise.dispose();
		});

		it("can be set with an options object", function(){
			var noise = new Noise();
			noise.set({
				"type" : "pink"
			});
			expect(noise.type).to.equal("pink");
			noise.dispose();
		});*/
	});
});