import LFO from "Tone/component/LFO";
import Basic from "helper/Basic";
import Offline from "helper/Offline";
import Test from "helper/Test";
import OutputAudio from "helper/OutputAudio";
import Tone from "Tone/type/Type";
import Signal from "Tone/signal/Signal";
describe("LFO", function(){

	Basic(LFO);

	context("API", function(){
		it("can get the current state", function(done){
			var lfo = new LFO();
			expect(lfo.state).to.equal("stopped");
			lfo.start();
			expect(lfo.state).to.equal("started");
			lfo.dispose();
			done();
		});
	});

	context("Low Oscillations", function(){

		it("handles output connections", function(){
			var lfo = new LFO();
			lfo.connect(Test);
			lfo.dispose();
		});

		it("can be started and stopped", function(){
			var lfo = new LFO();
			lfo.start();
			lfo.stop();
			lfo.dispose();
		});

		it("can be constructed with an object", function(){
			var lfo = new LFO({
				"type" : "triangle2",
				"frequency" : 0.3
			});
			expect(lfo.type).to.equal("triangle2");
			expect(lfo.frequency.value).to.be.closeTo(0.3, 0.001);
			lfo.dispose();
		});

		it("handles getters/setters as objects", function(){
			var lfo = new LFO();
			var values = {
				"type" : "square",
				"min" : -1,
				"max" : 2,
				"phase" : 180,
				"frequency" : "8n",
			};
			lfo.set(values);
			expect(lfo.get()).to.contain.keys(Object.keys(values));
			expect(lfo.type).to.equal(values.type);
			expect(lfo.min).to.equal(values.min);
			expect(lfo.max).to.equal(values.max);
			expect(lfo.phase).to.equal(values.phase);
			lfo.dispose();
		});

		it("outputs a signal", function(){
			return OutputAudio(function(){
				var lfo = new LFO(100, 10, 20);
				lfo.toMaster();
				lfo.start();
			});
		});

		it("can be creates an oscillation in a specific range", function(){
			return Offline(function(){
				var lfo = new LFO(100, 10, 20).toMaster();
				lfo.start();
			}).then(function(buffer){
				expect(buffer.min()).to.be.gte(10);
				expect(buffer.max()).to.be.lte(20);
			});
		});

		it("can change the oscillation range", function(){
			return Offline(function(){
				var lfo = new LFO(100, 10, 20).toMaster();
				lfo.start();
				lfo.min = 15;
				lfo.max = 18;
			}).then(function(buffer){
				expect(buffer.min()).to.be.gte(15);
				expect(buffer.max()).to.be.lte(18);
			});
		});

		it("initially outputs a signal at the center of it's phase", function(){
			return Offline(function(){
				new LFO(100, 10, 20).toMaster();
			}).then(function(buffer){
				expect(buffer.value()).to.be.closeTo(15, 0.1);
			});
		});

		it("outputs a signal at the correct phase angle", function(){
			return Offline(function(){
				new LFO({
					"phase" : 90,
					"min" : 0
				}).toMaster();
			}).then(function(buffer){
				expect(buffer.value()).to.be.closeTo(0, 0.1);
			});
		});

		it("outputs the right phase when setting a new phase", function(){
			return Offline(function(){
				var lfo = new LFO({
					"phase" : 0,
					"min" : -1,
					"max" : 1
				}).toMaster();
				lfo.phase = 270;
			}).then(function(buffer){
				expect(buffer.value()).to.be.closeTo(1, 0.1);
			});
		});

		it("can convert to other units", function(){
			return Offline(function(){
				var lfo = new LFO({
					"units" : Tone.Type.Decibels,
					"min" : -20,
					"max" : 5,
					"frequency" : 20
				}).toMaster();
				lfo.start();
			}).then(function(buffer){
				expect(buffer.min()).to.be.closeTo(0.099, 0.01);
				expect(buffer.max()).to.be.closeTo(1.78, 0.01);
			});
		});

		it("can converts to the units of the connecting node", function(){
			return Offline(function(){
				var lfo = new LFO(20, -35, -10);
				var signal = new Signal(0, Tone.Type.Decibels);
				expect(lfo.units).to.equal(Tone.Type.Default);
				lfo.toMaster();
				lfo.connect(signal);
				expect(lfo.units).to.equal(Tone.Type.Decibels);
				lfo.start();
			}).then(function(buffer){
				expect(buffer.min()).to.be.closeTo(0.017, 0.01);
				expect(buffer.max()).to.be.closeTo(0.31, 0.01);
			});
		});

		it("can sync the frequency to the Transport", function(){
			return Offline(function(Transport){
				var lfo = new LFO(2);
				lfo.sync();
				lfo.frequency.toMaster();
				Transport.bpm.setValueAtTime(Transport.bpm.value * 2, 0.05);
				// Transport.start(0)
			}, 0.1).then(function(buffer){
				expect(buffer.getValueAtTime(0)).to.be.closeTo(2, 0.1);
				expect(buffer.getValueAtTime(0.05)).to.be.closeTo(4, 0.1);
			});
		});

		it("can unsync the frequency to the Transport", function(){
			return Offline(function(Transport){
				var lfo = new LFO(2);
				lfo.sync();
				lfo.frequency.toMaster();
				Transport.bpm.setValueAtTime(Transport.bpm.value * 2, 0.05);
				lfo.unsync();
				// Transport.start(0)
			}, 0.1).then(function(buffer){
				expect(buffer.getValueAtTime(0)).to.be.closeTo(2, 0.1);
				expect(buffer.getValueAtTime(0.05)).to.be.closeTo(2, 0.1);
			});
		});
	});
});

