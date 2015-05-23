/* global it, describe, maxTimeout */

define(["tests/Core", "chai", "Tone/signal/Signal", "Tone/signal/Add", "Tone/signal/Multiply", 
	"Tone/signal/Scale", "Tone/source/Oscillator", "Tone/core/Master", "Tone/signal/Abs", "Tone/signal/Negate", 
	 "Tone/signal/Max", "Tone/signal/Min", "Tone/signal/Clip", "Tone/signal/ScaleExp", 
	 "Tone/signal/Modulo", "tests/Common", "Tone/signal/Subtract",
	 "Tone/signal/Pow", "Tone/signal/Normalize", "Tone/signal/AudioToGain", "Tone/signal/EqualPowerGain", 
	 "Tone/signal/GainToAudio"], 
function(core, chai, Signal, Add, Multiply, Scale, Oscillator, Master, Abs, Negate, Max, 
	Min, Clip, ScaleExp, Modulo, Test, Subtract, Pow, Normalize, AudioToGain, EqualPowerGain, GainToAudio){

	var expect = chai.expect;

	Master.mute = true;

	//ADD
	describe("Tone.Add", function(){
		this.timeout(maxTimeout);

		it("can be created and disposed", function(){
			var a = new Add(1);
			a.dispose();
			Test.wasDisposed(a);
		});

		it("handles input and output connections", function(){
			Test.onlineContext();
			var a = new Add();
			Test.acceptsInput(a, 0);
			Test.acceptsInput(a, 1);
			Test.acceptsOutput(a);
			a.dispose();
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

		it("can sum two signals", function(done){
			var sigA, sigB, adder;
			Test.offlineTest(0.2, function(dest){
				sigA = new Signal(1);
				sigB = new Signal(4);
				adder = new Add();
				sigA.connect(adder, 0, 0);
				sigB.connect(adder, 0, 1);
				adder.connect(dest);
			}, function(sample){
				expect(sample).to.equal(5);
			}, function(){
				sigA.dispose();
				sigB.dispose();
				adder.dispose();
				done();
			});
		});
	});

	describe("Tone.Subtract", function(){
		this.timeout(maxTimeout);

		it("can be created and disposed", function(){
			var a = new Subtract();
			a.dispose();
			Test.wasDisposed(a);
		});

		it("handles input and output connections", function(){
			Test.onlineContext();
			var sub = new Subtract();
			Test.acceptsInput(sub, 0);
			Test.acceptsInput(sub, 1);
			Test.acceptsOutput(sub);
			sub.dispose();
		});

		it("correctly subtracts a signal and a number", function(done){
			var signal, sub;
			Test.offlineTest(0.2, function(dest){
				signal = new Signal(0);
				sub = new Subtract(3);
				signal.connect(sub);
				sub.connect(dest);
			}, function(sample){
				expect(sample).to.equal(-3);
			}, function(){
				signal.dispose();
				sub.dispose();
				done();
			});
		});

		it("can handle negative values", function(done){
			var signal, sub;
			Test.offlineTest(0.2, function(dest){
				signal = new Signal(4);
				sub = new Subtract(-2);
				signal.connect(sub);
				sub.connect(dest);
			}, function(sample){
				expect(sample).to.equal(6);
			}, function(){
				signal.dispose();
				sub.dispose();
				done();
			});
		});

		it("can subtract two signals", function(done){
			var sigA, sigB, sub;
			Test.offlineTest(0.2, function(dest){
				sigA = new Signal(1);
				sigB = new Signal(4);
				sub = new Subtract();
				sigA.connect(sub, 0, 0);
				sigB.connect(sub, 0, 1);
				sub.connect(dest);
			}, function(sample){
				expect(sample).to.equal(-3);
			}, function(){
				sigA.dispose();
				sigB.dispose();
				sub.dispose();
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
			Test.wasDisposed(m);
		});

		it("handles input and output connections", function(){
			Test.onlineContext();
			var mult = new Multiply();
			Test.acceptsInput(mult, 0);
			Test.acceptsInput(mult, 1);
			Test.acceptsOutput(mult);
			mult.dispose();
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

		it("can multiply two signals", function(done){
			var sigA, sigB, mult;
			Test.offlineTest(0.2, function(dest){
				sigA = new Signal(3);
				sigB = new Signal(5);
				mult = new Multiply();
				sigA.connect(mult, 0, 0);
				sigB.connect(mult, 0, 1);
				mult.connect(dest);
			}, function(sample){
				expect(sample).to.equal(15);
			}, function(){
				sigA.dispose();
				sigB.dispose();
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
			Test.wasDisposed(s);
		});

		it("handles input and output connections", function(){
			Test.onlineContext();
			var scale = new Scale(0, 100);
			Test.acceptsInputAndOutput(scale);
			scale.dispose();
		});

		it("scales an input range to an output range", function(done){
			//make an oscillator to drive the signal
			var osc, scale;
			Test.offlineTest(0.2, function(dest){
				osc = new Signal(0.5);
				scale = new Scale(10, 20);
				osc.connect(scale);
				scale.connect(dest);
			}, function(sample){
				expect(sample).to.equal(15);
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
			Test.wasDisposed(s);
		});

		it("handles input and output connections", function(){
			Test.onlineContext();
			var scale = new ScaleExp(0, 100);
			Test.acceptsInputAndOutput(scale);
			scale.dispose();
		});

		it("scales a signal exponentially", function(done){
			var signal, scale;
			Test.offlineTest(0.2, function(dest){
				signal = new Signal(0.5);
				scale = new ScaleExp(0, 1, 2);
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
			Test.wasDisposed(ab);
		});

		it("handles input and output connections", function(){
			Test.onlineContext();
			var abs = new Abs();
			Test.acceptsInputAndOutput(abs);
			abs.dispose();
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
			Test.wasDisposed(neg);
		});

		it("handles input and output connections", function(){
			Test.onlineContext();
			var neg = new Negate();
			Test.acceptsInputAndOutput(neg);
			neg.dispose();
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
			Test.wasDisposed(max);
		});

		it("handles input and output connections", function(){
			Test.onlineContext();
			var max = new Max();
			Test.acceptsInput(max, 0);
			Test.acceptsInput(max, 1);
			Test.acceptsOutput(max);
			max.dispose();
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

		it("can be set to a new value", function(done){
			var signal, max;
			Test.offlineTest(0.2, function(dest){
				signal = new Signal(10);
				max = new Max(-1);
				signal.connect(max);
				max.value = 12;
				max.connect(dest);
			}, function(sample){
				expect(sample).to.equal(12);
			}, function(){
				signal.dispose();
				max.dispose();
				done();
			});
		});

		it("can use two signals", function(done){
			var sigA, sigB, max;
			Test.offlineTest(0.2, function(dest){
				sigA = new Signal(3);
				sigB = new Signal(50);
				max = new Max();
				sigA.connect(max, 0, 0);
				sigB.connect(max, 0, 1);
				max.connect(dest);
			}, function(sample){
				expect(sample).to.equal(50);
			}, function(){
				sigA.dispose();
				sigB.dispose();
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
			Test.wasDisposed(min);
		});

		it("handles input and output connections", function(){
			Test.onlineContext();
			var min = new Min();
			Test.acceptsInput(min, 0);
			Test.acceptsInput(min, 1);
			Test.acceptsOutput(min);
			min.dispose();
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

		it("can be set to a new value", function(done){
			var signal, min;
			Test.offlineTest(0.2, function(dest){
				signal = new Signal(3);
				min = new Min(-4);
				signal.connect(min);
				min.value = 4;
				min.connect(dest);
			}, function(sample){
				expect(sample).to.equal(3);
			}, function(){
				signal.dispose();
				min.dispose();
				done();
			});
		});

		it("can use two signals", function(done){
			var sigA, sigB, min;
			Test.offlineTest(0.2, function(dest){
				sigA = new Signal(3);
				sigB = new Signal(5);
				min = new Min();
				sigA.connect(min, 0, 0);
				sigB.connect(min, 0, 1);
				min.connect(dest);
			}, function(sample){
				expect(sample).to.equal(3);
			}, function(){
				sigA.dispose();
				sigB.dispose();
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
			Test.wasDisposed(clip);
		});

		it("handles input and output connections", function(){
			Test.onlineContext();
			var clip = new Clip(0, 1);
			Test.acceptsInputAndOutput(clip);
			clip.dispose();
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
			var mod = new Modulo(0.1);
			mod.dispose();
			Test.wasDisposed(mod);
		});

		it("handles input and output connections", function(){
			Test.onlineContext();
			var mod = new Modulo();
			Test.acceptsInputAndOutput(mod);
			mod.dispose();
		});

		it("can evaluate 0.45 % 0.3", function(done){
			var signal, mod;
			Test.offlineTest(0.2, function(dest){
				signal = new Signal(0.45);
				mod = new Modulo(0.3);
				signal.connect(mod);
				mod.connect(dest);
			}, function(sample){
				expect(sample).to.be.closeTo(0.15, 0.0001);
			}, function(){
				signal.dispose();
				mod.dispose();
				done();
			});
		});

		it("can evaluate 0.1 % 0.2", function(done){
			var signal, mod;
			Test.offlineTest(0.2, function(dest){
				signal = new Signal(0.1);
				mod = new Modulo(0.2);
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

	describe("Tone.Pow", function(){
		this.timeout(maxTimeout);

		it("can be created and disposed", function(){
			var pow = new Pow();
			pow.dispose();
			Test.wasDisposed(pow);
		});

		it("handles input and output connections", function(){
			Test.onlineContext();
			var pow = new Pow();
			Test.acceptsInputAndOutput(pow);
			pow.dispose();
		});

		it("can do powers of 2", function(done){
			var signal, pow;
			Test.offlineTest(0.2, function(dest){
				signal = new Signal(0.3);
				pow = new Pow(2);
				signal.connect(pow);
				pow.connect(dest);
			}, function(sample){
				expect(sample).to.be.closeTo(0.09, 0.01);
			}, function(){
				signal.dispose();
				pow.dispose();
				done();
			});
		});

		it("can compute negative values and powers less than 1", function(done){
			var signal, pow;
			Test.offlineTest(0.2, function(dest){
				signal = new Signal(-0.49);
				pow = new Pow(0.5);
				signal.connect(pow);
				pow.connect(dest);
			}, function(sample){
				expect(sample).to.be.closeTo(0.7, 0.01);
			}, function(){
				signal.dispose();
				pow.dispose();
				done();
			});
		});
	});

	describe("Tone.Normalize", function(){
		this.timeout(maxTimeout);

		it("can be created and disposed", function(){
			var s = new Normalize();
			s.dispose();
			Test.wasDisposed(s);
		});

		it("handles input and output connections", function(){
			Test.onlineContext();
			var norm = new Normalize();
			Test.acceptsInputAndOutput(norm);
			norm.dispose();
		});

		it("normalizes an oscillator to 0,1", function(done){
			//make an oscillator to drive the signal
			var osc, norm;
			Test.offlineTest(0.2, function(dest){
				osc = new Oscillator(1000);
				norm = new Normalize(-1, 1);
				osc.connect(norm);
				norm.connect(dest);
			}, function(sample){
				expect(sample).to.be.within(0, 1);
			}, function(){
				osc.dispose();
				norm.dispose();
				done();
			});
		});

		it("normalizes an input", function(done){
			//make an oscillator to drive the signal
			var sig, norm;
			Test.offlineTest(0.2, function(dest){
				sig = new Signal(1000);
				norm = new Normalize(0, 1000);
				sig.connect(norm);
				norm.connect(dest);
			}, function(sample){
				expect(sample).to.equal(1);
			}, function(){
				sig.dispose();
				norm.dispose();
				done();
			});
		});
	});

	describe("Tone.AudioToGain", function(){
		this.timeout(maxTimeout);

		it("can be created and disposed", function(){
			var a2g = new AudioToGain();
			a2g.dispose();
			Test.wasDisposed(a2g);
		});

		it("handles input and output connections", function(){
			Test.onlineContext();
			var a2g = new AudioToGain();
			Test.acceptsInputAndOutput(a2g);
			a2g.dispose();
		});

		it("normalizes an oscillator to 0,1", function(done){
			//make an oscillator to drive the signal
			var osc, a2g;
			Test.offlineTest(0.2, function(dest){
				osc = new Oscillator(1000);
				a2g = new AudioToGain();
				osc.connect(a2g);
				a2g.connect(dest);
			}, function(sample){
				expect(sample).to.be.within(0, 1);
			}, function(){
				osc.dispose();
				a2g.dispose();
				done();
			});
		});

		it("outputs 0.5 for an input value of 0", function(done){
			//make an oscillator to drive the signal
			var sig, a2g;
			Test.offlineTest(0.2, function(dest){
				sig = new Signal(0);
				a2g = new AudioToGain();
				sig.connect(a2g);
				a2g.connect(dest);
			}, function(sample){
				expect(sample).to.be.closeTo(0.5, 0.01);
			}, function(){
				sig.dispose();
				a2g.dispose();
				done();
			});
		});
	});

	describe("Tone.GainToAudio", function(){
		this.timeout(maxTimeout);

		it("can be created and disposed", function(){
			var g2a = new GainToAudio();
			g2a.dispose();
			Test.wasDisposed(g2a);
		});

		it("handles input and output connections", function(){
			Test.onlineContext();
			var g2a = new GainToAudio();
			Test.acceptsInputAndOutput(g2a);
			g2a.dispose();
		});

		it("outputs 0 for an input value of 0.5", function(done){
			//make an oscillator to drive the signal
			var sig, g2a;
			Test.offlineTest(0.2, function(dest){
				sig = new Signal(0.5);
				g2a = new GainToAudio();
				sig.connect(g2a);
				g2a.connect(dest);
			}, function(sample){
				expect(sample).to.be.closeTo(0, 0.01);
			}, function(){
				sig.dispose();
				g2a.dispose();
				done();
			});
		});

		it("outputs 1 for an input value of 1", function(done){
			//make an oscillator to drive the signal
			var sig, g2a;
			Test.offlineTest(0.2, function(dest){
				sig = new Signal(1);
				g2a = new GainToAudio();
				sig.connect(g2a);
				g2a.connect(dest);
			}, function(sample){
				expect(sample).to.be.closeTo(1, 0.01);
			}, function(){
				sig.dispose();
				g2a.dispose();
				done();
			});
		});

		it("outputs -1 for an input value of 0", function(done){
			//make an oscillator to drive the signal
			var sig, g2a;
			Test.offlineTest(0.2, function(dest){
				sig = new Signal(0);
				g2a = new GainToAudio();
				sig.connect(g2a);
				g2a.connect(dest);
			}, function(sample){
				expect(sample).to.be.closeTo(-1, 0.01);
			}, function(){
				sig.dispose();
				g2a.dispose();
				done();
			});
		});
	});

	describe("Tone.EqualPowerGain", function(){
		this.timeout(maxTimeout);

		it("can be created and disposed", function(){
			var eqpg = new EqualPowerGain();
			eqpg.dispose();
			Test.wasDisposed(eqpg);
		});

		it("handles input and output connections", function(){
			Test.onlineContext();
			var eqpg = new EqualPowerGain();
			Test.acceptsInputAndOutput(eqpg);
			eqpg.dispose();
		});

		it("passes the incoming signal through", function(done){
			var eqpg;
			Test.passesAudio(function(input, output){
				eqpg = new EqualPowerGain();
				input.connect(eqpg);
				eqpg.connect(output);
			}, function(){
				eqpg.dispose();
				done();
			});
		});
	});

});