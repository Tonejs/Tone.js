/* global it, describe*/

define(["chai", "Tone/core/Tone", "Tone/core/Transport", "tests/Core"], function(chai, Tone, Transport){
	var expect = chai.expect;
	var tone = new Tone();

	describe("Tone.notationToSeconds", function(){

		it("handles measures, measure subdivision and triplets", function(){
			Transport.stop();
			Transport.setBpm(120);
			Transport.setTimeSignature(4, 4);
			expect(tone.notationToSeconds("1m")).to.equal(2);
			expect(tone.notationToSeconds("4n")).to.equal(0.5);
			expect(tone.notationToSeconds("8n")).to.equal(0.25);
			expect(tone.notationToSeconds("16n")).to.equal(0.125);
			expect(tone.notationToSeconds("2t")).to.equal(2/3);
			expect(tone.notationToSeconds("8t")).to.equal(1/6);
		});

		it("handles setting different BPM", function(){
			Transport.stop();
			Transport.setBpm(240);
			Transport.setTimeSignature(4, 4);
			expect(tone.notationToSeconds("4n")).to.equal(0.25);
			expect(tone.notationToSeconds("1")).to.equal(0);
			expect(tone.notationToSeconds("8t")).to.equal(0.25/3);
			expect(tone.notationToSeconds("8m")).to.equal(8);
		});
	});

	describe("Tone.transportTimeToSeconds", function(){

		it("converts transport time in multiple forms to seconds", function(){
			Transport.stop();
			Transport.setBpm(120);
			Transport.setTimeSignature(4, 4);
			expect(tone.transportTimeToSeconds("1:2:3")).to.equal(3.375);
			expect(tone.transportTimeToSeconds("1:2:0")).to.equal(3);
			expect(tone.transportTimeToSeconds("1:2")).to.equal(3);
			expect(tone.transportTimeToSeconds("0:2")).to.equal(1);
			expect(tone.transportTimeToSeconds("2")).to.equal(1);
			expect(tone.transportTimeToSeconds("0:0:2")).to.equal(0.25);
		});

		it("handles time signature changes", function(){
			Transport.stop();
			Transport.setBpm(120);
			Transport.setTimeSignature(6, 4);
			expect(tone.transportTimeToSeconds("4:0")).to.equal(12);
			expect(tone.transportTimeToSeconds("6")).to.equal(3);
		});
	});

	describe("Tone.toTransportTime", function(){

		it("converts seconds to transport time", function(){
			Transport.stop();
			Transport.setBpm(120);
			Transport.setTimeSignature(4, 4);
			expect(tone.toTransportTime(3.375)).to.equal("1:2:3");
			expect(tone.toTransportTime(3)).to.equal("1:2:0");
		});

		it("handles time signature changes", function(){
			Transport.stop();
			Transport.setBpm(120);
			Transport.setTimeSignature(6, 4);
			expect(tone.toTransportTime(12)).to.equal("4:0:0");
			expect(tone.toTransportTime(3)).to.equal("1:0:0");
		});
	});

	describe("Tone.frequencyToSeconds", function(){

		it("converts frequencies as a string or number", function(){
			Transport.stop();
			Transport.setBpm(120);
			Transport.setTimeSignature(4, 4);
			expect(tone.frequencyToSeconds("1hz")).to.equal(1);
			expect(tone.frequencyToSeconds(".5")).to.equal(2);
			expect(tone.secondsToFrequency("5")).to.equal(0.2);
		});
	});

	describe("Tone.toFrequency", function(){

		it("infers type correctly", function(){
			Transport.stop();
			Transport.setBpm(120);
			Transport.setTimeSignature(4, 4);
			expect(tone.toFrequency("1hz")).to.equal(1);
			expect(tone.toFrequency("4n")).to.equal(2);
			expect(tone.toFrequency(500)).to.equal(500);
		});
	});

	describe("Tone.toSeconds", function(){

		it("correctly infers type", function(){
			Transport.stop();
			Transport.setBpm(120);
			Transport.setTimeSignature(4, 4);
			expect(tone.toSeconds("5")).to.equal(5);
			expect(tone.toSeconds("1m")).to.equal(2);
			expect(tone.toSeconds("1")).to.equal(1);
			expect(tone.toSeconds("1:0:0")).to.equal(2);
			expect(tone.toSeconds("2hz")).to.equal(0.5);
		});

		it("handles 'now' relative values", function(){
			Transport.stop();
			Transport.setBpm(120);
			Transport.setTimeSignature(4, 4);
			var now = tone.now();
			expect(tone.toSeconds("+5")).to.be.closeTo(now + 5, 0.01);
			now = tone.now();
			expect(tone.toSeconds("+4n")).to.be.closeTo(now + 0.5, 0.01);
			now = tone.now();
			expect(tone.toSeconds("+1:0")).to.be.closeTo(now + 2, 0.01);
		});

		it("with no arguments returns 'now'", function(){
			var now = tone.now();
			expect(tone.toSeconds()).to.be.closeTo(now, 0.01);
		});

		it("can evaluate mathematical expressions of time", function(){
			Transport.stop();
			Transport.setBpm(120);
			Transport.setTimeSignature(4, 4);
			expect(tone.toSeconds("1+2+3")).to.equal(6);
			expect(tone.toSeconds("2*1:2 - 1m")).to.equal(4);
		});
	});
});