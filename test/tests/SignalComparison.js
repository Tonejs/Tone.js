/* global it, describe, maxTimeout */

define(["tests/Core", "chai", "Tone/signal/Signal", "Tone/signal/EqualZero",
	"Tone/signal/Equal", "Tone/signal/GreaterThan", "Tone/signal/LessThan", "tests/Common"], 
function(core, chai, Signal, EqualZero, Equal, GreaterThan, LessThan, Test){

	var expect = chai.expect;

	describe("Tone.EqualZero", function(){
		this.timeout(maxTimeout);

		it("can be created and disposed", function(){
			var ez = new EqualZero();
			ez.dispose();
			Test.wasDisposed(ez, expect);
		});

		it("outputs 1 when the incoming signal is 0", function(done){
			var signal, ez;
			Test.offlineTest(0.2, function(dest){
				signal = new Signal(0);
				ez = new EqualZero();
				signal.connect(ez);
				ez.connect(dest);
			}, function(sample){
				expect(sample).to.equal(1);
			}, function(){
				signal.dispose();
				ez.dispose();
				done();
			});
		});

		it("outputs 0 when the incoming signal is not 0", function(done){
			var signal, ez;
			Test.offlineTest(0.2, function(dest){
				signal = new Signal(10);
				ez = new EqualZero();
				signal.connect(ez);
				ez.connect(dest);
			}, function(sample){
				expect(sample).to.equal(0);
			}, function(){
				signal.dispose();
				ez.dispose();
				done();
			});
		});

		it("is not fooled by values very close to 0", function(done){
			var signal, ez;
			Test.offlineTest(0.2, function(dest){
				signal = new Signal(0.00001);
				ez = new EqualZero();
				signal.connect(ez);
				ez.connect(dest);
			}, function(sample){
				expect(sample).to.equal(0);
			}, function(){
				signal.dispose();
				ez.dispose();
				done();
			});
		});
	});

	describe("Tone.Equal", function(){
		this.timeout(maxTimeout);

		it("can be created and disposed", function(){
			var eq = new Equal(3);
			eq.dispose();
			Test.wasDisposed(eq, expect);
		});

		it("outputs 1 when the incoming signal is equal to the value", function(done){
			var signal, eq;
			Test.offlineTest(0.2, function(dest){
				signal = new Signal(12.22);
				eq = new Equal(12.22);
				signal.connect(eq);
				eq.connect(dest);
			}, function(sample){
				expect(sample).to.equal(1);
			}, function(){
				signal.dispose();
				eq.dispose();
				done();
			});
		});

		it("outputs 0 when the incoming signal is not equal", function(done){
			var signal, eq;
			Test.offlineTest(0.2, function(dest){
				signal = new Signal(12.23);
				eq = new Equal(12.22);
				signal.connect(eq);
				eq.connect(dest);
			}, function(sample){
				expect(sample).to.equal(0);
			}, function(){
				signal.dispose();
				eq.dispose();
				done();
			});
		});

		it("outputs 0 when the incoming signal is very close but not equal", function(done){
			var signal, eq;
			Test.offlineTest(0.2, function(dest){
				signal = new Signal(1.22001);
				eq = new Equal(1.22);
				signal.connect(eq);
				eq.connect(dest);
			}, function(sample){
				expect(sample).to.equal(0);
			}, function(){
				signal.dispose();
				eq.dispose();
				done();
			});
		});
	});
	
	describe("Tone.GreaterThan", function(){
		this.timeout(maxTimeout);

		it("can be created and disposed", function(){
			var gt = new GreaterThan();
			gt.dispose();
			Test.wasDisposed(gt, expect);
		});

		it("outputs 1 when the incoming signal is greater than the value", function(done){
			var signal, gt;
			Test.offlineTest(0.2, function(dest){
				signal = new Signal(3);
				gt = new GreaterThan(2);
				signal.connect(gt);
				gt.connect(dest);
			}, function(sample){
				expect(sample).to.equal(1);
			}, function(){
				signal.dispose();
				gt.dispose();
				done();
			});
		});

		it("outputs 0 when the incoming signal less than the value", function(done){
			var signal, gt;
			Test.offlineTest(0.2, function(dest){
				signal = new Signal(-101);
				gt = new GreaterThan(-100);
				signal.connect(gt);
				gt.connect(dest);
			}, function(sample){
				expect(sample).to.equal(0);
			}, function(){
				signal.dispose();
				gt.dispose();
				done();
			});
		});

		it("outputs 0 when the incoming signal is equal to the value", function(done){
			var signal, gt;
			Test.offlineTest(0.2, function(dest){
				signal = new Signal(100);
				gt = new GreaterThan(100);
				signal.connect(gt);
				gt.connect(dest);
			}, function(sample){
				expect(sample).to.equal(0);
			}, function(){
				signal.dispose();
				gt.dispose();
				done();
			});
		});

		it("set be set to a new value", function(done){
			var signal, gt;
			Test.offlineTest(0.2, function(dest){
				signal = new Signal(100);
				gt = new GreaterThan(200);
				signal.connect(gt);
				gt.connect(dest);
				gt.setValue(50);
			}, function(sample){
				expect(sample).to.equal(1);
			}, function(){
				signal.dispose();
				gt.dispose();
				done();
			});
		});
	});

	describe("Tone.LessThan", function(){
		this.timeout(maxTimeout);

		it("can be created and disposed", function(){
			var lt = new LessThan(2);
			lt.dispose();
			Test.wasDisposed(lt, expect);
		});

		it("outputs 1 when the incoming signal is less than the value", function(done){
			var signal, lt;
			Test.offlineTest(0.2, function(dest){
				signal = new Signal(100);
				lt = new LessThan(200);
				signal.connect(lt);
				lt.connect(dest);
			}, function(sample){
				expect(sample).to.equal(1);
			}, function(){
				signal.dispose();
				lt.dispose();
				done();
			});
		});

		it("outputs 0 when the incoming signal greater than the value", function(done){
			var signal, lt;
			Test.offlineTest(0.2, function(dest){
				signal = new Signal(1.01);
				lt = new LessThan(1);
				signal.connect(lt);
				lt.connect(dest);
			}, function(sample){
				expect(sample).to.equal(0);
			}, function(){
				signal.dispose();
				lt.dispose();
				done();
			});
		});

		it("outputs 0 when the incoming signal is equal the value", function(done){
			var signal, lt;
			Test.offlineTest(0.2, function(dest){
				signal = new Signal(1.01);
				lt = new LessThan(1.01);
				signal.connect(lt);
				lt.connect(dest);
			}, function(sample){
				expect(sample).to.equal(0);
			}, function(){
				signal.dispose();
				lt.dispose();
				done();
			});
		});
	});
});