/* global it, describe, recorderDelay, recorderDuration, maxTimeout, after*/

define(["tests/Core", "chai", "Tone/component/DryWet", "Tone/core/Master", "Tone/signal/Signal", 
"Tone/component/Recorder", "Tone/component/Panner", "Tone/component/LFO", "Tone/component/Gate", 
"Tone/component/Follower", "Tone/component/Envelope", "Tone/component/Filter", "Tone/component/EQ", 
"Tone/component/Merge", "Tone/component/Split"],
function(coreTest, chai, DryWet, Master, Signal, Recorder, Panner, LFO, Gate, Follower, Envelope, 
	Filter, EQ, Merge, Split){
	var expect = chai.expect;

	Master.mute();

	describe("Tone.DryWet", function(){
		this.timeout(maxTimeout);

		var dryWet, drySignal, wetSignal, recorder;

		it("can be created and disposed", function(){
			var dw = new DryWet();
			dw.dispose();
		});

		it("pass 100% dry signal", function(done){
			dryWet = new DryWet();
			drySignal = new Signal(10);
			wetSignal = new Signal(20);
			drySignal.connect(dryWet.dry);
			wetSignal.connect(dryWet.wet);
			recorder = new Recorder();
			dryWet.connect(recorder);
			dryWet.setDry(1);
			recorder.record(recorderDuration, recorderDelay, function(buffers){
				var buffer = buffers[0];
				for (var i = 0; i < buffer.length; i++){
					expect(buffer[i]).to.equal(10);
				}
				dryWet.dispose();
				drySignal.dispose();
				wetSignal.dispose();
				recorder.dispose();
				done();
			});
		});


		it("pass 100% wet signal", function(done){
			dryWet = new DryWet();
			drySignal = new Signal(10);
			wetSignal = new Signal(20);
			drySignal.connect(dryWet.dry);
			wetSignal.connect(dryWet.wet);
			recorder = new Recorder();
			dryWet.connect(recorder);
			dryWet.setWet(1);
			recorder.record(recorderDuration, recorderDelay, function(buffers){
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
			drySignal = new Signal(10);
			wetSignal = new Signal(20);
			drySignal.connect(dryWet.dry);
			wetSignal.connect(dryWet.wet);
			recorder = new Recorder();
			dryWet.connect(recorder);
			dryWet.setWet(1);
			recorder.record(recorderDuration, recorderDelay, function(buffers){
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
	});

	describe("Tone.Recorder", function(){
		this.timeout(maxTimeout);

		var recorder = new Recorder();

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
			recorder.record(recorderDuration, recorderDelay, function(buffers){
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
		this.timeout(maxTimeout);

		var panner = new Panner();

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
			recorder.record(recorderDuration, recorderDelay, function(buffers){
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
		this.timeout(maxTimeout);

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
			recorder.record(recorderDuration, recorderDelay, function(buffers){
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
			recorder.record(recorderDuration, recorderDelay, function(buffers){
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
		this.timeout(maxTimeout);

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
			recorder.record(recorderDuration, recorderDelay, function(buffers){
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
			recorder.record(recorderDuration, recorderDelay, function(buffers){
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
		this.timeout(maxTimeout);

		it("can be created and disposed", function(){
			var f = new Follower();
			f.dispose();
		});

		it("smoothes the incoming signal", function(done){
			var foll = new Follower(recorderDuration, 0.5);
			var sig = new Signal(0);
			var recorder = new Recorder();
			sig.connect(foll);
			foll.connect(recorder);
			sig.setValueAtTime(1, "+", recorderDelay);
			recorder.record(recorderDuration, recorderDelay, function(buffers){
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
		this.timeout(maxTimeout);

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

	describe("Tone.Filter", function(){
		this.timeout(maxTimeout);

		it("can be created and disposed", function(){
			var f = new Filter();
			f.dispose();
		});

		it ("can take parameters as both an object and as arguments", function(){
			var f0 = new Filter({
				"frequency" : 1000,
				"type" : "highpass"
			});
			expect(f0.frequency.value).to.equal(1000);
			expect(f0.getType()).to.equal("highpass");
			f0.dispose();
			var f1 = new Filter(200, "bandpass");
			expect(f1.frequency.value).to.equal(200);
			expect(f1.getType()).to.equal("bandpass");
			f1.dispose();
		});

	});

	describe("Tone.EQ", function(){
		this.timeout(maxTimeout);

		it("can be created and disposed", function(){
			var eq = new EQ();
			eq.dispose();
		});

	});

	//MERGE
	describe("Tone.Merge", function(){
		this.timeout(maxTimeout);

		it("can be created and disposed", function(){
			var mer = new Merge();
			mer.dispose();
		});

		it("merge two signal into one stereo signal", function(done){
			//make an oscillator to drive the signal
			var sigL = new Signal(1);
			var sigR = new Signal(2);
			var merger = new Merge();
			sigL.connect(merger.left);
			sigR.connect(merger.right);
			var recorder = new Recorder(2);
			merger.connect(recorder);
			recorder.record(recorderDuration, recorderDelay, function(buffers){
				var lBuffer = buffers[0];
				var rBuffer = buffers[1];
				//get the left buffer and check that all values are === 1
				for (var i = 0; i < lBuffer.length; i++){
					expect(lBuffer[i]).to.equal(1);
					expect(rBuffer[i]).to.equal(2);
				}
				done();
			});
		});
	});

	//SCALE
	describe("Tone.Split", function(){
		this.timeout(maxTimeout);

		it("can be created and disposed", function(){
			var split = new Split();
			split.dispose();
		});

		it("merges two signal into one stereo signal and then split them back into two signals on left side", function(done){
			//make an oscillator to drive the signal
			var sig = new Signal(1);
			var merger = new Merge();
			var split = new Split();
			sig.connect(merger.left);
			merger.connect(split);
			var recorder = new Recorder();
			split.left.connect(recorder);
			recorder.record(recorderDuration, recorderDelay, function(buffers){
				var lBuffer = buffers[0];
				for (var i = 0; i < lBuffer.length; i++){
					expect(lBuffer[i]).to.equal(1);
				}
				done();
			});
		});

		it("merges two signal into one stereo signal and then split them back into two signals on right side", function(done){
			//make an oscillator to drive the signal
			var sig = new Signal(2);
			var merger = new Merge();
			var split = new Split();
			sig.connect(merger.right);
			merger.connect(split);
			var recorder = new Recorder();
			split.right.connect(recorder);
			recorder.record(recorderDuration, recorderDelay, function(buffers){
				var lBuffer = buffers[0];
				for (var i = 0; i < lBuffer.length; i++){
					expect(lBuffer[i]).to.equal(2);
				}
				done();
			});
		});
	});

});