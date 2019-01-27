import Basic from "helper/Basic";
import Test from "helper/Test";
import Time from "Tone/type/Time";
import Tone from "Tone/core/Tone";
import Offline from "helper/Offline";
import Frequency from "Tone/type/Frequency";
import Ticks from "Tone/type/Ticks";
import TransportTime from "Tone/type/TransportTime";

describe("Time", function(){

	Basic(Time);

	context("Constructor", function(){

		it("can be made with or without 'new'", function(){
			var t0 = Time();
			expect(t0).to.be.instanceOf(Time);
			t0.dispose();
			var t1 = new Time();
			expect(t1).to.be.instanceOf(Time);
			t1.dispose();
		});

		it("can pass in a number in the constructor", function(){
			var time = Time(1);
			expect(time.valueOf()).to.equal(1);
			expect(time).to.be.instanceOf(Time);
			time.dispose();
		});

		it("can pass in a string in the constructor", function(){
			var time = Time("1");
			expect(time.valueOf()).to.equal(1);
			expect(time).to.be.instanceOf(Time);
			time.dispose();
		});

		it("can pass in a value and a type", function(){
			expect(Time(4, "m").valueOf()).to.equal(8);
		});

		it("with no arguments evaluates to 'now'", function(){
			var now = Tone.now();
			expect(Time().valueOf()).to.be.closeTo(now, 0.01);
		});

		it("is evaluated in equations and comparisons using valueOf", function(){
			expect(Time(1) + 1).to.equal(2);
			expect(Time(1) + Time(1)).to.equal(2);
			expect(Time(1) > Time(0)).to.be.true;
			expect(+Time(1)).to.equal(1);
		});

		it("can convert from Time", function(){
			expect(Time(Time(2)).valueOf()).to.equal(2);
			expect(Time(Time("4n")).valueOf()).to.equal(0.5);
		});

		it("can convert from Frequency", function(){
			expect(Time(Frequency(2)).valueOf()).to.equal(0.5);
			expect(Time(Frequency("4n")).valueOf()).to.equal(0.5);
		});

		it("can convert from TransportTime", function(){
			expect(Time(TransportTime(2)).valueOf()).to.equal(2);
			expect(Time(TransportTime("4n")).valueOf()).to.equal(0.5);
		});

		it("can convert from Ticks", function(){
			return Offline(function(Transport){
				expect(Time(Ticks(Transport.PPQ)).valueOf()).to.equal(0.5);
				expect(Time(Ticks("4n")).valueOf()).to.equal(0.5);
			});
		});

		it("evalutes objects", function(){
			return Offline(function(Transport){
				Transport.bpm.value = 120;
				Transport.timeSignature = 4;
				expect(Time({ "4n" : 3 }).valueOf()).to.equal(1.5);
				expect(Time({ "8t" : 2, "1m" : 3 }).valueOf()).to.be.closeTo(6.33, 0.01);
				expect(Time({ "2n" : 1, "8n" : 1.5 }).valueOf()).to.equal(1.375);
				expect(Time({ "2n" : 1, "8n" : -1 }).valueOf()).to.equal(0.75);
			});
		});
	});

	context("Quantizes values", function(){

		it("returns the time quantized to the a subdivision", function(){
			expect(Time(1.1).quantize(0.5).valueOf()).to.be.closeTo(1, 0.01);
			expect(Time(2.3).quantize(0.5).valueOf()).to.be.closeTo(2.5, 0.01);
			expect(Time(0).quantize(4).valueOf()).to.be.closeTo(0, 0.01);
		});

		it("can quantize with a percentage", function(){
			expect(Time(4).quantize(8, 0.5).valueOf()).to.equal(6);
			expect(Time(10).quantize(8, 0.5).valueOf()).to.equal(9);
			expect(Time(2).quantize(8, 0.75).valueOf()).to.equal(0.5);
		});

		it("can get the next subdivison when the transport is started", function(){
			return Offline(function(Transport){
				Transport.start(0.1);
				return Test.atTime(0.69, function(){
					expect(Time("@1m").valueOf()).to.be.closeTo(2.1, 0.01);
					expect(Time("@4n").valueOf()).to.be.closeTo(1.1, 0.01);
					expect(Time("@8n").valueOf()).to.be.closeTo(0.85, 0.01);
				});
			}, 0.7);
		});
	});

	context("Operators", function(){

		it("can add the current time", function(){
			var now = Tone.now();
			expect(Time("+4").valueOf()).to.be.closeTo(4 + now, 0.02);
			expect(Time("+2n").valueOf()).to.be.closeTo(1 + now, 0.02);
		});

		it("can quantize the value", function(){
			expect(Time(4).quantize(3)).to.equal(3);
			expect(Time(5).quantize(3)).to.equal(6);
		});

	});

	context("Conversions", function(){

		it("converts time into notation", function(){
			return Offline(function(Transport){
				Transport.bpm.value = 120;
				Transport.timeSignature = 4;
				expect(Time("4n").toNotation()).to.equal("4n");
				expect(Time(1.5).toNotation()).to.equal("2n.");
				expect(Time(0).toNotation()).to.equal("0");
				expect(Time("1:2:3").toNotation()).to.equal("1m");
				expect(Time(Time("2n") + Time("4n")).toNotation()).to.equal("2n.");
			});
		});

		it("converts time into milliseconds", function(){
			expect(Time(2).toMilliseconds()).to.equal(2000);
			expect(Time("4n").toMilliseconds()).to.equal(500);
		});

		it("converts time into samples", function(){
			expect(Time(2).toSamples()).to.equal(2 * Tone.context.sampleRate);
		});

		it("converts time into frequency", function(){
			expect(Time(2).toFrequency()).to.equal(0.5);
		});

		it("converts time into ticks", function(){
			return Offline(function(Transport){
				expect(Time("2n").toTicks()).to.equal(2 * Transport.PPQ);
				// floating point checks
				var bpmOrig = Tone.Transport.bpm.value;
				Tone.Transport.bpm.value = 100;
				expect(Time("0:1:3").toTicks()).to.equal(1.75 * Transport.PPQ);
				Tone.Transport.bpm.value = bpmOrig;
			});
		});

		it("converts time into BarsBeatsSixteenths", function(){
			return Offline(function(Transport){
				expect(Time("3:1:3").toBarsBeatsSixteenths()).to.equal("3:1:3");
				expect(Time(2).toBarsBeatsSixteenths()).to.equal("1:0:0");
				// trailing zero removal test
				Transport.bpm.value = 100;
				expect(Time("0:1:3").toBarsBeatsSixteenths()).to.equal("0:1:3");
				expect(Time("14:0:0").toBarsBeatsSixteenths()).to.equal("14:0:0");
				expect(Time("15:0:0").toBarsBeatsSixteenths()).to.equal("15:0:0");
				Transport.bpm.value = 90;
				expect(Time("100:0:0").toBarsBeatsSixteenths()).to.equal("100:0:0");
			});
		});

	});

});

