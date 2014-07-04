define(["tests/Core", "chai", "Tone/component/Recorder", "Tone/signal/Signal", "Tone/signal/Add", "Tone/signal/Multiply", 
	"Tone/signal/Scale", "Tone/source/Oscillator", "Tone/core/Master", "Tone/signal/Abs", "Tone/signal/Negate"], 
function(core, chai, Recorder, Signal, Add, Multiply, Scale, Oscillator, Master, Abs, Negate){

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
			});
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

	//ADD
	describe("Tone.Abs", function(){
		this.timeout(500);

		var recorder = new Recorder();

		after(function(){
			recorder.dispose();
		});

		it("can be created and disposed", function(){
			var ab = new Abs();
			ab.dispose();
		});

		it("outputs the same value for positive values", function(done){
			var signal = new Signal(1);
			var abs = new Abs();
			signal.connect(abs);
			signal.noGC();
			abs.connect(recorder);
			recorder.record(0.1, 0.05, function(buffers){
				var buffer = buffers[0];
				//get the left buffer and check that all values are === 1
				for (var i = 0; i < buffer.length; i++){
					expect(buffer[i]).to.equal(1);
				}
				signal.dispose();
				abs.dispose();
				done();
			});
		});

		it("outputs the absolute value for negative numbers", function(done){
			var signal = new Signal(-10);
			signal.noGC();
			var abs = new Abs();
			signal.connect(abs);
			var recorder = new Recorder();
			abs.connect(recorder);
			recorder.record(0.1, 0.05, function(buffers){
				var buffer = buffers[0];
				//get the left buffer and check that all values are === 1
				for (var i = 0; i < buffer.length; i++){
					expect(buffer[i]).to.equal(10);
				}
				abs.dispose();
				signal.dispose();
				done();
			});
		});
	});

	//NEGATE
	describe("Tone.Negate", function(){
		this.timeout(500);

		var recorder = new Recorder();

		after(function(){
			recorder.dispose();
		});

		it("can be created and disposed", function(){
			var neg = new Negate();
			neg.dispose();
		});

		it("negates a positive value", function(done){
			var signal = new Signal(1);
			signal.noGC();
			var neg = new Negate();
			signal.connect(neg);
			neg.connect(recorder);
			recorder.record(0.1, 0.05, function(buffers){
				var buffer = buffers[0];
				//get the left buffer and check that all values are === 1
				for (var i = 0; i < buffer.length; i++){
					expect(buffer[i]).to.equal(-1);
				}
				signal.dispose();
				neg.dispose();
				done();
			});
		});

		it("makes a negative value positive", function(done){
			var signal = new Signal(-10);
			signal.noGC();
			var neg = new Negate();
			signal.connect(neg);
			var recorder = new Recorder();
			neg.connect(recorder);
			recorder.record(0.1, 0.05, function(buffers){
				var buffer = buffers[0];
				//get the left buffer and check that all values are === 1
				for (var i = 0; i < buffer.length; i++){
					expect(buffer[i]).to.equal(10);
				}
				neg.dispose();
				signal.dispose();
				done();
			});
		});
	});


});