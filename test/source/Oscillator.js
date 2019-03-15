import BasicTests from "helper/Basic";
import Oscillator from "Tone/source/Oscillator";
import Offline from "helper/Offline";
import SourceTests from "helper/SourceTests";
import OscillatorTests from "helper/OscillatorTests";
import OutputAudio from "helper/OutputAudio";
import Transport from "Tone/core/Transport";
import CompareToFile from "helper/CompareToFile";

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

		it("only returns partials when type is 'custom'", function(){
			var osc = new Oscillator(450, "square");
			expect(osc.get().partials).to.be.undefined;
			osc.partials = [0, 1, 2, 3];
			expect(osc.get().type).to.equal("custom");
			expect(osc.get().partials).to.deep.equal([0, 1, 2, 3]);
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

		it("can get/set the baseType", function(){
			var osc = new Oscillator();
			osc.type = "sine5";
			expect(osc.baseType).to.equal("sine");
			osc.baseType = "triangle";
			expect(osc.type).to.equal("triangle5");
			expect(osc.partialCount).to.equal(5);
			osc.partialCount = 2;
			expect(osc.type).to.equal("triangle2");
			osc.baseType = "custom";
			expect(osc.type).to.equal("custom");
			osc.partials = [1, 2, 3];
			expect(osc.baseType).to.equal("custom");
			osc.baseType = "square";
			expect(osc.type).to.equal("square");
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

		it("outputs the partials of the given waveform", function(){
			var osc = new Oscillator();
			osc.type = "sine2";
			expect(osc.type).to.equal("sine2");
			expect(osc.partials.length).to.equal(2);
			expect(osc.partials).to.deep.equal([1, 1]);
			osc.dispose();
		});

		it("partialCount is 0 when set to max", function(){
			var osc = new Oscillator();
			expect(osc.partialCount).to.equal(0);
			osc.type = "square32";
			expect(osc.partialCount).to.equal(32);
			osc.type = "square";
			expect(osc.partialCount).to.equal(0);
			osc.dispose();
		});

		it("can pass in number of partials into constructor", function(){
			var osc = new Oscillator({
				"type" : "sine",
				"partialCount" : 3
			});
			expect(osc.type).to.equal("sine3");
			expect(osc.partialCount).to.equal(3);
			osc.partialCount = 4;
			expect(osc.partialCount).to.equal(4);
			expect(osc.type).to.equal("sine4");
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

