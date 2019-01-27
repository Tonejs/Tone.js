import Gate from "Tone/component/Gate";
import Basic from "helper/Basic";
import Offline from "helper/Offline";
import Test from "helper/Test";
import Signal from "Tone/signal/Signal";
import PassAudio from "helper/PassAudio";
import Tone from "Tone/type/Type";
import Oscillator from "Tone/source/Oscillator";
import CompareToFile from "helper/CompareToFile";
describe("Gate", function(){

	Basic(Gate);

	it("matches a file", function(){
		return CompareToFile(function(){
			var gate = new Gate(-10, 0.1).toMaster();
			var osc = new Oscillator().connect(gate);
			osc.start(0);
			osc.volume.value = -100;
			osc.volume.exponentialRampToValueAtTime(0, 0.5);
		}, "gate.wav", 0.18);
	});

	context("Signal Gating", function(){

		it("handles input and output connections", function(){
			var gate = new Gate();
			Test.connect(gate);
			gate.connect(Test);
			gate.dispose();
		});

		it("handles getter/setter as Object", function(){
			var gate = new Gate();
			var values = {
				"smoothing" : 0.2,
				"threshold" : -20
			};
			gate.set(values);
			expect(gate.get().smoothing).to.be.closeTo(0.2, 0.001);
			expect(gate.get().threshold).to.be.closeTo(-20, 0.1);
			gate.dispose();
		});

		it("can be constructed with an object", function(){
			var gate = new Gate({
				"smoothing" : 0.3,
				"threshold" : -5
			});
			expect(gate.smoothing).to.be.closeTo(0.3, 0.001);
			expect(gate.threshold).to.be.closeTo(-5, 0.1);
			gate.dispose();
		});

		it("gates the incoming signal when below the threshold", function(){
			return Offline(function(){
				var gate = new Gate(-9);
				var sig = new Signal(-12, Tone.Type.Decibels);
				sig.connect(gate);
				gate.toMaster();
			}).then(function(buffer){
				expect(buffer.isSilent()).to.be.true;
			});
		});

		it("passes the incoming signal when above the threshold", function(){
			it("gates the incoming signal when below the threshold", function(){
				return Offline(function(){
					var gate = new Gate(-11);
					var sig = new Signal(-10, Tone.Type.Decibels);
					sig.connect(gate);
					gate.toMaster();
				}).then(function(buffer){
					expect(buffer.min()).to.be.above(0);
				});
			});
		});

	});
});

