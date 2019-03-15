import Basic from "helper/Basic";
import Test from "helper/Test";
import Type from "Tone/type/Type";
import Time from "Tone/type/Time";
import Frequency from "Tone/type/Frequency";
import TransportTime from "Tone/type/TransportTime";
import Offline from "helper/Offline";
import Tone from "Tone/core/Tone";

describe("Type", function(){

	context("Tone.toSeconds", function(){

		it("correctly infers type", function(){
			return Offline(function(Transport){
				var tone = new Tone();
				Transport.bpm.value = 120;
				Transport.timeSignature = 4;
				expect(tone.toSeconds("5")).to.equal(5);
				expect(tone.toSeconds("1m")).to.equal(2);
				expect(tone.toSeconds("1")).to.equal(1);
				expect(tone.toSeconds("1:0:0")).to.equal(2);
				expect(tone.toSeconds("2hz")).to.equal(0.5);
				expect(tone.toSeconds({ "4n" : 2 })).to.equal(1);
			});
		});

		it("handles 'now' relative values", function(){
			return Offline(function(Transport){
				var tone = new Tone();
				Transport.bpm.value = 120;
				Transport.timeSignature = 4;
				var now = tone.now();
				expect(tone.toSeconds("+5")).to.be.closeTo(now + 5, 0.05);
				now = tone.now();
				expect(tone.toSeconds("+4n")).to.be.closeTo(now + 0.5, 0.05);
				now = tone.now();
				expect(tone.toSeconds("+1:0")).to.be.closeTo(now + 2, 0.05);
			});
		});

		it("with no arguments returns 'now'", function(){
			var tone = new Tone();
			var now = tone.now();
			expect(tone.toSeconds()).to.be.closeTo(now, 0.05);
		});

		it("can pass in Primitive time types", function(){
			return Offline(function(Transport){
				var tone = new Tone();
				Transport.stop();
				expect(tone.toSeconds(Time("4n"))).to.equal(0.5);
				expect(tone.toSeconds(Frequency("4n"))).to.equal(0.5);
				expect(tone.toSeconds(TransportTime("4n"))).to.equal(0.5);
			});
		});

	});

	context("Tone.toFrequency", function(){

		it("infers type correctly", function(){
			return Offline(function(Transport){
				var tone = new Tone();
				Transport.stop();
				Transport.bpm.value = 120;
				Transport.timeSignature = 4;
				expect(tone.toFrequency("1hz")).to.equal(1);
				expect(tone.toFrequency("4n")).to.equal(2);
				expect(tone.toFrequency(500)).to.equal(500);
				expect(tone.toFrequency({ "4n" : 1 })).to.equal(2);
			});
		});

		it("can pass in Primitive time types", function(){
			var tone = new Tone();
			expect(tone.toFrequency(Time("4n"))).to.equal(2);
			expect(tone.toFrequency(Frequency("4n"))).to.equal(2);
			expect(tone.toFrequency(TransportTime("4n"))).to.equal(2);
		});
	});

	context("Tone.toTicks", function(){

		it("converts time into ticks", function(){
			return Offline(function(Transport){
				var tone = new Tone();
				var ppq = Transport.PPQ;
				Transport.bpm.value = 120;
				Transport.timeSignature = 4;
				expect(tone.toTicks("1i")).to.equal(1);
				expect(tone.toTicks("4n")).to.equal(ppq);
				expect(tone.toTicks("8n")).to.equal(ppq * 0.5);
				expect(tone.toTicks({ "4n" : 1 })).to.equal(ppq);
			});
		});

		it("handles now-relative values relative to the Transports current ticks", function(){
			return Offline(function(Transport){
				var tone = new Tone();
				var ppq = Transport.PPQ;
				expect(tone.toTicks("+4n")).to.equal(ppq);
				Transport.start();
				return Test.atTime(0.1, function(){
					var currentTicks = Transport.ticks;
					expect(tone.toTicks("+4n")).to.equal(ppq + currentTicks);
				});
			});
		});

		it("can pass in Primitive time types", function(){
			return Offline(function(Transport){
				var tone = new Tone();
				expect(tone.toTicks(Time("4n"))).to.equal(Transport.PPQ);
				expect(tone.toTicks(Frequency("4n"))).to.equal(Transport.PPQ);
				expect(tone.toTicks(TransportTime("4n"))).to.equal(Transport.PPQ);
			});
		});
	});
});

