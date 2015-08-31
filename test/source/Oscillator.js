define(["helper/Basic", "Tone/source/Oscillator", "helper/Offline", "helper/SourceTests", "helper/OscillatorTests"], 
	function (BasicTests, Oscillator, Offline, SourceTests, OscillatorTests) {

	describe("Oscillator", function(){

		//run the common tests
		BasicTests(Oscillator);
		SourceTests(Oscillator);
		OscillatorTests(Oscillator);

		context("Get/Set", function(){
			
			it("can be set with an options object", function(){
				var osc = new Oscillator();
				osc.set({
					"frequency" : 231,
					"detune" : -21,
					"type" : "square"
				});
				expect(osc.frequency.value).to.equal(231);
				expect(osc.detune.value).to.equal(-21);
				expect(osc.type).to.equal("square");
				osc.dispose();
			});

			it("can be get the values as an object", function(){
				var osc = new Oscillator(450, "square");
				expect(osc.get().frequency).to.equal(450);
				expect(osc.get().type).to.equal("square");
				osc.dispose();
			});


		});

		context("Phase Rotation", function(){
			it ("can change the phase to 90", function(done){
				var instance;
				var offline = new Offline(1);
				offline.before(function(dest){
					instance = new Oscillator({
						"phase" : 90,
						"frequency" : 1
					});
					instance.connect(dest);
					instance.start(0);
				});
				offline.test(function(sample, time){
					if (time < 0.25){
						expect(sample).to.be.within(-1, 0);
					} else if (time < 0.5){
						expect(sample).to.be.within(0, 1);
					}
				});
				offline.after(function(){
					instance.dispose();
					done();
				});
				offline.run();
			});

			it ("can change the phase to -90", function(done){
				var instance;
				var offline = new Offline(1);
				offline.before(function(dest){
					instance = new Oscillator({
						"phase" : 270,
						"frequency" : 1
					});
					instance.connect(dest);
					instance.start(0);
				});
				offline.test(function(sample, time){
					if (time < 0.25){
						expect(sample).to.be.within(0, 1);
					} else if (time < 0.5){
						expect(sample).to.be.within(-1, 0);
					}
				});
				offline.after(function(){
					instance.dispose();
					done();
				});
				offline.run();
			});
			
		});

		context("Type", function(){

			it ("can get and set the type", function(){
				var osc = new Oscillator({
					"type" : "sawtooth",
				});
				expect(osc.type).to.equal("sawtooth");
				osc.dispose();
			});

			it ("handles 4 basic types", function(){
				var osc = new Oscillator();
				var types = ["triangle", "sawtooth", "sine", "square"];
				for (var i = 0; i < types.length; i++){
					osc.type = types[i];
					expect(osc.type).to.equal(types[i]);
				}
				osc.dispose();
			});

			it ("throws an error if invalid type is set", function(){
				var osc = new Oscillator();
				expect(function(){
					osc.type = "invalid";
				}).to.throw(Error);
				osc.dispose();
			});

			it ("can set extended types", function(){
				var osc = new Oscillator();
				osc.type = "sine5";
				expect(osc.type).to.equal("sine5");
				osc.type = "triangle2";
				expect(osc.type).to.equal("triangle2");
				osc.dispose();
			});
		});

		context("Synchronization", function(){
			/*it("can sync the frequency to Transport", function(done){
				var osc;
				Test.offlineTest(0.1, function(dest){
					Transport.bpm.value = 120;
					osc = new Oscillator(2);
					osc.frequency.connect(dest);
					osc.syncFrequency();
					Transport.bpm.value = 240;
				}, function(freq){
					expect(freq).to.be.closeTo(4, 0.001);
				}, function(){
					osc.dispose();
					done();
				});
			});*/

			/*it("can unsync the frequency to Transport", function(done){
				var osc;
				Test.offlineTest(0.1, function(dest){
					Transport.bpm.value = 120;
					osc = new Oscillator(2);
					osc.frequency.connect(dest);
					osc.syncFrequency();
					Transport.bpm.value = 240;
					osc.unsyncFrequency();
				}, function(freq){
					expect(freq).to.be.closeTo(2, 0.001);
				}, function(){
					osc.dispose();
					done();
				});
			});*/
		});

	});
});