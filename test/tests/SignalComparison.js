/* global it, describe, recorderDelay, recorderDuration, maxTimeout */

define(["tests/Core", "chai", "Tone/component/Recorder", "Tone/signal/Signal", "Tone/core/Master", "Tone/signal/EqualZero",
	"Tone/signal/Equal", "Tone/signal/GreaterThan", "Tone/signal/LessThan"], 
function(core, chai, Recorder, Signal, Master, EqualZero, Equal, GreaterThan, LessThan){

	var expect = chai.expect;

	Master.mute();

	//EQUALS 0
	describe("Tone.EqualZero", function(){
		this.timeout(maxTimeout);

		it("can be created and disposed", function(){
			var ez = new EqualZero();
			ez.dispose();
		});

		it("outputs 1 when the incoming signal is 0", function(done){
			var signal = new Signal(0);
			var ez = new EqualZero();
			signal.connect(ez);
			var recorder = new Recorder();
			ez.connect(recorder);
			recorder.record(recorderDuration, recorderDelay, function(buffers){
				var buffer = buffers[0];
				//get the left buffer and check that all values are === 1
				for (var i = 0; i < buffer.length; i++){
					expect(buffer[i]).to.equal(1);
				}
				signal.dispose();
				ez.dispose();
				done();
			});
		});

		it("outputs 0 when the incoming signal is not 0", function(done){
			var signal = new Signal(100);
			var ez = new EqualZero();
			signal.connect(ez);
			var recorder = new Recorder();
			ez.connect(recorder);
			recorder.record(recorderDuration, recorderDelay, function(buffers){
				var buffer = buffers[0];
				//get the left buffer and check that all values are === 1
				for (var i = 0; i < buffer.length; i++){
					expect(buffer[i]).to.equal(0);
				}
				signal.dispose();
				ez.dispose();
				done();
			});
		});

		it("is not fooled by values very close to 0", function(done){
			var signal = new Signal(0.00001);
			var ez = new EqualZero();
			signal.connect(ez);
			var recorder = new Recorder();
			ez.connect(recorder);
			recorder.record(recorderDuration, recorderDelay, function(buffers){
				var buffer = buffers[0];
				//get the left buffer and check that all values are === 1
				for (var i = 0; i < buffer.length; i++){
					expect(buffer[i]).to.equal(0);
				}
				signal.dispose();
				ez.dispose();
				done();
			});
		});

	});

	//EQUALS
	describe("Tone.Equal", function(){
		this.timeout(maxTimeout);

		it("can be created and disposed", function(){
			var eq = new Equal(3);
			eq.dispose();
		});

		it("outputs 1 when the incoming signal is equal to the value", function(done){
			var signal = new Signal(3);
			var eq = new Equal(3);
			signal.connect(eq);
			var recorder = new Recorder();
			eq.connect(recorder);
			recorder.record(recorderDuration, recorderDelay, function(buffers){
				var buffer = buffers[0];
				//get the left buffer and check that all values are === 1
				for (var i = 0; i < buffer.length; i++){
					expect(buffer[i]).to.equal(1);
				}
				signal.dispose();
				eq.dispose();
				done();
			});
		});

		it("outputs 0 when the incoming signal is not equal", function(done){
			var signal = new Signal(100);
			var eq = new EqualZero(200);
			signal.connect(eq);
			var recorder = new Recorder();
			eq.connect(recorder);
			recorder.record(recorderDuration, recorderDelay, function(buffers){
				var buffer = buffers[0];
				//get the left buffer and check that all values are === 1
				for (var i = 0; i < buffer.length; i++){
					expect(buffer[i]).to.equal(0);
				}
				signal.dispose();
				eq.dispose();
				done();
			});
		});

	});

	//GREATER THAN
	describe("Tone.GreaterThan", function(){
		this.timeout(maxTimeout);

		it("can be created and disposed", function(){
			var gt = new GreaterThan();
			gt.dispose();
		});

		it("outputs 1 when the incoming signal is greater than the value", function(done){
			var signal = new Signal(3);
			var gt = new GreaterThan(2);
			signal.connect(gt);
			var recorder = new Recorder();
			gt.connect(recorder);
			recorder.record(recorderDuration, recorderDelay, function(buffers){
				var buffer = buffers[0];
				//get the left buffer and check that all values are === 1
				for (var i = 0; i < buffer.length; i++){
					expect(buffer[i]).to.equal(1);
				}
				signal.dispose();
				gt.dispose();
				done();
			});
		});

		it("outputs 0 when the incoming signal less than the value", function(done){
			var signal = new Signal(-101);
			var gt = new GreaterThan(-100);
			signal.connect(gt);
			var recorder = new Recorder();
			gt.connect(recorder);
			recorder.record(recorderDuration, recorderDelay, function(buffers){
				var buffer = buffers[0];
				//get the left buffer and check that all values are === 1
				for (var i = 0; i < buffer.length; i++){
					expect(buffer[i]).to.equal(0);
				}
				signal.dispose();
				gt.dispose();
				done();
			});
		});

		it("set be set to a new value", function(done){
			var signal = new Signal(100);
			var gt = new GreaterThan(200);
			signal.connect(gt);
			gt.setValue(50);
			var recorder = new Recorder();
			gt.connect(recorder);
			recorder.record(recorderDuration, recorderDelay, function(buffers){
				var buffer = buffers[0];
				//get the left buffer and check that all values are === 1
				for (var i = 0; i < buffer.length; i++){
					expect(buffer[i]).to.equal(1);
				}
				signal.dispose();
				gt.dispose();
				done();
			});
		});
	});

	//LESS THAN
	describe("Tone.LessThan", function(){
		this.timeout(maxTimeout);

		it("can be created and disposed", function(){
			var lt = new LessThan(2);
			lt.dispose();
		});

		it("outputs 1 when the incoming signal is less than the value", function(done){
			var signal = new Signal(0);
			var lt = new LessThan(2);
			signal.connect(lt);
			var recorder = new Recorder();
			lt.connect(recorder);
			recorder.record(recorderDuration, recorderDelay, function(buffers){
				var buffer = buffers[0];
				//get the left buffer and check that all values are === 1
				for (var i = 0; i < buffer.lenlth; i++){
					expect(buffer[i]).to.equal(1);
				}
				signal.dispose();
				lt.dispose();
				done();
			});
		});

		it("outputs 0 when the incoming signal greater than the value", function(done){
			var signal = new Signal(1.01);
			var lt = new LessThan(1);
			signal.connect(lt);
			var recorder = new Recorder();
			lt.connect(recorder);
			recorder.record(recorderDuration, recorderDelay, function(buffers){
				var buffer = buffers[0];
				//get the left buffer and check that all values are === 1
				for (var i = 0; i < buffer.lenlth; i++){
					expect(buffer[i]).to.equal(0);
				}
				signal.dispose();
				lt.dispose();
				done();
			});
		});

		it("outputs 0 when the incoming signal is equal the value", function(done){
			var signal = new Signal(-20);
			var lt = new LessThan(-20);
			signal.connect(lt);
			var recorder = new Recorder();
			lt.connect(recorder);
			recorder.record(recorderDuration, recorderDelay, function(buffers){
				var buffer = buffers[0];
				//get the left buffer and check that all values are === 1
				for (var i = 0; i < buffer.lenlth; i++){
					expect(buffer[i]).to.equal(0);
				}
				signal.dispose();
				lt.dispose();
				done();
			});
		});


	});

});