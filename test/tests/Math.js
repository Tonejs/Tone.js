define(["chai", "Tone/core/Tone", "tests/WebAudio"], function(chai, Tone){
	var expect = chai.expect;

	var tone = new Tone();

	describe("Tone.samplesToSeconds", function(){
		it("correctly calculates", function(){
			var sampleRate = tone.context.sampleRate;
			expect(tone.samplesToSeconds(100)).to.equal(100/sampleRate);
			expect(tone.samplesToSeconds(800)).to.equal(800/sampleRate);
		});
	});

	describe("Tone.dbToGain, Tone.gainToDb", function(){
		it("can convert gain to db", function(){
			expect(tone.gainToDb(0)).to.equal(-Infinity);
			expect(tone.gainToDb(1)).is.closeTo(0, 0.1);
			expect(tone.gainToDb(0.5)).is.closeTo(-6, 0.1);
		});

		it("can convert db to gain", function(){
			expect(tone.dbToGain(0)).is.closeTo(1, 0.1);
			expect(tone.dbToGain(-12)).is.closeTo(0.25, 0.1);
			expect(tone.dbToGain(-24)).is.closeTo(0.125, 0.1);
		});

		it("can convert back and forth between db and gain representations", function(){
			expect(tone.dbToGain(tone.gainToDb(0))).is.closeTo(0, 0.01);
			expect(tone.dbToGain(tone.gainToDb(0.5))).is.closeTo(0.5, 0.01);
			expect(tone.gainToDb(tone.dbToGain(1))).is.closeTo(1, 0.01);
		});

	});
});