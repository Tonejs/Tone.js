import Basic from "helper/Basic";
import Test from "helper/Test";
import Param from "Tone/core/Param";
import Tone from "Tone/type/Type";
import Signal from "Tone/signal/Signal";
import Transport from "Tone/core/Transport";

describe("Param", function(){

	Basic(Param);

	context("Param", function(){

		it("handles input connections", function(){
			var gain = Tone.context.createGain();
			var param = new Param(gain.gain);
			Test.connect(param);
			param.dispose();
		});

		it("can be created with an options object", function(){
			var gain = Tone.context.createGain();
			var param = new Param({
				"param" : gain.gain,
				"units" : Tone.Type.Decibels
			});
			expect(param.value).to.be.closeTo(0, 0.001);
			expect(param.units).to.equal(Tone.Type.Decibels);
			param.dispose();
		});

		it("can set a value", function(){
			var gain = Tone.context.createGain();
			var param = new Param(gain.gain);
			param.value = 10;
			expect(param.value).to.equal(10);
			param.dispose();
		});

	});

	context("Units", function(){

		it("can be created with specific units", function(){
			var gain = Tone.context.createGain();
			var param = new Param(gain.gain, Tone.Type.BPM);
			expect(param.units).to.equal(Tone.Type.BPM);
			param.dispose();
		});

		it("can evaluate the given units", function(){
			var gain = Tone.context.createGain();
			var param = new Param(gain.gain, Tone.Type.Time);
			param.value = "4n";
			expect(param.value).to.be.closeTo(0.5, 0.001);
			param.dispose();
		});

		it("converts the given units when passed in the constructor", function(){
			var gain = Tone.context.createGain();
			var param = new Param({
				"param" : gain.gain,
				"units" : Tone.Type.Decibels,
			});
			param.value = -10;
			expect(param.value).to.be.closeTo(-10, 0.01);
			param.dispose();
		});

		it("can be set to not convert the given units", function(){
			var gain = Tone.context.createGain();
			var param = new Param({
				"param" : gain.gain,
				"units" : Tone.Type.Decibels,
				"convert" : false
			});
			param.value = -10;
			expect(param.value).to.be.closeTo(-10, 0.001);
			param.dispose();
		});

		it("converts Frequency units", function(){
			var gain = Tone.context.createGain();
			var param = new Param(gain.gain, Tone.Type.Frequency);
			param.value = "50hz";
			expect(param.value).to.be.closeTo(50, 0.01);
			param.dispose();
		});

		it("converts Time units", function(){
			var gain = Tone.context.createGain();
			var param = new Param(gain.gain, Tone.Type.Time);
			param.value = "4n";
			expect(param.value).to.be.closeTo(0.5, 0.01);
			param.dispose();
		});

		it("converts NormalRange units", function(){
			var gain = Tone.context.createGain();
			var param = new Param(gain.gain, Tone.Type.NormalRange);
			param.value = 2;
			expect(param.value).to.be.closeTo(1, 0.01);
			param.dispose();
		});

		it("converts AudioRange units", function(){
			var gain = Tone.context.createGain();
			var param = new Param(gain.gain, Tone.Type.AudioRange);
			param.value = -2;
			expect(param.value).to.be.closeTo(-1, 0.01);
			param.dispose();
		});

		it("converts Positive units", function(){
			var gain = Tone.context.createGain();
			var param = new Param(gain.gain, Tone.Type.Positive);
			param.value = -2;
			expect(param.value).to.be.closeTo(0, 0.01);
			param.dispose();
		});

	});

	context("minValue/maxValue", function(){

		it("default min/max values", function(){
			var gain = Tone.context.createGain();
			var param = new Param(gain.gain);
			expect(param.minValue).to.exist;
			expect(param.maxValue).to.exist;
			param.dispose();
		});

		it("minValue for BPM is 0", function(){
			var gain = Tone.context.createGain();
			var param = new Param(gain.gain, Tone.Type.BPM);
			expect(param.minValue).to.equal(0);
			param.dispose();
		});

		it("minValue for Time is 0", function(){
			var gain = Tone.context.createGain();
			var param = new Param(gain.gain, Tone.Type.Time);
			expect(param.minValue).to.equal(0);
			param.dispose();
		});

		it("minValue for Frequency is 0", function(){
			var gain = Tone.context.createGain();
			var param = new Param(gain.gain, Tone.Type.Frequency);
			expect(param.minValue).to.equal(0);
			param.dispose();
		});

		it("minValue for Decibels is -Infinity", function(){
			var gain = Tone.context.createGain();
			var param = new Param(gain.gain, Tone.Type.Decibels);
			expect(param.minValue).to.equal(-Infinity);
			param.dispose();
		});

		it("minValue for Positive is 0", function(){
			var gain = Tone.context.createGain();
			var param = new Param(gain.gain, Tone.Type.Positive);
			expect(param.minValue).to.equal(0);
			param.dispose();
		});

		it("range for AudioRange is -1 to 1", function(){
			var gain = Tone.context.createGain();
			var param = new Param(gain.gain, Tone.Type.AudioRange);
			expect(param.minValue).to.equal(-1);
			expect(param.maxValue).to.equal(1);
			param.dispose();
		});

		it("range for NormalRange is 0 to 1", function(){
			var gain = Tone.context.createGain();
			var param = new Param(gain.gain, Tone.Type.NormalRange);
			expect(param.minValue).to.equal(0);
			expect(param.maxValue).to.equal(1);
			param.dispose();
		});

	});

	context("Scheduling API", function(){

		it("can be scheduled to set a value in the future", function(){
			var gain = Tone.context.createGain();
			var param = new Param({
				"param" : gain.gain,
				"units" : Tone.Type.Decibels
			});
			param.setValueAtTime(2, "+0.3");
			param.dispose();
		});

		it("can linear ramp from the current value to another value in the future", function(){
			var gain = Tone.context.createGain();
			var param = new Param({
				"param" : gain.gain,
			});
			param.linearRampToValueAtTime(2, "+0.3");
			param.dispose();
		});

		it("can schedule an exponential ramp", function(){
			var gain = Tone.context.createGain();
			var param = new Param(gain.gain);
			param.exponentialRampToValueAtTime(3, "+1");
			param.dispose();
		});

		it("can approach a target value", function(){
			var gain = Tone.context.createGain();
			var param = new Param(gain.gain);
			param.setTargetAtTime(0.2, "+1", 2);
			param.dispose();
		});

		it("can approach a target value using time instead of timeConstant", function(){
			var gain = Tone.context.createGain();
			var param = new Param(gain.gain);
			param.exponentialApproachValueAtTime(0.2, "+1", 2);
			param.dispose();
		});

		it("can set a value curve", function(){
			var gain = Tone.context.createGain();
			var param = new Param(gain.gain);
			param.setValueCurveAtTime([0.2, 0.3, 0.4], "+1", 2);
			param.dispose();
		});

		it("can set a ramp point at the current value", function(){
			var gain = Tone.context.createGain();
			var param = new Param(gain.gain);
			param.setRampPoint();
			param.dispose();
		});

		it("can schedule multiple automations", function(){
			var gain = Tone.context.createGain();
			var param = new Param(gain.gain);
			param.linearRampToValueAtTime(0.5, "+0.5");
			param.linearRampToValueAtTime(0, "+1");
			param.dispose();
		});

		it("can cancel an automation", function(){
			var gain = Tone.context.createGain();
			var param = new Param(gain.gain);
			param.linearRampToValueAtTime(0.5, "+0.5");
			param.cancelScheduledValues(0);
			param.dispose();
		});

		it("can cancelAndHold a linear automation", function(){
			var gain = Tone.context.createGain();
			var param = new Param(gain.gain);
			param.linearRampToValueAtTime(0.5, "+0.5");
			param.cancelAndHoldAtTime(0);
			param.dispose();
		});

		it("can cancelAndHold an exponential automation", function(){
			var gain = Tone.context.createGain();
			var param = new Param(gain.gain);
			param.exponentialRampToValueAtTime(0.5, "+0.5");
			param.cancelAndHoldAtTime(0);
			param.dispose();
		});

		it("can set a linear ramp from the current time", function(){
			var gain = Tone.context.createGain();
			var param = new Param(gain.gain);
			param.linearRampTo(0.5, 0.5);
			param.dispose();
		});

		it("can set an exponential ramp from the current time", function(){
			var gain = Tone.context.createGain();
			var param = new Param(gain.gain);
			param.exponentialRampTo(0.5, 0.5);
			param.dispose();
		});

		it("can set an exponential approach ramp from the current time", function(){
			var gain = Tone.context.createGain();
			var param = new Param(gain.gain);
			param.targetRampTo(0.5, 0.5);
			param.dispose();
		});

		it("rampTo ramps from the current value", function(){
			var gain = Tone.context.createGain();
			var param = new Param(gain.gain);
			param.rampTo(0.5, 0.5);
			param.dispose();
		});

		it("can schedule and set a value", function(done){
			var gain = Tone.context.createGain();
			var param = new Param(gain.gain);
			param.rampTo(0.1, 10);
			setTimeout(function(){
				param.value = 10;
				expect(param.value).to.be.closeTo(10, 0.01);
				param.dispose();
				done();
			}, 100);
		});

		it("throws an error if timeConstant <= 0", function(){
			var gain = Tone.context.createGain();
			var param = new Param(gain.gain);
			expect(function(){
				param.setTargetAtTime(2, "+1", 0);
			}).to.throw(Error);
			param.dispose();
		});
	});
});

