/* global it, describe, maxTimeout */

define(["tests/Core", "chai", "Tone/signal/Signal", "Tone/signal/EqualZero",
	"Tone/signal/Equal", "Tone/signal/GreaterThan", "Tone/signal/LessThan", 
	"tests/Common", "Tone/signal/GreaterThanZero"], 
function(core, chai, Signal, EqualZero, Equal, GreaterThan, LessThan, Test, GreaterThanZero){

	var expect = chai.expect;

	describe("Tone.GreaterThanZero", function(){
		this.timeout(maxTimeout);

		it("can be created and disposed", function(){
			var gtz = new GreaterThanZero(2);
			gtz.dispose();
			Test.wasDisposed(gtz);
		});

		it("outputs 0 when the incoming signal is equal to zero", function(done){
			var signal, gtz;
			Test.offlineTest(0.2, function(dest){
				signal = new Signal(0);
				gtz = new GreaterThanZero();
				signal.connect(gtz);
				gtz.connect(dest);
			}, function(sample){
				expect(sample).to.equal(0);
			}, function(){
				signal.dispose();
				gtz.dispose();
				done();
			});
		});

		it("outputs 0 when the incoming signal is less than zero", function(done){
			var signal, gtz;
			Test.offlineTest(0.2, function(dest){
				signal = new Signal(-1);
				gtz = new GreaterThanZero();
				signal.connect(gtz);
				gtz.connect(dest);
			}, function(sample){
				expect(sample).to.equal(0);
			}, function(){
				signal.dispose();
				gtz.dispose();
				done();
			});
		});

		it("outputs 1 when the incoming signal is greater than zero", function(done){
			var signal, gtz;
			Test.offlineTest(0.2, function(dest){
				signal = new Signal(0.5);
				gtz = new GreaterThanZero();
				signal.connect(gtz);
				gtz.connect(dest);
			}, function(sample){
				expect(sample).to.equal(1);
			}, function(){
				signal.dispose();
				gtz.dispose();
				done();
			});
		});

		it("can handle values very close to 0", function(done){
			var signal, gtz;
			Test.offlineTest(0.2, function(dest){
				signal = new Signal(0.00001);
				gtz = new GreaterThanZero();
				signal.connect(gtz);
				gtz.connect(dest);
			}, function(sample){
				expect(sample).to.equal(1);
			}, function(){
				signal.dispose();
				gtz.dispose();
				done();
			});
		});
	});

	describe("Tone.EqualZero", function(){
		this.timeout(maxTimeout);

		it("can be created and disposed", function(){
			var ez = new EqualZero();
			ez.dispose();
			Test.wasDisposed(ez);
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
			Test.wasDisposed(eq);
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

		it("can compare two signals", function(done){
			var sigA, sigB, eq;
			Test.offlineTest(0.2, function(dest){
				sigA = new Signal(5);
				sigB = new Signal(5);
				eq = new Equal();
				sigA.connect(eq, 0, 0);
				sigB.connect(eq, 0, 1);
				eq.connect(dest);
			}, function(sample){
				expect(sample).to.equal(1);
			}, function(){
				sigA.dispose();
				sigB.dispose();
				eq.dispose();
				done();
			});
		});
	});
	
	describe("Tone.GreaterThan", function(){
		this.timeout(maxTimeout);

		it("can be created and disposed", function(){
			var gt = new GreaterThan(0);
			gt.dispose();
			Test.wasDisposed(gt);
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

		it("can be set to a new value", function(done){
			var signal, gt;
			Test.offlineTest(0.2, function(dest){
				signal = new Signal(100);
				gt = new GreaterThan(200);
				signal.connect(gt);
				gt.connect(dest);
				gt.value = 50;
			}, function(sample){
				expect(sample).to.equal(1);
			}, function(){
				signal.dispose();
				gt.dispose();
				done();
			});
		});

		it("can compare two signals", function(done){
			var sigA, sigB, gt;
			Test.offlineTest(0.2, function(dest){
				sigA = new Signal(3);
				sigB = new Signal(5);
				gt = new GreaterThan();
				sigA.connect(gt, 0, 0);
				sigB.connect(gt, 0, 1);
				gt.connect(dest);
			}, function(sample){
				expect(sample).to.equal(0);
			}, function(){
				sigA.dispose();
				sigB.dispose();
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
			Test.wasDisposed(lt);
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

		it("can be set to a new value", function(done){
			var signal, lt;
			Test.offlineTest(0.2, function(dest){
				signal = new Signal(100);
				lt = new LessThan(200);
				signal.connect(lt);
				lt.connect(dest);
				lt.value = 50;
			}, function(sample){
				expect(sample).to.equal(0);
			}, function(){
				signal.dispose();
				lt.dispose();
				done();
			});
		});

		it("can compare two signals", function(done){
			var sigA, sigB, lt;
			Test.offlineTest(0.2, function(dest){
				sigA = new Signal(-3);
				sigB = new Signal(5);
				lt = new LessThan();
				sigA.connect(lt, 0, 0);
				sigB.connect(lt, 0, 1);
				lt.connect(dest);
			}, function(sample){
				expect(sample).to.equal(1);
			}, function(){
				sigA.dispose();
				sigB.dispose();
				lt.dispose();
				done();
			});
		});
	});
});