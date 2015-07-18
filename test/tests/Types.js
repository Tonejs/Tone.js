/* global it, describe */

define(["chai", "Tone/core/Tone", "Tone/core/Types", "Tone/core/Transport"], 
function(chai, Tone, Types, Transport){
	var expect = chai.expect;

	var tone = new Tone();

	describe("Sample Conversion", function(){

		it("correctly calculates samples to seconds", function(){
			var sampleRate = tone.context.sampleRate;
			expect(tone.samplesToSeconds(100)).to.equal(100/sampleRate);
			expect(tone.samplesToSeconds(800)).to.equal(800/sampleRate);
		});

		it("correctly calculates seconds to samples", function(){
			var sampleRate = tone.context.sampleRate;
			expect(tone.secondsToSamples(1)).to.equal(1 * sampleRate);
			expect(tone.secondsToSamples(0.5)).to.equal(0.5*sampleRate);
		});

	});

	describe("Frequency Conversions", function(){

		it("can convert notes into frequencies", function(){
			expect(tone.noteToFrequency("A4")).to.be.closeTo(440, 0.0001);
			expect(tone.noteToFrequency("Bb4")).to.be.closeTo(466.163761, 0.0001);
		});

		it("can convert frequencies into notes", function(){
			expect(tone.frequencyToNote(440)).to.equal("A4");
			expect(tone.frequencyToNote(4978.031739553295)).to.equal("D#8");
		});

		it("can convert note to midi values", function(){
			expect(tone.midiToNote(60)).to.equal("C3");
			expect(tone.midiToNote(61)).to.equal("C#3");
		});

		it("can convert midi values to note names", function(){
			expect(tone.noteToMidi("C3")).to.equal(60);
			expect(tone.noteToMidi("Bb2")).to.equal(58);
			expect(tone.noteToMidi("A#2")).to.equal(58);
		});

		it("can convert midi values to frequencie", function(){
			expect(tone.midiToFrequency(69)).to.be.closeTo(440, 0.0001);
			expect(tone.midiToFrequency(57)).to.be.closeTo(220, 0.0001);
		});

		it("can convert frequency to midi values", function(){
			expect(tone.midiToFrequency(69)).to.be.closeTo(440, 0.0001);
			expect(tone.midiToFrequency(57)).to.be.closeTo(220, 0.0001);
		});

		it("can convert semitone intervals to frequency ratios", function(){
			expect(tone.intervalToFrequencyRatio(0)).to.equal(1);
			expect(tone.intervalToFrequencyRatio(12)).to.equal(2);
			expect(tone.intervalToFrequencyRatio(7)).to.be.closeTo(1.5, 0.01);
		});

		it("can convert different representations into frequencies", function(){
			expect(tone.toFrequency("4n")).to.equal(2);
			expect(tone.toFrequency("4hz")).to.equal(4);
			expect(tone.toFrequency("A4")).to.be.closeTo(440, 0.001);
			expect(tone.toFrequency(990)).to.equal(990);
		});
	});

	describe("Tone.notationToSeconds", function(){

		it("handles measures, measure subdivision and triplets", function(){
			Transport.bpm.value = 120;
			Transport.timeSignature = 4;
			expect(tone.notationToSeconds("1m")).to.equal(2);
			expect(tone.notationToSeconds("4n")).to.equal(0.5);
			expect(tone.notationToSeconds("8n")).to.equal(0.25);
			expect(tone.notationToSeconds("16n")).to.equal(0.125);
			expect(tone.notationToSeconds("2t")).to.equal(2/3);
			expect(tone.notationToSeconds("8t")).to.equal(1/6);
		});

		it("handles setting different BPM", function(){
			Transport.bpm.value = 240;
			Transport.timeSignature = 4;
			expect(tone.notationToSeconds("4n")).to.equal(0.25);
			expect(tone.notationToSeconds("1")).to.equal(0);
			expect(tone.notationToSeconds("8t")).to.equal(0.25/3);
			expect(tone.notationToSeconds("8m")).to.equal(8);
		});
	});

	describe("Tone.transportTimeToSeconds", function(){

		it("converts transport time in multiple forms to seconds", function(){
			Transport.stop();
			Transport.bpm.value = 120;
			Transport.timeSignature = 4;
			expect(tone.transportTimeToSeconds("1:2:3")).to.equal(3.375);
			expect(tone.transportTimeToSeconds("1:2:0")).to.equal(3);
			expect(tone.transportTimeToSeconds("1:2")).to.equal(3);
			expect(tone.transportTimeToSeconds("0:2")).to.equal(1);
			expect(tone.transportTimeToSeconds("2")).to.equal(1);
			expect(tone.transportTimeToSeconds("0:0:2")).to.equal(0.25);
		});

		it("handles time signature changes", function(){
			Transport.stop();
			Transport.bpm.value = 120;
			Transport.timeSignature = 6;
			expect(tone.transportTimeToSeconds("4:0")).to.equal(12);
			expect(tone.transportTimeToSeconds("6")).to.equal(3);
		});
	});

	describe("Tone.toTransportTime", function(){

		it("converts seconds to transport time", function(){
			Transport.stop();
			Transport.bpm.value = 120;
			Transport.timeSignature = 4;
			expect(tone.toTransportTime(3.375)).to.equal("1:2:3");
			expect(tone.toTransportTime(3)).to.equal("1:2:0");
		});

		it("handles time signature changes", function(){
			Transport.stop();
			Transport.bpm.value = 120;
			Transport.timeSignature = 6;
			expect(tone.toTransportTime(12)).to.equal("4:0:0");
			expect(tone.toTransportTime(3)).to.equal("1:0:0");
		});
	});

	describe("Tone.frequencyToSeconds", function(){

		it("converts frequencies as a string or number", function(){
			Transport.stop();
			Transport.bpm.value = 120;
			Transport.timeSignature = 4;
			expect(tone.frequencyToSeconds("1hz")).to.equal(1);
			expect(tone.frequencyToSeconds(".5")).to.equal(2);
			expect(tone.secondsToFrequency("5")).to.equal(0.2);
		});
	});

	describe("Tone.toFrequency", function(){

		it("infers type correctly", function(){
			Transport.stop();
			Transport.bpm.value = 120;
			Transport.timeSignature = 4;
			expect(tone.toFrequency("1hz")).to.equal(1);
			expect(tone.toFrequency("4n")).to.equal(2);
			expect(tone.toFrequency(500)).to.equal(500);
		});
	});

	describe("Tone.toSeconds", function(){

		it("correctly infers type", function(){
			Transport.stop();
			Transport.bpm.value = 120;
			Transport.timeSignature = 4;
			expect(tone.toSeconds("5")).to.equal(5);
			expect(tone.toSeconds("1m")).to.equal(2);
			expect(tone.toSeconds("1")).to.equal(1);
			expect(tone.toSeconds("1:0:0")).to.equal(2);
			expect(tone.toSeconds("2hz")).to.equal(0.5);
		});

		it("handles 'now' relative values", function(){
			Transport.stop();
			Transport.bpm.value = 120;
			Transport.timeSignature = 4;
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
			Transport.bpm.value = 120;
			Transport.timeSignature = 4;
			expect(tone.toSeconds("1+2+3")).to.equal(6);
			expect(tone.toSeconds("2*1:2 - 1m")).to.equal(4);
			expect(tone.toSeconds("(1 + 2) / 4n")).to.equal(6);
		});
	});

	describe("Tone.ticksToSeconds", function(){

		it("converts ticks to seconds", function(){
			var ppq = Transport.PPQ;
			Transport.bpm.value = 120;
			Transport.timeSignature = 4;
			expect(tone.ticksToSeconds("1i")).to.equal(tone.notationToSeconds("4n") / ppq);
			expect(tone.ticksToSeconds("100i")).to.equal(100 * tone.notationToSeconds("4n") / ppq);
		});
	});

	describe("Tone.toTicks", function(){

		it("converts time into ticks", function(){
			var ppq = Transport.PPQ;
			Transport.bpm.value = 120;
			Transport.timeSignature = 4;
			expect(tone.toTicks("1i")).to.equal(1);
			expect(tone.toTicks("4n")).to.equal(ppq);
			expect(tone.toTicks("4n + 8n")).to.equal(ppq * 1.5);
		});

		it("handles now-relative values relative to the Transports current ticks", function(done){
			var ppq = Transport.PPQ;
			Transport.bpm.value = 120;
			Transport.timeSignature = 4;
			expect(tone.toTicks("+4n")).to.equal(ppq);
			Transport.start();
			setTimeout(function(){
				var currentTicks = Transport.ticks;
				expect(tone.toTicks("+4n")).to.equal(ppq + currentTicks);
				Transport.stop();
				done();
			}, 100);
		});
	});

	describe("Tone.getType", function(){

		it("can recognize frequency format", function(){
			expect(tone.isFrequency("12hz")).to.be.true;
			expect(tone.isFrequency("12z")).to.be.false;
			expect(tone.isFrequency("100")).to.be.false;
			expect(tone.isFrequency("100.00hz")).to.be.true;
			expect(tone.isFrequency("z100.00hz")).to.be.false;
		});

		it("can recognize notation format", function(){
			expect(tone.isNotation("1m")).to.be.true;
			expect(tone.isNotation("a1m")).to.be.false;
			expect(tone.isNotation("100")).to.be.false;
			expect(tone.isNotation("1.0n")).to.be.false;
			expect(tone.isNotation("1n")).to.be.true;
			expect(tone.isNotation("8t")).to.be.true;
			expect(tone.isNotation("16n")).to.be.true;
		});

		it("can recognize note format", function(){
			expect(tone.isNote("C3")).to.be.true;
			expect(tone.isNote("C#9")).to.be.true;
			expect(tone.isNote("db0")).to.be.true;
			expect(tone.isNote("bb0")).to.be.true;
			expect(tone.isNote("abb0")).to.be.false;
			expect(tone.isNote("C0.0")).to.be.false;
			expect(tone.isNote("C##0")).to.be.false;
			expect(tone.isNote("aC1")).to.be.false;
			expect(tone.isNote(1231)).to.be.false;
		});

		it("can recognize tick format", function(){
			expect(tone.isTicks("1i")).to.be.true;
			expect(tone.isTicks("11")).to.be.false;
			expect(tone.isTicks("110.0i")).to.be.false;
			expect(tone.isTicks(1231)).to.be.false;
			expect(tone.isTicks("absdf")).to.be.false;
		});

		it("can recognize now-relative format", function(){
			expect(tone.isNowRelative("+1i")).to.be.true;
			expect(tone.isNowRelative("+asdfa")).to.be.true;
			expect(tone.isNowRelative(" + asdfa")).to.be.true;
			expect(tone.isNowRelative(" + 1")).to.be.true;
			expect(tone.isNowRelative(" 1+ 1")).to.be.false;
			expect(tone.isNowRelative(" 1+")).to.be.false;
			expect(tone.isNowRelative("+")).to.be.false;
		});

		it("can recognize transportTime format", function(){
			expect(tone.isTransportTime("1:0:0")).to.be.true;
			expect(tone.isTransportTime("1:0:0.001")).to.be.true;
			expect(tone.isTransportTime("2:0")).to.be.true;
			expect(tone.isTransportTime("2:0.01")).to.be.true;
			expect(tone.isTransportTime("a2:0")).to.be.false;
			expect(tone.isTransportTime("2:0a")).to.be.false;
			expect(tone.isTransportTime("2")).to.be.false;
		});

		it("can correctly infer the type", function(){
			expect(tone.getType("12hz")).to.equal(Tone.Type.Frequency);
			expect(tone.getType("1:0:0")).to.equal(Tone.Type.TransportTime);
			expect(tone.getType("1n")).to.equal(Tone.Type.Notation);
			expect(tone.getType("C4")).to.equal(Tone.Type.Note);
			expect(tone.getType("12i")).to.equal(Tone.Type.Ticks);
			expect(tone.getType("asdfa")).is.undefined;
			expect(tone.getType(12)).is.equal(Tone.Type.Default);
			expect(tone.getType("12.0")).is.equal(Tone.Type.Default);
		});
	});

});