define(["chai", "Tone/component/Recorder", "Tone/signal/Signal", "Tone/signal/Add", "Tone/signal/Multiply", 
	"Tone/signal/Scale", "Tone/source/Oscillator", "Tone/signal/Merge", "Tone/signal/Split"], 
function(chai, Recorder, Signal, Add, Multiply, Scale, Oscillator, Merge, Split){

	var expect = chai.expect;

	//SIGNAL
	describe("Tone.Signal", function(){
		this.timeout(300);
		it("outputs correct value", function(done){
			var signal = new Signal(2);
			var recorder = new Recorder();
			signal.connect(recorder);
			recorder.record(0.05);
			setTimeout(function(){
				var buffer = recorder.getFloat32Array()[0];
				for (var i = 0; i < buffer.length; i++){
					expect(buffer[i]).to.equal(2);
				}
				done();
			}, 100);
		});
		
		it("can change value with sample accurate timing", function(done){
			var signal = new Signal(0);
			var recorder = new Recorder(1);
			signal.connect(recorder);
			var waitTime = 0.03;
			recorder.record(0.05);
			signal.setValueAtTime(1, "+"+waitTime);//ramp after 50ms
			setTimeout(function(){
				var buffer = recorder.getFloat32Array()[0];
				for (var i = 0; i < buffer.length; i++){
					if (buffer[i] === 1){
						expect(signal.samplesToSeconds(i)).is.closeTo(waitTime, 0.01);
						done();
						break;
					}
				}
			}, 100);
		});

		it("can sync to another signal", function(done){
			var signal0 = new Signal(1);
			var signal1 = new Signal(2);
			//sync signal1 to signal0
			signal1.sync(signal0);
			//change signal0 and signal1 should also change
			signal0.setValue(2);
			var recorder = new Recorder();
			signal1.connect(recorder);
			recorder.record(0.05);
			setTimeout(function(){
				var buffer = recorder.getFloat32Array()[0];
				for (var i = 0; i < buffer.length; i++){
					expect(buffer[i]).to.equal(4);
				}
				done();
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
			var recorder = new Recorder();
			adder.connect(recorder);
			recorder.record(0.05);
			setTimeout(function(){
				var buffer = recorder.getFloat32Array()[0];
				//get the left buffer and check that all values are === 1
				for (var i = 0; i < buffer.length; i++){
					expect(buffer[i]).to.equal(3);
				}
				done();
			}, 100);
		});
		it("can handle negative values", function(done){
			var signal = new Signal(10);
			var adder = new Add(-1);
			signal.connect(adder);
			var recorder = new Recorder();
			adder.connect(recorder);
			recorder.record(0.05);
			setTimeout(function(){
				var buffer = recorder.getFloat32Array()[0];
				//get the left buffer and check that all values are === 1
				for (var i = 0; i < buffer.length; i++){
					expect(buffer[i]).to.equal(9);
				}
				done();
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
			var recorder = new Recorder();
			mult.connect(recorder);
			recorder.record(0.05);
			setTimeout(function(){
				var buffer = recorder.getFloat32Array()[0];
				//get the left buffer and check that all values are === 1
				for (var i = 0; i < buffer.length; i++){
					expect(buffer[i]).to.equal(20);
				}
				done();
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
			var recorder = new Recorder();
			scale.connect(recorder);
			recorder.record(0.05);
			setTimeout(function(){
				var buffer = recorder.getFloat32Array()[0];
				//get the left buffer and check that all values are === 1
				for (var i = 0; i < buffer.length; i++){
					expect(buffer[i]).to.be.within(10, 20);
				}
				done();
			}, 100);
		});
	});

	//MERGE
	describe("Tone.Merge", function(){
		this.timeout(300);
		it("merge two signal into one stereo signal", function(done){
			//make an oscillator to drive the signal
			var sigL = new Signal(1);
			var sigR = new Signal(2);
			var merger = new Merge();
			sigL.connect(merger.left);
			sigR.connect(merger.right);
			var recorder = new Recorder(2);
			merger.connect(recorder);
			recorder.record(0.05);
			setTimeout(function(){
				var buffers = recorder.getFloat32Array();				
				var lBuffer = buffers[0];
				var rBuffer = buffers[1];
				//get the left buffer and check that all values are === 1
				for (var i = 0; i < lBuffer.length; i++){
					expect(lBuffer[i]).to.equal(1);
					expect(rBuffer[i]).to.equal(2);
				}
				done();
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
			var recorderL = new Recorder();
			var recorderR = new Recorder();
			split.left.connect(recorderL);
			split.right.connect(recorderR);
			recorderL.record(0.05);
			recorderR.record(0.05);
			setTimeout(function(){
				//test the left side
				var lBuffer = recorderL.getFloat32Array()[0];
				for (var i = 0; i < lBuffer.length; i++){
					expect(lBuffer[i]).to.equal(1);
				}
				//test the right side
				var rBuffer = recorderR.getFloat32Array()[0];
				for (var j = 0; j < rBuffer.length; j++){
					expect(rBuffer[j]).to.equal(2);
				}
				done();
			}, 100);
		});
	});
});