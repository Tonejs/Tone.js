define(["helper/Basic", "Tone/source/Oscillator", "helper/Offline", "helper/SourceTests",
	"helper/OscillatorTests", "helper/OutputAudio", "Tone/core/Transport", "helper/CompareToFile"],
function(BasicTests, Oscillator, Offline, SourceTests, OscillatorTests, OutputAudio, Transport, CompareToFile){

	describe("Oscillator", function(){

		//run the common tests
		BasicTests(Oscillator);
		SourceTests(Oscillator);
		OscillatorTests(Oscillator);

		it("matches a file", function(){
			return CompareToFile(function(){
				var osc = new Oscillator().toMaster();
				osc.type = "square";
				osc.start(0).stop(0.2);
			}, "oscillator.wav", 0.005);
		});

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
			it("can change the phase to 90", function(){
				return Offline(function(){
					var instance = new Oscillator({
						"phase" : 90,
						"frequency" : 1
					});
					instance.toMaster();
					instance.start(0);
				}, 1).then(function(buffer){
					buffer.forEach(function(sample, time){
						if (time < 0.25){
							expect(sample).to.be.within(-1, 0);
						} else if (time > 0.25 && time < 0.5){
							expect(sample).to.be.within(0, 1);
						}
					});
				});
			});

			it("can change the phase to -90", function(){
				return Offline(function(){
					var instance = new Oscillator({
						"phase" : 270,
						"frequency" : 1
					});
					instance.toMaster();
					instance.start(0);
				}, 1).then(function(buffer){
					buffer.forEach(function(sample, time){
						if (time < 0.25){
							expect(sample).to.be.within(0, 1);
						} else if (time > 0.25 && time < 0.5){
							expect(sample).to.be.within(-1, 0);
						}
					});
				});
			});

		});

		context("Type", function(){

			it("can get and set the type", function(){
				var osc = new Oscillator({
					"type" : "sawtooth",
				});
				expect(osc.type).to.equal("sawtooth");
				osc.dispose();
			});

			it("handles 4 basic types", function(){
				var osc = new Oscillator();
				var types = ["triangle", "sawtooth", "sine", "square"];
				for (var i = 0; i < types.length; i++){
					osc.type = types[i];
					expect(osc.type).to.equal(types[i]);
				}
				osc.dispose();
			});

			it("throws an error if invalid type is set", function(){
				var osc = new Oscillator();
				expect(function(){
					osc.type = "invalid";
				}).to.throw(Error);
				osc.dispose();
			});

			it("can set extended types", function(){
				var osc = new Oscillator();
				osc.type = "sine5";
				expect(osc.type).to.equal("sine5");
				osc.type = "triangle2";
				expect(osc.type).to.equal("triangle2");
				osc.dispose();
			});
		});

		context("Partials", function(){

			it("can pass partials in the constructor", function(){
				var osc = new Oscillator({
					"partials" : [1, 0.3, 0.3],
					"type" : "custom"
				});
				expect(osc.type).to.equal("custom");
				expect(osc.partials[1]).to.equal(0.3);
				osc.dispose();
			});

			it("can set partials", function(){
				var osc = new Oscillator();
				osc.partials = [1, 0.2, 0.2, 0.2];
				expect(osc.type).to.equal("custom");
				expect(osc.partials[1]).to.equal(0.2);
				osc.dispose();
			});

			it("makes a sound with custom partials", function(){
				return OutputAudio(function(){
					var osc = new Oscillator().toMaster().start();
					osc.partials = [1, 0.2, 0.2, 0.2];
				});
			});

			it("outputs empty array when type is not 'custom'", function(){
				var osc = new Oscillator({
					"partials" : [1, 0.3, 0.3],
					"type" : "custom"
				});
				expect(osc.type).to.equal("custom");
				expect(osc.partials[1]).to.equal(0.3);
				osc.type = "sine2";
				expect(osc.type).to.equal("sine2");
				expect(osc.partials.length).to.equal(0);
				osc.dispose();
			});

		});

		context("Synchronization", function(){
			it("can sync the frequency to the Transport", function(){
				return Offline(function(Transport){
					Transport.bpm.value = 120;
					var osc = new Oscillator(2);
					osc.frequency.toMaster();
					osc.syncFrequency();
					Transport.bpm.value = 240;
				}).then(function(buffer){
					expect(buffer.value()).to.be.closeTo(4, 0.001);
				});
			});

			it("can unsync the frequency from the Transport", function(){
				return Offline(function(Transport){
					Transport.bpm.value = 120;
					var osc = new Oscillator(2);
					osc.frequency.toMaster();
					osc.syncFrequency();
					Transport.bpm.value = 240;
					osc.unsyncFrequency();
				}).then(function(buffer){
					expect(buffer.value()).to.be.closeTo(2, 0.001);
				});
			});
		});

	});
});
