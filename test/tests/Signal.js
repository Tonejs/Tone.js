define(["tests/Core", "chai", "Tone/component/Recorder", "Tone/signal/Signal", "Tone/signal/Add", "Tone/signal/Multiply", 
	"Tone/signal/Scale", "Tone/source/Oscillator", "Tone/signal/Merge", "Tone/signal/Split","Tone/core/Master", "Tone/signal/EqualsZero"], 
function(core, chai, Recorder, Signal, Add, Multiply, Scale, Oscillator, Merge, Split, Master, EqualsZero){

	var expect = chai.expect;

	Master.mute();

	//SIGNAL
	describe("Tone.Signal", function(){
		this.timeout(1000);

		var signal = new Signal(0);
		signal.toMaster();

		after(function(){
			signal.dispose();
		});

		it("can be created and disposed", function(){
			var s = new Signal();
			s.dispose();
		});

		it("can start with a value initially", function(){
			expect(signal.getValue()).to.equal(0);
		});

		it("can set a value", function(){
			signal.setValue(10);
			expect(signal.getValue()).to.equal(10);
		});

		it("can set a value in the future", function(done){
			signal.setValueAtTime(100, "+0.1");
			expect(signal.getValue()).to.equal(10);
			var interval = setInterval(function(){
				if (signal.getValue() === 100){
					clearInterval(interval);
					done();
				}
			}, 10);
		});

		it("can change value with sample accurate timing", function(done){			
			var changeSignal = new Signal(0);
			var waitTime = 0.03;
			changeSignal.setValueAtTime(1, "+"+waitTime);//ramp after 50ms
			var recorder = new Recorder();
			changeSignal.connect(recorder);
			var delayTime = 0.05;
			recorder.record(0.1, delayTime, function(buffers){
				buffer = buffers[0];
				for (var i = 0; i < buffer.length; i++){
					if (buffer[i] === 1){
						expect(changeSignal.samplesToSeconds(i)).is.closeTo(delayTime - waitTime, 0.01);
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
			recorder.record(0.1, 0.05, function(buffers){
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
			signal.setValue(-10);
			signal.noGC();
			var recorder = new Recorder(1);
			signal.connect(recorder);
			var waitTime = 0.03;
			expect(signal.getValue()).to.equal(-10);
			signal.linearRampToValueNow(1, waitTime);
			recorder.record(0.1, 0.05, function(buffers){
				var buffer = buffers[0];
				for (var i = 0; i < buffer.length; i++){
					if (buffer[i] === 1){
						expect(signal.samplesToSeconds(i)).is.closeTo(waitTime, 0.01);
						done();
						break;
					}
				}
			});
		});
	});

	//ADD
	describe("Tone.Add", function(){
		this.timeout(500);

		var recorder = new Recorder();

		after(function(){
			recorder.dispose();
		});

		it("can be created and disposed", function(){
			var a = new Add(1);
			a.dispose();
		});

		it("correctly sums a signal and a number", function(done){
			var signal = new Signal(0);
			var adder = new Add(3);
			signal.connect(adder);
			adder.connect(recorder);
			recorder.record(0.1, 0.05, function(buffers){
				var buffer = buffers[0];
				//get the left buffer and check that all values are === 1
				for (var i = 0; i < buffer.length; i++){
					expect(buffer[i]).to.equal(3);
				}
				done();
			});
		});

		it("can handle negative values", function(done){
			var signal = new Signal(10);
			var adder = new Add(-1);
			signal.connect(adder);
			var recorder = new Recorder();
			adder.connect(recorder);
			recorder.record(0.1, 0.05, function(buffers){
				var buffer = buffers[0];
				//get the left buffer and check that all values are === 1
				for (var i = 0; i < buffer.length; i++){
					expect(buffer[i]).to.equal(9);
				}
				done();
			});
		});
	});

	//MULTIPLY
	describe("Tone.Multiply", function(){
		this.timeout(500);

		it("can be created and disposed", function(){
			var m = new Multiply(1);
			m.dispose();
		});

		it("correctly multiplys a signal and a scalar", function(done){
			var signal = new Signal(2);
			var mult = new Multiply(10);
			signal.connect(mult);
			var recorder = new Recorder();
			mult.connect(recorder);
			recorder.record(0.05, 0.05, function(buffers){
				var buffer = buffers[0];
				//get the left buffer and check that all values are === 1
				for (var i = 0; i < buffer.length; i++){
					expect(buffer[i]).to.equal(20);
				}
				signal.dispose();
				mult.dispose();
				done();
			}, 100);
		});
	});

	//SCALE
	describe("Tone.Scale", function(){
		this.timeout(500);

		it("can be created and disposed", function(){
			var s = new Scale(0, 10);
			s.dispose();
		});

		it("scales an input range to an output range", function(done){
			//make an oscillator to drive the signal
			var osc = new Oscillator(1000);
			osc.start();
			var scale = new Scale(-1, 1, 10, 20);
			osc.connect(scale);
			var recorder = new Recorder();
			scale.connect(recorder);
			recorder.record(0.05, 0.05, function(buffers){
				var buffer = buffers[0];
				//get the left buffer and check that all values are === 1
				for (var i = 0; i < buffer.length; i++){
					expect(buffer[i]).to.be.within(10, 20);
				}
				done();
			});
		});
	});

	//MERGE
	describe("Tone.Merge", function(){
		this.timeout(500);

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
			recorder.record(0.05, 0.05, function(buffers){
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
		this.timeout(500);

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
			recorderL.record(0.05, 0.1, function(buffers){
				var lBuffer = buffers[0];
				for (var i = 0; i < lBuffer.length; i++){
					expect(lBuffer[i]).to.equal(1);
				}
			});
			recorderR.record(0.05, 0.1, function(buffers){
				var rBuffer = recorderR.getFloat32Array()[0];
				for (var j = 0; j < rBuffer.length; j++){
					expect(rBuffer[j]).to.equal(2);
				}
				done();
			});
		});
	});

	//EQUALS 0
	describe("Tone.EqualsZero", function(){
		this.timeout(500);

		it("can be created and disposed", function(){
			var ez = new EqualsZero();
			ez.dispose();
		});

		it("outputs 1 when the incoming signal is 0", function(done){
			var signal = new Signal(0);
			var ez = new EqualsZero();
			signal.connect(ez);
			var recorder = new Recorder();
			ez.connect(recorder);
			recorder.record(0.05, 0.05, function(buffers){
				var buffer = buffers[0];
				//get the left buffer and check that all values are === 1
				for (var i = 0; i < buffer.length; i++){
					expect(buffer[i]).to.equal(1);
				}
				signal.dispose();
				ez.dispose();
				done();
			}, 100);
		});

		it("outputs 0 when the incoming signal is not 0", function(done){
			var signal = new Signal(100);
			var ez = new EqualsZero();
			signal.connect(ez);
			var recorder = new Recorder();
			ez.connect(recorder);
			recorder.record(0.05, 0.05, function(buffers){
				var buffer = buffers[0];
				//get the left buffer and check that all values are === 1
				for (var i = 0; i < buffer.length; i++){
					expect(buffer[i]).to.equal(0);
				}
				signal.dispose();
				ez.dispose();
				done();
			}, 100);
		});

		it("is not fooled by values very close to 0", function(done){
			var signal = new Signal(0.00001);
			var ez = new EqualsZero();
			signal.connect(ez);
			var recorder = new Recorder();
			ez.connect(recorder);
			recorder.record(0.05, 0.05, function(buffers){
				var buffer = buffers[0];
				//get the left buffer and check that all values are === 1
				for (var i = 0; i < buffer.length; i++){
					expect(buffer[i]).to.equal(0);
				}
				signal.dispose();
				ez.dispose();
				done();
			}, 100);
		});

	});

});