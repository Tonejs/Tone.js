import AmplitudeEnvelope from "Tone/component/AmplitudeEnvelope";
import Basic from "helper/Basic";
import Offline from "helper/Offline";
import Envelope from "Tone/component/Envelope";
import Test from "helper/Test";
import Signal from "Tone/signal/Signal";
import CompareToFile from "helper/CompareToFile";
import Oscillator from "Tone/source/Oscillator";
describe("AmplitudeEnvelope", function(){

	Basic(AmplitudeEnvelope);

	context("Comparisons", function(){

		it("matches a file", function(){
			return CompareToFile(function(){
				var ampEnv = new AmplitudeEnvelope({
					attack : 0.1,
					decay : 0.2,
					sustain : 0.1,
					release : 0.2,
				}).toMaster();
				var osc = new Oscillator().start(0).connect(ampEnv);
				ampEnv.triggerAttack(0);
				ampEnv.triggerRelease(0.3);
			}, "ampEnvelope.wav");
		});

		it("matches a file with multiple retriggers", function(){
			return CompareToFile(function(){
				var ampEnv = new AmplitudeEnvelope({
					attack : 0.1,
					decay : 0.2,
					sustain : 0.1,
					release : 0.2,
				}).toMaster();
				var osc = new Oscillator().start(0).connect(ampEnv);
				ampEnv.triggerAttack(0);
				ampEnv.triggerAttack(0.3);
			}, "ampEnvelope2.wav", 0.004);
		});

		it("matches a file with ripple attack/release", function(){
			return CompareToFile(function(){
				var ampEnv = new AmplitudeEnvelope({
					attack : 0.5,
					attackCurve : "ripple",
					decay : 0.2,
					sustain : 0.1,
					release : 0.3,
					releaseCurve : "ripple",
				}).toMaster();
				var osc = new Oscillator().start(0).connect(ampEnv);
				ampEnv.triggerAttack(0);
				ampEnv.triggerRelease(0.7);
				ampEnv.triggerAttack(1);
				ampEnv.triggerRelease(1.6);
			}, "ampEnvelope3.wav", 0.002);
		});

	});

	context("Envelope", function(){

		it("handles input and output connections", function(){
			var ampEnv = new AmplitudeEnvelope();
			Test.connect(ampEnv);
			ampEnv.connect(Test);
			ampEnv.dispose();
		});

		it("extends envelope", function(){
			var ampEnv = new AmplitudeEnvelope();
			expect(ampEnv).to.be.instanceOf(Envelope);
			ampEnv.dispose();
		});

		it("passes no signal before being triggered", function(){
			return Offline(function(){
				var ampEnv = new AmplitudeEnvelope().toMaster();
				new Signal(1).connect(ampEnv);
			}).then(function(buffer){
				expect(buffer.isSilent()).to.be.true;
			});
		});

		it("passes signal once triggered", function(){
			return Offline(function(){
				var ampEnv = new AmplitudeEnvelope().toMaster();
				new Signal(1).connect(ampEnv);
				ampEnv.triggerAttack(0.1);
			}, 0.2).then(function(buffer){
				expect(buffer.getFirstSoundTime()).to.be.closeTo(0.1, 0.001);
			});
		});
	});
});

