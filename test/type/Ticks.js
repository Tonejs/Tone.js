import Basic from "helper/Basic";
import Test from "helper/Test";
import Ticks from "Tone/type/Ticks";
import Tone from "Tone/core/Tone";
import Offline from "helper/Offline";
import TransportTime from "Tone/type/TransportTime";
import Time from "Tone/type/Time";
import Frequency from "Tone/type/Frequency";

describe("Ticks", function(){

	Basic(Ticks);

	context("Constructor", function(){

		it("can be made with or without 'new'", function(){
			var t0 = Ticks();
			expect(t0).to.be.instanceOf(Ticks);
			t0.dispose();
			var t1 = new Ticks();
			expect(t1).to.be.instanceOf(Ticks);
			t1.dispose();
		});

		it("can pass in a number in the constructor", function(){
			return Offline(function(Transport){
				var time = Ticks(1);
				expect(time).to.be.instanceOf(Ticks);
				expect(time.valueOf()).to.equal(1);
				time.dispose();
			});
		});

		it("can pass in a string in the constructor", function(){
			return Offline(function(Transport){
				var time = Ticks("1");
				expect(time).to.be.instanceOf(Ticks);
				expect(time.valueOf()).to.equal(1);
				time.dispose();
			});
		});

		it("can pass in a value and a type", function(){
			return Offline(function(Transport){
				expect(Ticks(4, "m").valueOf()).to.equal(Transport.PPQ * 16);
			});
		});

		it("with no arguments evaluates to 0 when the transport is stopped", function(){
			return Offline(function(){
				expect(Ticks().valueOf()).to.equal(0);
			});
		});

		it("with no arguments evaluates to the current ticks when the transport is started", function(){
			return Offline(function(Transport){
				Transport.start();
				return Test.atTime(0.29, function(){
					expect(Ticks().valueOf()).to.equal(Transport.ticks);
					Transport.stop();
				});
			}, 0.3);
		});

		it("is evaluated in equations and comparisons using valueOf", function(){
			expect(Ticks("1i") + 1).to.equal(2);
			expect(Ticks("1i") + Ticks("1i")).to.equal(2);
			expect(Ticks("1i") > Ticks(0)).to.be.true;
			expect(+Ticks("1i")).to.equal(1);
		});

		it("can convert from Time", function(){
			return Offline(function(Transport){
				expect(Ticks(Time(2)).valueOf()).to.equal(Transport.PPQ * 4);
				expect(Ticks(Time("4n")).valueOf()).to.equal(Transport.PPQ);
				expect(Ticks(Time(4, "n")).valueOf()).to.equal(Transport.PPQ);
			});
		});

		it("can convert from Frequency", function(){
			return Offline(function(Transport){
				expect(Ticks(Frequency(2)).valueOf()).to.equal(Transport.PPQ);
				expect(Ticks(Frequency("4n")).valueOf()).to.equal(Transport.PPQ);
				expect(Ticks(Frequency(4, "n")).valueOf()).to.equal(Transport.PPQ);
			});
		});

		it("can convert from TransportTime", function(){
			return Offline(function(Transport){
				expect(Ticks(TransportTime(2)).valueOf()).to.equal(Transport.PPQ * 4);
				expect(Ticks(TransportTime("4n")).valueOf()).to.equal(Transport.PPQ);
			});
		});

		it("can convert from Ticks", function(){
			return Offline(function(Transport){
				expect(Ticks(Ticks(Transport.PPQ)).valueOf()).to.equal(Transport.PPQ);
				expect(Ticks(Ticks("4n")).valueOf()).to.equal(Transport.PPQ);
			});
		});

		it("can convert from an Object", function(){
			return Offline(function(Transport){
				expect(Ticks({ "4n" : 2 }).valueOf()).to.equal(Transport.PPQ * 2);
				expect(Ticks({ "1n" : 1, "8t" : 2 }).valueOf()).to.equal(Transport.PPQ * 4 + Transport.PPQ * (2/3));
			});
		});
	});

	context("Quantizes values", function(){

		it("can quantize values", function(){
			return Offline(function(Transport){
				expect(Ticks("4t").quantize("4n").valueOf()).to.be.closeTo(Transport.PPQ, 0.01);
			});
		});

		it("can get the next subdivison when the transport is started", function(){
			return Offline(function(Transport){
				Transport.start();
				return Test.atTime(0.59, function(){
					expect(Ticks("@1m").valueOf()).to.be.closeTo(4 * Transport.PPQ, 1);
					expect(Ticks("@4n").valueOf()).to.be.closeTo(Transport.PPQ * 2, 1);
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
					expect(Ticks("4i").addNow().valueOf()).to.be.closeTo(4 + now, 0.01);
					expect(Ticks("2n").addNow().valueOf()).to.be.closeTo(Transport.PPQ * 2 + now, 0.01);
					expect(Ticks("+2n").valueOf()).to.be.closeTo(Transport.PPQ * 2 + now, 0.01);
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
				/*expect(Ticks("4n").toNotation()).to.equal("4n");
				expect(Ticks(1.5 * Transport.PPQ).toNotation()).to.equal("2n + 4n");
				expect(Ticks(0).toNotation()).to.equal("0");
				expect(Ticks("1:2:3").toNotation()).to.equal("1m + 2n + 8n + 16n");*/
			});
		});

		it("converts time into samples", function(){
			return Offline(function(Transport){
				expect(Ticks(Transport.PPQ).toSamples()).to.equal(0.5 * Tone.context.sampleRate);
			});
		});

		it("converts time into frequency", function(){
			return Offline(function(Transport){
				expect(Ticks(Transport.PPQ * 4).toFrequency()).to.equal(0.5);
				expect(Ticks("2n").toFrequency()).to.equal(1);
			});
		});

		it("converts time into seconds", function(){
			return Offline(function(){
				expect(Ticks("2n").toSeconds()).to.equal(1);
			});
		});

		it("converts time into BarsBeatsSixteenths", function(){
			return Offline(function(Transport){
				expect(Ticks("3:1:3").toBarsBeatsSixteenths()).to.equal("3:1:3");
				expect(Ticks(4 * Transport.PPQ).toBarsBeatsSixteenths()).to.equal("1:0:0");
			});
		});

	});

});

