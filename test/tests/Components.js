/* global it, describe, after */

define(["tests/Core", "chai", "Tone/component/DryWet", "Tone/core/Master", "Tone/signal/Signal", 
"Tone/component/Recorder", "Tone/component/Panner", "Tone/component/LFO", "Tone/component/Gate", 
"Tone/component/Follower", "Tone/component/Envelope"],
function(coreTest, chai, DryWet, Master, Signal, Recorder, Panner, LFO, Gate, Follower, Envelope){
	var expect = chai.expect;

	Master.mute();

	describe("Tone.DryWet", function(){
		this.timeout(1000);

		var dryWet, drySignal, wetSignal, recorder;

		it("can be created and disposed", function(){
			var dw = new DryWet();
			dw.dispose();
		});

		it("pass 100% dry signal", function(done){
			dryWet = new DryWet();
			dryWet.toMaster();
			drySignal = new Signal(10);
			wetSignal = new Signal(20);
			drySignal.connect(dryWet.dry);
			wetSignal.connect(dryWet.wet);
			recorder = new Recorder();
			dryWet.connect(recorder);
			dryWet.setDry(1);
			recorder.record(0.05, 0.1, function(buffers){
				var buffer = buffers[0];
				for (var i = 0; i < buffer.length; i++){
					expect(buffer[i]).to.equal(10);
				}
				done();
				dryWet.dispose();
				drySignal.dispose();
				wetSignal.dispose();
				recorder.dispose();
			});
		});


		it("pass 100% wet signal", function(done){
			dryWet = new DryWet();
			dryWet.toMaster();
			drySignal = new Signal(10);
			wetSignal = new Signal(20);
			drySignal.connect(dryWet.dry);
			wetSignal.connect(dryWet.wet);
			recorder = new Recorder();
			dryWet.connect(recorder);
			dryWet.setWet(1);
			recorder.record(0.05, 0.1, function(buffers){
				var buffer = buffers[0];
				for (var i = 0; i < buffer.length; i++){
					expect(buffer[i]).to.equal(20);
				}
				done();
				dryWet.dispose();
				drySignal.dispose();
				wetSignal.dispose();
				recorder.dispose();
			});
		});
		
		it("can mix two signals", function(done){
			dryWet = new DryWet();
			dryWet.toMaster();
			drySignal = new Signal(10);
			drySignal.noGC();
			wetSignal = new Signal(20);
			drySignal.connect(dryWet.dry);
			wetSignal.connect(dryWet.wet);
			wetSignal.noGC();
			recorder = new Recorder();
			dryWet.connect(recorder);
			dryWet.setWet(1);
			recorder.record(0.05, 0.1, function(buffers){
				var buffer = buffers[0];
				for (var i = 0; i < buffer.length; i++){
					expect(buffer[i]).to.equal(20);
				}
				done();
				dryWet.dispose();
				drySignal.dispose();
				wetSignal.dispose();
				recorder.dispose();
			});
		});
		
		it("can ramp from dry to wet", function(done){
			dryWet = new DryWet();
			drySignal = new Signal(10);
			wetSignal = new Signal(20);
			drySignal.connect(dryWet.dry);
			wetSignal.connect(dryWet.wet);
			recorder = new Recorder();
			recorder.toMaster();
			dryWet.connect(recorder);
			dryWet.setWet(0);
			dryWet.setWet(1, 0.05);
			recorder.record(0.1, 0.0, function(buffers){
				var buffer = buffers[0];
				expect(buffer[0]).to.be.closeTo(10, 0.01);
				for (var i = 0; i < buffer.length; i++){
					if (buffer[i] === 20){
						expect(recorder.samplesToSeconds(i)).to.be.closeTo(0.05, 0.01);
						break;
					}
				}
				done();
				dryWet.dispose();
				drySignal.dispose();
				wetSignal.dispose();
				recorder.dispose();
			});
		});
	});

	describe("Tone.Recorder", function(){
		this.timeout(1000);

		var recorder = new Recorder();
		recorder.toMaster();

		after(function(){
			recorder.dispose();
		});

		it("can be created and disposed", function(){
			var rec = new Recorder();
			rec.dispose();
		});

		it("can record an incoming signal", function(done){
			var sig = new Signal(1);
			sig.connect(recorder);
			recorder.record(0.001, 0.1, function(buffers){
				var buffer = buffers[0];
				for (var i = 0; i < buffer.length; i++){
					expect(buffer[i]).to.equal(1);
				}
				sig.dispose();
				done();
			});
		});
	});

	describe("Tone.Panner", function(){
		this.timeout(1000);

		var panner = new Panner();
		panner.toMaster();

		after(function(){
			panner.dispose();
		});

		it("can be created and disposed", function(){
			var panner = new Panner();
			panner.dispose();
		});

		it("can pan an incoming signal", function(done){
			var sig = new Signal(1);
			sig.connect(panner);
			var recorder = new Recorder(2);
			panner.connect(recorder);
			//pan hard right
			panner.setPan(1);
			recorder.record(0.01, 0.1, function(buffers){
				var bufferL = buffers[0];
				var bufferR = buffers[1];
				for (var i = 0; i < bufferL.length; i++){
					expect(bufferL[i]).to.equal(0);
					expect(bufferR[i]).to.equal(1);
				}
				sig.dispose();
				recorder.dispose();
				done();
			});
		});
	});

	describe("Tone.LFO", function(){
		this.timeout(1000);

		it("can be created and disposed", function(){
			var l = new LFO();
			l.dispose();
		});

		it("can be started and stopped", function(){
			var lfo = new LFO();
			lfo.start();
			lfo.stop();
			lfo.dispose();
		});

		it("can be creates an oscillation in a specific range", function(done){
			var lfo = new LFO(100, 10, 20);
			lfo.start();
			var recorder = new Recorder();
			lfo.connect(recorder);
			recorder.record(0.01, 0.1, function(buffers){
				var buffer = buffers[0];
				for (var i = 0; i < buffer.length; i++){
					expect(buffer[i]).to.be.within(10, 20);
				}
				lfo.dispose();
				recorder.dispose();
				done();
			});
		});

		it("can change the oscillation range", function(done){
			var lfo = new LFO(100, 10, 20);
			lfo.start();
			lfo.setMin(15);
			var recorder = new Recorder();
			lfo.connect(recorder);
			recorder.record(0.01, 0.1, function(buffers){
				var buffer = buffers[0];
				for (var i = 0; i < buffer.length; i++){
					expect(buffer[i]).to.be.within(15, 20);
				}
				lfo.dispose();
				recorder.dispose();
				done();
			});
		});
	});


	describe("Tone.Gate", function(){
		this.timeout(1000);

		it("can be created and disposed", function(){
			var g = new Gate();
			g.dispose();
		});

		it("won't let signals below a db thresh through", function(done){
			var gate = new Gate(-10, 0.01);
			var sig = new Signal(gate.dbToGain(-11));
			var recorder = new Recorder();
			sig.connect(gate);
			gate.connect(recorder);
			recorder.record(0.01, 0.1, function(buffers){
				var buffer = buffers[0];
				for (var i = 0; i < buffer.length; i++){
					expect(buffer[i]).to.equal(0);
				}
				gate.dispose();
				sig.dispose();
				recorder.dispose();
				done();
			});
		});

		it("lets signals above the db thresh through", function(done){
			var gate = new Gate(-8, 0.01);
			var sig = new Signal(gate.dbToGain(-6));
			var recorder = new Recorder();
			sig.connect(gate);
			gate.connect(recorder);
			recorder.record(0.01, 0.1, function(buffers){
				var buffer = buffers[0];
				for (var i = 0; i < buffer.length; i++){
					expect(buffer[i]).to.greaterThan(0);
				}
				gate.dispose();
				sig.dispose();
				recorder.dispose();
				done();
			});
		});
	});

	describe("Tone.Follower", function(){
		this.timeout(1000);

		it("can be created and disposed", function(){
			var f = new Follower();
			f.dispose();
		});

		it("smoothes the incoming signal", function(done){
			var foll = new Follower(0.1);
			var sig = new Signal(0);
			var recorder = new Recorder();
			sig.connect(foll);
			sig.setValue(1);
			foll.connect(recorder);
			recorder.record(0.01, 0.1, function(buffers){
				var buffer = buffers[0];
				for (var i = 0; i < buffer.length; i++){
					expect(buffer[i]).to.lessThan(1);
				}
				foll.dispose();
				sig.dispose();
				recorder.dispose();
				done();
			});
		});

	});

	describe("Tone.Envelope", function(){
		this.timeout(1000);

		it("can be created and disposed", function(){
			var e = new Envelope();
			e.dispose();
		});

		it ("can take parameters as both an object and as arguments", function(){
			var e0 = new Envelope({
				"attack" : 0,
				"decay" : 0.5,
				"sustain" : 1
			});
			expect(e0.attack).to.equal(0);
			expect(e0.decay).to.equal(0.5);
			expect(e0.sustain).to.equal(1);
			e0.dispose();
			var e1 = new Envelope(0.1, 0.2, 0.3);
			expect(e1.attack).to.equal(0.1);
			expect(e1.decay).to.equal(0.2);
			expect(e1.sustain).to.equal(0.3);
			e1.dispose();
		});

	});

});