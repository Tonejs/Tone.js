import Basic from "helper/Basic";
import Test from "helper/Test";
import TransportTime from "Tone/type/TransportTime";
import Tone from "Tone/core/Tone";
import Offline from "helper/Offline";
import Time from "Tone/type/Time";
import Frequency from "Tone/type/Frequency";
import Ticks from "Tone/type/Ticks";

describe("TransportTime", function(){

	Basic(TransportTime);

	context("Constructor", function(){

		it("can be made with or without 'new'", function(){
			var t0 = TransportTime();
			expect(t0).to.be.instanceOf(TransportTime);
			t0.dispose();
			var t1 = new TransportTime();
			expect(t1).to.be.instanceOf(TransportTime);
			t1.dispose();
		});

		it("can pass in a number in the constructor", function(){
			return Offline(function(Transport){
				var time = TransportTime(1);
				expect(time).to.be.instanceOf(TransportTime);
				expect(time.valueOf()).to.equal(1);
				time.dispose();
			});
		});

		it("can pass in a string in the constructor", function(){
			return Offline(function(Transport){
				var time = TransportTime("1");
				expect(time).to.be.instanceOf(TransportTime);
				expect(time.valueOf()).to.equal(1);
				time.dispose();
			});
		});

		it("can pass in a value and a type", function(){
			return Offline(function(Transport){
				expect(TransportTime(4, "m").valueOf()).to.equal(8);
			});
		});

		it("with no arguments evaluates to 0 when the transport is stopped", function(){
			return Offline(function(){
				expect(TransportTime().valueOf()).to.equal(0);
			});
		});

		it("with no arguments evaluates to the current ticks when the transport is started", function(){
			return Offline(function(Transport){
				Transport.start();
				return Test.atTime(0.29, function(){
					expect(TransportTime().valueOf()).to.equal(Transport.seconds);
					Transport.stop();
				});
			}, 0.3);
		});

		it("is evaluated in equations and comparisons using valueOf", function(){
			expect(TransportTime("1") + 1).to.equal(2);
			expect(TransportTime("1") + TransportTime("1")).to.equal(2);
			expect(TransportTime("1") > TransportTime(0)).to.be.true;
			expect(+TransportTime("1")).to.equal(1);
		});

		it("can convert from Time", function(){
			expect(TransportTime(Time(2)).valueOf()).to.equal(2);
			expect(TransportTime(Time("4n")).valueOf()).to.equal(0.5);
		});

		it("can convert from Frequency", function(){
			expect(TransportTime(Frequency(2)).valueOf()).to.equal(0.5);
			expect(TransportTime(Frequency("4n")).valueOf()).to.equal(0.5);
		});

		it("can convert from TransportTime", function(){
			expect(TransportTime(TransportTime(2)).valueOf()).to.equal(2);
			expect(TransportTime(TransportTime("4n")).valueOf()).to.equal(0.5);
		});

		it("can convert from Ticks", function(){
			return Offline(function(Transport){
				expect(TransportTime(Ticks(Transport.PPQ)).valueOf()).to.equal(0.5);
				expect(TransportTime(Ticks("4n")).valueOf()).to.equal(0.5);
			});
		});

		it("can convert from an Object", function(){
			return Offline(function(){
				expect(TransportTime({ "4n" : 2 }).valueOf()).to.equal(1);
				expect(TransportTime({ "1n" : 1, "8t" : 2 }).valueOf()).to.be.closeTo(2.333, 0.01);
			});
		});
	});

	context("Quantizes values", function(){

		it("can quantize values", function(){
			return Offline(function(Transport){
				expect(TransportTime("4t").quantize("4n").valueOf()).to.be.closeTo(0.5, 0.01);
			});
		});

		it("can get the next subdivison when the transport is started", function(){
			return Offline(function(Transport){
				Transport.start();
				return Test.atTime(0.59, function(){
					expect(TransportTime("@1m").valueOf()).to.be.closeTo(2, 0.01);
					expect(TransportTime("@4n").valueOf()).to.be.closeTo(1, 0.01);
				});
			}, 0.6);
		});
	});

	context("Operators", function(){

		it("can add the current time", function(){
			return Offline(function(Transport){
				Transport.start();
				return Test.atTime(0.59, function(){
					var now = Transport.ticks;
					expect(TransportTime("4i").addNow().valueOf()).to.be.closeTo(4 + now, 0.01);
					expect(TransportTime("2n").addNow().valueOf()).to.be.closeTo(Transport.PPQ * 2 + now, 0.01);
					expect(TransportTime("+2n").valueOf()).to.be.closeTo(Transport.PPQ * 2 + now, 0.01);
					Transport.stop();
				}, 0.6);
			});
		});

	});

	context("Conversions", function(){

		it("converts time into notation", function(){
			return Offline(function(Transport){
				Transport.bpm.value = 120;
				Transport.timeSignature = 4;
				expect(TransportTime("4n").toNotation()).to.equal("4n");
				expect(TransportTime(1.5).toNotation()).to.equal("2n.");
				expect(TransportTime(0).toNotation()).to.equal("0");
				expect(TransportTime("1:0:0").toNotation()).to.equal("1m");
			});
		});

		it("converts time into samples", function(){
			return Offline(function(){
				expect(TransportTime(2).toSamples()).to.equal(2 * Tone.context.sampleRate);
			});
		});

		it("converts time into frequency", function(){
			return Offline(function(){
				expect(TransportTime(2).toFrequency()).to.equal(0.5);
			});
		});

		it("converts time into seconds", function(){
			return Offline(function(){
				expect(TransportTime("2n").toSeconds()).to.equal(1);
			});
		});

		it("converts time into BarsBeatsSixteenths", function(){
			return Offline(function(){
				expect(TransportTime("3:1:3").toBarsBeatsSixteenths()).to.equal("3:1:3");
				expect(TransportTime(2).toBarsBeatsSixteenths()).to.equal("1:0:0");
			});
		});

	});

});

