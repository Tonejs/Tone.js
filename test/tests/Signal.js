define(["chai", "Recorder", "Tone/signal/Signal", "Tone/signal/Add", "Tone/signal/Multiply", 
	"Tone/signal/Scale", "Tone/source/Oscillator", "Tone/signal/Merge", "Tone/signal/Split"], 
function(chai, Recorder, Signal, Add, Multiply, Scale, Oscillator, Merge, Split){

	var expect = chai.expect;

	//SIGNAL
	describe("Tone.Signal", function(){
		this.timeout(300);
		it("outputs correct value", function(done){
			var signal = new Signal(2);
			var recorder = new Recorder(signal, {
				workerPath : "./testDeps/recorderWorker.js"
			});
			recorder.record();
			setTimeout(function(){
				recorder.stop();
				recorder.getBuffer(function(buffers){
					var lBuffer = buffers[0];
					//get the left buffer and check that all values are === 1
					for (var i = 0; i < lBuffer.length; i++){
						expect(lBuffer[i]).to.equal(2);
					}
					done();
				});
			}, 100);
		});
		
		it("can change value with sample accurate timing", function(done){
			var signal = new Signal(0);
			var recorder = new Recorder(signal, {
				workerPath : "./testDeps/recorderWorker.js"
			});
			recorder.record();
			var waitTime = 0.05;
			signal.setValueAtTime(1, "+"+waitTime);//ramp after 50ms
			setTimeout(function(){
				recorder.stop();
				recorder.getBuffer(function(buffers){
					var lBuffer = buffers[0];
					//get the left buffer and check that all values are === 1
					for (var i = 0; i < lBuffer.length; i++){
						if (lBuffer[i] === 1){
							//check the time that it took to reach 1
							//use closeTo to account for the time that it took to setup
							expect(signal.samplesToSeconds(i)).is.closeTo(waitTime, 0.01);
							break;
						}
					}
					done();
				});
			}, 100);
		});

		it("can sync to another signal", function(done){
			var signal0 = new Signal(1);
			var signal1 = new Signal(2);
			//sync signal1 to signal0
			signal1.sync(signal0);
			//change signal0 and signal1 should also change
			signal0.setValue(2);
			var recorder = new Recorder(signal1, {
				workerPath : "./testDeps/recorderWorker.js"
			});
			recorder.record();
			setTimeout(function(){
				recorder.stop();
				recorder.getBuffer(function(buffers){
					var lBuffer = buffers[0];
					//get the left buffer and check that all values are === 1
					for (var i = 0; i < lBuffer.length; i++){
						expect(lBuffer[i]).to.equal(4);
					}
					done();
				});
			}, 100);
		});		
	});

	//ADD
	describe("Tone.Add", function(){
		this.timeout(300);
		it("correctly sums a signal and a number", function(done){
			var signal = new Signal(0);
			var adder = new Add(3);
			signal.connect(adder);
			var recorder = new Recorder(adder, {
				workerPath : "./testDeps/recorderWorker.js"
			});
			recorder.record();
			setTimeout(function(){
				recorder.stop();
				recorder.getBuffer(function(buffers){
					var lBuffer = buffers[0];
					//get the left buffer and check that all values are === 1
					for (var i = 0; i < lBuffer.length; i++){
						expect(lBuffer[i]).to.equal(3);
					}
					done();
				});
			}, 100);
		});
		it("can handle negative values", function(done){
			var signal = new Signal(10);
			var adder = new Add(-1);
			signal.connect(adder);
			var recorder = new Recorder(adder, {
				workerPath : "./testDeps/recorderWorker.js"
			});
			recorder.record();
			setTimeout(function(){
				recorder.stop();
				recorder.getBuffer(function(buffers){
					var lBuffer = buffers[0];
					//get the left buffer and check that all values are === 1
					for (var i = 0; i < lBuffer.length; i++){
						expect(lBuffer[i]).to.equal(9);
					}
					done();
				});
			}, 100);
		});
	});

	//MULTIPLY
	describe("Tone.Multiply", function(){
		this.timeout(300);
		it("correctly multiplys a signal and a scalar", function(done){
			var signal = new Signal(2);
			var mult = new Multiply(10);
			signal.connect(mult);
			var recorder = new Recorder(mult, {
				workerPath : "./testDeps/recorderWorker.js"
			});
			recorder.record();
			setTimeout(function(){
				recorder.stop();
				recorder.getBuffer(function(buffers){
					var lBuffer = buffers[0];
					//get the left buffer and check that all values are === 1
					for (var i = 0; i < lBuffer.length; i++){
						expect(lBuffer[i]).to.equal(20);
					}
					done();
				});
			}, 100);
		});
	});

	//SCALE
	describe("Tone.Scale", function(){
		this.timeout(300);
		it("scales an input range to an output range", function(done){
			//make an oscillator to drive the signal
			var osc = new Oscillator(1000);
			osc.start();
			var scale = new Scale(-1, 1, 10, 20);
			osc.connect(scale);
			var recorder = new Recorder(scale, {
				workerPath : "./testDeps/recorderWorker.js"
			});
			recorder.record();
			setTimeout(function(){
				recorder.stop();
				recorder.getBuffer(function(buffers){
					var lBuffer = buffers[0];
					//get the left buffer and check that all values are === 1
					for (var i = 0; i < lBuffer.length; i++){
						expect(lBuffer[i]).is.within(10, 20);
					}
					done();
				});
			}, 100);
		});
	});

	//SCALE
	describe("Tone.Merge", function(){
		this.timeout(300);
		it("merge two signal into one stereo signal", function(done){
			//make an oscillator to drive the signal
			var sigL = new Signal(1);
			var sigR = new Signal(2);
			var merger = new Merge();
			sigL.connect(merger.left);
			sigR.connect(merger.right);
			var recorder = new Recorder(merger, {
				workerPath : "./testDeps/recorderWorker.js"
			});
			recorder.record();
			setTimeout(function(){
				recorder.stop();
				recorder.getBuffer(function(buffers){
					var lBuffer = buffers[0];
					var rBuffer = buffers[1];
					//get the left buffer and check that all values are === 1
					for (var i = 0; i < lBuffer.length; i++){
						expect(lBuffer[i]).to.equal(1);
						expect(rBuffer[i]).to.equal(2);
					}
					done();
				});
			}, 100);
		});
	});

	//SCALE
	describe("Tone.Split", function(){
		this.timeout(300);
		it("merges two signal into one stereo signal and then split them back into two signals", function(done){
			//make an oscillator to drive the signal
			var sigL = new Signal(1);
			var sigR = new Signal(2);
			var merger = new Merge();
			var split = new Split();
			sigL.connect(merger.left);
			sigR.connect(merger.right);
			merger.connect(split);
			var recorderR = new Recorder(split.left, {
				workerPath : "./testDeps/recorderWorker.js"
			});
			var recorderL = new Recorder(split.right, {
				workerPath : "./testDeps/recorderWorker.js"
			});

			recorderR.record();
			recorderL.record();
			setTimeout(function(){
				recorderR.stop();
				recorderL.stop();
				//test the left side
				recorderL.getBuffer(function(buffers){
					var lBuffer = buffers[0];
					var rBuffer = buffers[1];
					//get the left buffer and check that all values are === 1
					for (var i = 0; i < lBuffer.length; i++){
						expect(lBuffer[i]).to.equal(1);
						expect(rBuffer[i]).to.equal(1);
					}
					done();
				});
				//test the right side
				recorderR.getBuffer(function(buffers){
					var lBuffer = buffers[0];
					var rBuffer = buffers[1];
					//get the left buffer and check that all values are === 1
					for (var i = 0; i < lBuffer.length; i++){
						expect(lBuffer[i]).to.equal(2);
						expect(rBuffer[i]).to.equal(2);
					}
					done();
				});
			}, 100);
		});
	});
});