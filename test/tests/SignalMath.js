/* global it, describe, maxTimeout */

define(["tests/Core", "chai", "Tone/signal/Signal", "Tone/signal/Add", "Tone/signal/Multiply", 
	"Tone/signal/Scale", "Tone/source/Oscillator", "Tone/core/Master", "Tone/signal/Abs", "Tone/signal/Negate", 
	 "Tone/signal/Max", "Tone/signal/Min", "Tone/signal/Clip", "Tone/signal/ScaleExp", "Tone/signal/Modulo", "tests/Common"], 
function(core, chai, Signal, Add, Multiply, Scale, Oscillator, Master, Abs, Negate, Max, Min, Clip, ScaleExp, Modulo, Test){

	var expect = chai.expect;

	Master.mute();

	//ADD
	describe("Tone.Add", function(){
		this.timeout(maxTimeout);

		it("can be created and disposed", function(){
			var a = new Add(1);
			a.dispose();
			Test.wasDisposed(a, expect);
		});

		it("correctly sums a signal and a number", function(done){
			var signal, adder;
			Test.offlineTest(0.2, function(dest){
				signal = new Signal(0);
				adder = new Add(3);
				signal.connect(adder);
				adder.connect(dest);
			}, function(sample){
				expect(sample).to.equal(3);
			}, function(){
				signal.dispose();
				adder.dispose();
				done();
			});
		});

		it("can handle negative values", function(done){
			var signal, adder;
			Test.offlineTest(0.2, function(dest){
				signal = new Signal(10);
				adder = new Add(-1);
				signal.connect(adder);
				adder.connect(dest);
			}, function(sample){
				expect(sample).to.equal(9);
			}, function(){
				signal.dispose();
				adder.dispose();
				done();
			});
		});
	});

	//MULTIPLY
	describe("Tone.Multiply", function(){
		this.timeout(maxTimeout);

		it("can be created and disposed", function(){
			var m = new Multiply(1);
			m.dispose();
			Test.wasDisposed(m, expect);
		});

		it("correctly multiplys a signal and a scalar", function(done){
			var signal, mult;
			Test.offlineTest(0.2, function(dest){
				signal = new Signal(2);
				mult = new Multiply(10);
				signal.connect(mult);
				mult.connect(dest);
			}, function(sample){
				expect(sample).to.equal(20);
			}, function(){
				signal.dispose();
				mult.dispose();
				done();
			});
		});
	});

	describe("Tone.Scale", function(){
		this.timeout(maxTimeout);

		it("can be created and disposed", function(){
			var s = new Scale(0, 10);
			s.dispose();
			Test.wasDisposed(s, expect);
		});

		it("scales an input range to an output range", function(done){
			//make an oscillator to drive the signal
			var osc, scale;
			Test.offlineTest(0.2, function(dest){
				osc = new Oscillator(1000);
				scale = new Scale(-1, 1, 10, 20);
				osc.connect(scale);
				scale.connect(dest);
			}, function(sample){
				expect(sample).to.be.within(10, 20);
			}, function(){
				osc.dispose();
				scale.dispose();
				done();
			});
		});
	});

	//SCALE
	describe("Tone.ScaleExp", function(){
		this.timeout(maxTimeout);

		it("can be created and disposed", function(){
			var s = new ScaleExp(0, 10, 2);
			s.dispose();
			Test.wasDisposed(s, expect);
		});

		it("scales a signal exponentially", function(done){
			var signal, scale;
			Test.offlineTest(0.2, function(dest){
				signal = new Signal(0.5);
				scale = new ScaleExp(0, 1, 0, 1, 2);
				signal.connect(scale);
				scale.connect(dest);
			}, function(sample){
				expect(sample).to.be.closeTo(0.25, 0.01);
			}, function(){
				signal.dispose();
				scale.dispose();
				done();
			});
		});
	});

	describe("Tone.Abs", function(){
		this.timeout(maxTimeout);

		it("can be created and disposed", function(){
			var ab = new Abs();
			ab.dispose();
			Test.wasDisposed(ab, expect);
		});

		it("outputs the same value for positive values", function(done){
			var signal, abs;
			Test.offlineTest(0.2, function(dest){
				signal = new Signal(100);
				abs = new Abs();
				signal.connect(abs);
				abs.connect(dest);
			}, function(sample){
				expect(sample).to.equal(100);
			}, function(){
				signal.dispose();
				abs.dispose();
				done();
			});
		});

		it("outputs the absolute value for negative numbers", function(done){
			var signal, abs;
			Test.offlineTest(0.2, function(dest){
				signal = new Signal(-10);
				abs = new Abs();
				signal.connect(abs);
				abs.connect(dest);
			}, function(sample){
				expect(sample).to.equal(10);
			}, function(){
				signal.dispose();
				abs.dispose();
				done();
			});
		});
	});

	describe("Tone.Negate", function(){
		this.timeout(maxTimeout);

		it("can be created and disposed", function(){
			var neg = new Negate();
			neg.dispose();
			Test.wasDisposed(neg, expect);
		});

		it("negates a positive value", function(done){
			var signal, neg;
			Test.offlineTest(0.2, function(dest){
				signal = new Signal(1);
				neg = new Negate();
				signal.connect(neg);
				neg.connect(dest);
			}, function(sample){
				expect(sample).to.equal(-1);
			}, function(){
				signal.dispose();
				neg.dispose();
				done();
			});
		});

		it("makes a negative value positive", function(done){
			var signal, neg;
			Test.offlineTest(0.2, function(dest){
				signal = new Signal(-10);
				neg = new Negate();
				signal.connect(neg);
				neg.connect(dest);
			}, function(sample){
				expect(sample).to.equal(10);
			}, function(){
				signal.dispose();
				neg.dispose();
				done();
			});
		});
	});


	//Max
	describe("Tone.Max", function(){
		this.timeout(maxTimeout);

		it("can be created and disposed", function(){
			var max = new Max();
			max.dispose();
			Test.wasDisposed(max, expect);
		});

		it("outputs the set value when less than the incoming signal", function(done){
			var signal, max;
			Test.offlineTest(0.2, function(dest){
				signal = new Signal(1);
				max = new Max(2);
				signal.connect(max);
				max.connect(dest);
			}, function(sample){
				expect(sample).to.equal(2);
			}, function(){
				signal.dispose();
				max.dispose();
				done();
			});
		});

		it("outputs the incoming signal when greater than the max", function(done){
			var signal, max;
			Test.offlineTest(0.2, function(dest){
				signal = new Signal(10);
				max = new Max(-1);
				signal.connect(max);
				max.connect(dest);
			}, function(sample){
				expect(sample).to.equal(10);
			}, function(){
				signal.dispose();
				max.dispose();
				done();
			});
		});
	});
	

	//Max
	describe("Tone.Min", function(){
		this.timeout(maxTimeout);

		it("can be created and disposed", function(){
			var min = new Min();
			min.dispose();
			Test.wasDisposed(min, expect);
		});

		it("outputs the set value when greater than the incoming signal", function(done){
			var signal, min;
			Test.offlineTest(0.2, function(dest){
				signal = new Signal(4);
				min = new Min(2);
				signal.connect(min);
				min.connect(dest);
			}, function(sample){
				expect(sample).to.equal(2);
			}, function(){
				signal.dispose();
				min.dispose();
				done();
			});
		});

		it("outputs the incoming signal when less than the min", function(done){
			var signal, min;
			Test.offlineTest(0.2, function(dest){
				signal = new Signal(-12);
				min = new Min(-4);
				signal.connect(min);
				min.connect(dest);
			}, function(sample){
				expect(sample).to.equal(-12);
			}, function(){
				signal.dispose();
				min.dispose();
				done();
			});
		});
	});

	//Clip
	describe("Tone.Clip", function(){
		this.timeout(maxTimeout);

		it("can be created and disposed", function(){
			var clip = new Clip(0, 1);
			clip.dispose();
			Test.wasDisposed(clip, expect);
		});

		it("output the upper limit when signal is greater than clip", function(done){
			var signal, clip;
			Test.offlineTest(0.2, function(dest){
				signal = new Signal(4);
				clip = new Clip(2, 3);
				signal.connect(clip);
				clip.connect(dest);
			}, function(sample){
				expect(sample).to.equal(3);
			}, function(){
				signal.dispose();
				clip.dispose();
				done();
			});
		});

		it("outputs the incoming signal when in between upper and lower limit", function(done){
			var signal, clip;
			Test.offlineTest(0.2, function(dest){
				signal = new Signal(-12);
				clip = new Clip(-14, 14);
				signal.connect(clip);
				clip.connect(dest);
			}, function(sample){
				expect(sample).to.equal(-12);
			}, function(){
				signal.dispose();
				clip.dispose();
				done();
			});
		});

		it("outputs the lower limit when incoming signal is less than the lower limit", function(done){
			var signal, clip;
			Test.offlineTest(0.2, function(dest){
				signal = new Signal(-12);
				clip = new Clip(0, 8);
				signal.connect(clip);
				clip.connect(dest);
			}, function(sample){
				expect(sample).to.equal(0);
			}, function(){
				signal.dispose();
				clip.dispose();
				done();
			});
		});
	});

	describe("Tone.Modulo", function(){
		this.timeout(maxTimeout);

		it("can be created and disposed", function(){
			var mod = new Modulo(1);
			mod.dispose();
			Test.wasDisposed(mod, expect);
		});

		it("can evaluate modulus on integers", function(done){
			var signal, mod;
			Test.offlineTest(0.2, function(dest){
				signal = new Signal(4);
				mod = new Modulo(3);
				signal.connect(mod);
				mod.connect(dest);
			}, function(sample){
				expect(sample).to.equal(1);
			}, function(){
				signal.dispose();
				mod.dispose();
				done();
			});
		});

		it("can evaluate modulus on floats", function(done){
			var signal, mod;
			Test.offlineTest(0.2, function(dest){
				signal = new Signal(1.1);
				mod = new Modulo(1);
				signal.connect(mod);
				mod.connect(dest);
			}, function(sample){
				expect(sample).to.be.closeTo(0.1, 0.0001);
			}, function(){
				signal.dispose();
				mod.dispose();
				done();
			});
		});
	});

});