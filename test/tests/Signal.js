/* global it, describe */

define(["tests/Core", "chai", "Tone/component/Recorder", "Tone/signal/Signal", "Tone/source/Oscillator", 
	"Tone/signal/Merge", "Tone/signal/Split","Tone/core/Master", "Tone/signal/Threshold", "Tone/signal/Switch", 
	"Tone/signal/Route", "Tone/signal/Selector"], 
function(core, chai, Recorder, Signal, Oscillator, Merge, Split, Master, Threshold, Switch, Route, Selector){

	var expect = chai.expect;

	Master.mute();

	//SIGNAL
	describe("Tone.Signal", function(){
		this.timeout(1000);


		it("can be created and disposed", function(){
			var s = new Signal();
			s.dispose();
		});

		it("can start with a value initially", function(){
			var signal = new Signal(0);
			expect(signal.getValue()).to.equal(0);
			signal.dispose();
		});

		it("can set a value", function(){
			var signal = new Signal(0);
			signal.setValue(10);
			expect(signal.getValue()).to.equal(10);
			signal.dispose();
		});

		it("can set a value in the future", function(done){
			var sig = new Signal(10);
			sig.noGC();
			sig.setValueAtTime(100, "+0.1");
			expect(sig.getValue()).to.equal(10);
			var recorder = new Recorder();
			sig.connect(recorder);
			recorder.record(0.1, 0.1, function(buffers){
				var buffer = buffers[0];
				var reached100 = false;
				for (var i = 0; i < buffer.length; i++){
					if (buffer[i] === 100){
						reached100 = true;
						break;
					} 
				}
				expect(reached100).to.be.true;
				sig.dispose();
				done();
			});
		});

		it("can change value with sample accurate timing", function(done){			
			var changeSignal = new Signal(0);
			changeSignal.setValueAtTime(1, "+0.1");
			var recorder = new Recorder();
			changeSignal.connect(recorder);
			recorder.record(0.1, 0.1, function(buffers){
				var buffer = buffers[0];
				for (var i = 0; i < buffer.length; i++){
					if (buffer[i] === 1){
						expect(changeSignal.samplesToSeconds(i)).is.closeTo(0.1, 0.01);
						changeSignal.dispose();
						recorder.dispose();
						done();
						break;
					}
				}
			});
		});
		
		it("can sync to another signal", function(done){
			var syncTo = new Signal(1);
			var signalSync = new Signal(2);
			signalSync.sync(syncTo);
			syncTo.setValue(2);
			syncTo.noGC();
			signalSync.noGC();
			var recorder = new Recorder();
			signalSync.connect(recorder);
			recorder.record(0.1, 0.1, function(buffers){
				var buffer = buffers[0];
				for (var i = 0; i < buffer.length; i++){
					expect(buffer[i]).to.equal(4);
				}
				signalSync.dispose();
				recorder.dispose();
				done();
			});
		});	

		it("can ramp from the current value", function(done){
			var sig1 = new Signal(0);
			sig1.setValue(-10);
			sig1.noGC();
			var recorder = new Recorder(1);
			sig1.connect(recorder);
			var waitTime = 0.1;
			expect(sig1.getValue()).to.equal(-10);
			sig1.linearRampToValueNow(1, waitTime);
			recorder.record(0.1, 0.1, function(buffers){
				var buffer = buffers[0];
				for (var i = 0; i < buffer.length; i++){
					if (buffer[i] === 1){
						expect(sig1.samplesToSeconds(i)).is.closeTo(0.1, 0.01);
						done();
						sig1.dispose();
						break;
					}
				}
			});
		});
	});


	//MERGE
	describe("Tone.Merge", function(){
		this.timeout(1000);

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
			recorder.record(0.1, 0.1, function(buffers){
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
		this.timeout(1000);

		it("can be created and disposed", function(){
			var split = new Split();
			split.dispose();
		});

		it("merges two signal into one stereo signal and then split them back into two signals", function(done){
			//make an oscillator to drive the signal
			var sigL = new Signal(1);
			var sigR = new Signal(2);
			var merger = new Merge();
			var split = new Split();
			sigL.connect(merger.left);
			sigR.connect(merger.right);
			merger.connect(split);
			var recorderL = new Recorder();
			var recorderR = new Recorder();
			split.left.connect(recorderL);
			split.right.connect(recorderR);
			recorderL.record(0.1, 0.1, function(buffers){
				var lBuffer = buffers[0];
				for (var i = 0; i < lBuffer.length; i++){
					expect(lBuffer[i]).to.equal(1);
				}
			});
			recorderR.record(0.1, 0.1, function(buffers){
				var rBuffer = buffers[0];
				for (var j = 0; j < rBuffer.length; j++){
					expect(rBuffer[j]).to.equal(2);
				}
				done();
			});
		});
	});


	//THRESHOLD
	describe("Tone.Threshold", function(){
		this.timeout(1000);

		it("can be created and disposed", function(){
			var thresh = new Threshold();
			thresh.dispose();
		});

		it("thresholds an incoming signal to 0 when it is below the thresh", function(done){
			var signal = new Signal(0.1);
			var thresh = new Threshold(0.5);
			signal.connect(thresh);
			var recorder = new Recorder();
			thresh.connect(recorder);
			recorder.record(0.1, 0.1, function(buffers){
				var buffer = buffers[0];
				//get the left buffer and check that all values are === 1
				for (var i = 0; i < buffer.length; i++){
					expect(buffer[i]).to.equal(0);
				}
				signal.dispose();
				thresh.dispose();
				done();
			});
		});

		it("thresholds an incoming signal to 1 when it is above the thresh", function(done){
			var signal = new Signal(0.8);
			var thresh = new Threshold(0.5);
			signal.connect(thresh);
			var recorder = new Recorder();
			thresh.connect(recorder);
			recorder.record(0.1, 0.1, function(buffers){
				var buffer = buffers[0];
				//get the left buffer and check that all values are === 1
				for (var i = 0; i < buffer.length; i++){
					expect(buffer[i]).to.equal(1);
				}
				signal.dispose();
				thresh.dispose();
				done();
			});
		});

		it("thresholds an incoming signal that is very close to the thresh", function(done){
			var signal = new Signal(0.4999);
			var thresh = new Threshold(0.5);
			signal.connect(thresh);
			var recorder = new Recorder();
			thresh.connect(recorder);
			recorder.record(0.1, 0.1, function(buffers){
				var buffer = buffers[0];
				//get the left buffer and check that all values are === 1
				for (var i = 0; i < buffer.length; i++){
					expect(buffer[i]).to.equal(0);
				}
				signal.dispose();
				thresh.dispose();
				done();
			});
		});

	});

	//Switch
	describe("Tone.Switch", function(){
		this.timeout(1000);

		it("can be created and disposed", function(){
			var sw = new Switch();
			sw.dispose();
		});

		it("can stop a signal from passing through", function(done){
			var signal = new Signal(10);
			var gate = new Switch();
			signal.connect(gate);
			var recorder = new Recorder();
			gate.connect(recorder);
			recorder.record(0.1, 0.1, function(buffers){
				var buffer = buffers[0];
				//get the left buffer and check that all values are === 1
				for (var i = 0; i < buffer.length; i++){
					expect(buffer[i]).to.equal(0);
				}
				signal.dispose();
				gate.dispose();
				done();
			});
		});

		it("can allow a signal to pass through", function(done){
			var signal = new Signal(10);
			var gate = new Switch();
			signal.connect(gate);
			gate.open();
			var recorder = new Recorder();
			gate.connect(recorder);
			recorder.record(0.1, 0.1, function(buffers){
				var buffer = buffers[0];
				//get the left buffer and check that all values are === 1
				for (var i = 0; i < buffer.length; i++){
					expect(buffer[i]).to.equal(10);
				}
				signal.dispose();
				gate.dispose();
				done();
			});
		});
	});

	//Route
	describe("Tone.Route", function(){
		this.timeout(1000);

		it("can be created and disposed", function(){
			var r = new Route();
			r.dispose();
		});

		it("can route a signal to first output", function(done){
			var signal = new Signal(10);
			var route = new Route();
			signal.connect(route);
			var recorderL = new Recorder();
			var recorderR = new Recorder();
			route.connect(recorderL, 0, 0);
			route.connect(recorderR, 1, 0);
			recorderL.record(0.1, 0.1, function(buffers){
				var buffer = buffers[0];
				//get the left buffer and check that all values are === 1
				for (var i = 0; i < buffer.length; i++){
					expect(buffer[i]).to.equal(10);
				}
				signal.dispose();
				route.dispose();
				done();
			});
			recorderR.record(0.1, 0.1, function(buffers){
				var buffer = buffers[0];
				//get the left buffer and check that all values are === 1
				for (var i = 0; i < buffer.length; i++){
					expect(buffer[i]).to.equal(0);
				}
				done();
			});
		});

		it("can route a signal to the second input", function(done){
			var signal = new Signal(20);
			var route = new Route();
			route.select(1);
			signal.connect(route);
			var recorderL = new Recorder();
			var recorderR = new Recorder();
			route.connect(recorderL, 0, 0);
			route.connect(recorderR, 1, 0);
			recorderL.record(0.1, 0.1, function(buffers){
				var buffer = buffers[0];
				//get the left buffer and check that all values are === 1
				for (var i = 0; i < buffer.length; i++){
					expect(buffer[i]).to.equal(0);
				}
				signal.dispose();
				route.dispose();
				done();
			});
			recorderR.record(0.1, 0.1, function(buffers){
				var buffer = buffers[0];
				//get the left buffer and check that all values are === 1
				for (var i = 0; i < buffer.length; i++){
					expect(buffer[i]).to.equal(20);
				}
				done();
			});
		});

	});

	//Selector
	describe("Tone.Selector", function(){
		this.timeout(1000);

		it("can be created and disposed", function(){
			var s = new Selector();
			s.dispose();
		});

		it("can select the first signal", function(done){
			var signal0 = new Signal(10);
			var signal1 = new Signal(20);
			var sel = new Selector();
			signal0.connect(sel, 0, 0);
			signal1.connect(sel, 0, 1);
			sel.select(0);
			var recorder = new Recorder();
			sel.connect(recorder, 0, 0);
			recorder.record(0.1, 0.1, function(buffers){
				var buffer = buffers[0];
				//get the left buffer and check that all values are === 1
				for (var i = 0; i < buffer.length; i++){
					expect(buffer[i]).to.equal(10);
				}
				signal0.dispose();
				signal1.dispose();
				sel.dispose();
				done();
			});
		});

		it("can select the second signal", function(done){
			var signal0 = new Signal(11);
			var signal1 = new Signal(21);
			var sel = new Selector();
			signal0.connect(sel, 0, 0);
			signal1.connect(sel, 0, 1);
			sel.select(1);
			var recorder = new Recorder();
			sel.connect(recorder, 0, 0);
			recorder.record(0.1, 0.1, function(buffers){
				var buffer = buffers[0];
				//get the left buffer and check that all values are === 1
				for (var i = 0; i < buffer.length; i++){
					expect(buffer[i]).to.equal(21);
				}
				signal0.dispose();
				signal1.dispose();
				sel.dispose();
				done();
			});
		});

	});

});