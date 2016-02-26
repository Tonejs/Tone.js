define(["Test", "Tone/core/Type", "Tone/core/Transport", "deps/teoria"], function (Test, Tone, Transport, teoria) {

	describe("Types", function(){

		var tone;

		before(function(){
			tone = new Tone();
		});

		after(function(){
			tone.dispose();
		});

		context("Sample Conversion", function(){

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

		context("Frequency Conversions", function(){

			it("can convert notes into frequencies", function(){
				expect(tone.noteToFrequency("C4")).to.be.closeTo(teoria.note("C4").fq(), 0.0001);
				expect(tone.noteToFrequency("D4")).to.be.closeTo(teoria.note("D4").fq(), 0.0001);
				expect(tone.noteToFrequency("Db4")).to.be.closeTo(teoria.note("Db4").fq(), 0.0001);
				expect(tone.noteToFrequency("E4")).to.be.closeTo(teoria.note("E4").fq(), 0.0001);
				expect(tone.noteToFrequency("F2")).to.be.closeTo(teoria.note("F2").fq(), 0.0001);
				expect(tone.noteToFrequency("Gb-1")).to.be.closeTo(teoria.note("Gb-1").fq(), 0.0001);
				expect(tone.noteToFrequency("A#10")).to.be.closeTo(teoria.note("A#10").fq(), 0.0001);
				expect(tone.noteToFrequency("Bb2")).to.be.closeTo(teoria.note("Bb2").fq(), 0.0001);
			});

			it("can accomidate different concert tuning", function(){
				Tone.A4 = 444;
				expect(tone.noteToFrequency("C4")).to.be.closeTo(teoria.note("C4").fq(Tone.A4), 0.0001);
				expect(tone.noteToFrequency("D1")).to.be.closeTo(teoria.note("D1").fq(Tone.A4), 0.0001);
				Tone.A4 = 100;
				expect(tone.noteToFrequency("C4")).to.be.closeTo(teoria.note("C4").fq(Tone.A4), 0.0001);
				//return it to normal
				Tone.A4 = 440;
			});

			it("handles double accidentals", function(){
				expect(tone.noteToFrequency("Cbb4")).to.be.closeTo(teoria.note("Cbb4").fq(), 0.0001);
				expect(tone.noteToFrequency("Dx4")).to.be.closeTo(teoria.note("Dx4").fq(), 0.0001);
				expect(tone.noteToFrequency("Dbb4")).to.be.closeTo(teoria.note("Dbb4").fq(), 0.0001);
				expect(tone.noteToFrequency("Ex4")).to.be.closeTo(teoria.note("Ex4").fq(), 0.0001);
				expect(tone.noteToFrequency("Fx2")).to.be.closeTo(teoria.note("Fx2").fq(), 0.0001);
				expect(tone.noteToFrequency("Gbb-1")).to.be.closeTo(teoria.note("Gbb-1").fq(), 0.0001);
				expect(tone.noteToFrequency("Ax10")).to.be.closeTo(teoria.note("Ax10").fq(), 0.0001);
				expect(tone.noteToFrequency("Bbb2")).to.be.closeTo(teoria.note("Bbb2").fq(), 0.0001);
			});

			it("can convert frequencies into notes", function(){
				expect(tone.frequencyToNote(261.625)).to.equal(teoria.Note.fromFrequency(261.625).note.scientific());
				expect(tone.frequencyToNote(440)).to.equal(teoria.Note.fromFrequency(440).note.scientific());
				expect(tone.frequencyToNote(220)).to.equal(teoria.Note.fromFrequency(220).note.scientific());
				expect(tone.frequencyToNote(13.75)).to.equal(teoria.Note.fromFrequency(13.75).note.scientific());
				expect(tone.frequencyToNote(4979)).to.equal("D#8");				
			});

			it("can convert note to midi values", function(){
				expect(tone.midiToNote(60)).to.equal(teoria.Note.fromMIDI(60).scientific());
				expect(tone.midiToNote(62)).to.equal(teoria.Note.fromMIDI(62).scientific());
			});

			it("can convert midi values to note names", function(){
				expect(tone.noteToMidi("C3")).to.equal(teoria.note("C3").midi());
				expect(tone.noteToMidi("C4")).to.equal(teoria.note("C4").midi());
				expect(tone.noteToMidi("Bb2")).to.equal(teoria.note("Bb2").midi());
				expect(tone.noteToMidi("A#1")).to.equal(teoria.note("A#1").midi());
			});

			it("can convert midi values to frequencie", function(){
				expect(tone.midiToFrequency(69)).to.be.closeTo(teoria.Note.fromMIDI(69).fq(), 0.0001);
				expect(tone.midiToFrequency(57)).to.be.closeTo(teoria.Note.fromMIDI(57).fq(), 0.0001);
				expect(tone.midiToFrequency(120)).to.be.closeTo(teoria.Note.fromMIDI(120).fq(), 0.0001);
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

		context("Tone.notationToSeconds", function(){

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

			it("handles setting different time signatures", function(){
				Transport.bpm.value = 120;
				Transport.timeSignature = 7;
				expect(tone.notationToSeconds("4n")).to.equal(0.5);
				expect(tone.notationToSeconds("1m")).to.equal(3.5);
				expect(tone.notationToSeconds("1n")).to.equal(3.5);
			});
		});

		context("Tone.transportTimeToSeconds", function(){

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

		context("Tone.toTransportTime", function(){

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

		context("Tone.frequencyToSeconds", function(){

			it("converts frequencies as a string or number", function(){
				Transport.stop();
				Transport.bpm.value = 120;
				Transport.timeSignature = 4;
				expect(tone.frequencyToSeconds("1hz")).to.equal(1);
				expect(tone.frequencyToSeconds(".5")).to.equal(2);
				expect(tone.secondsToFrequency("5")).to.equal(0.2);
			});
		});

		context("Tone.toFrequency", function(){

			it("infers type correctly", function(){
				Transport.stop();
				Transport.bpm.value = 120;
				Transport.timeSignature = 4;
				expect(tone.toFrequency("1hz")).to.equal(1);
				expect(tone.toFrequency("4n")).to.equal(2);
				expect(tone.toFrequency(500)).to.equal(500);
			});
		});

		context("Tone.toSeconds", function(){

			afterEach(function(done){
				Tone.Transport.stop();
				Tone.Transport.bpm.value = 120;;
				setTimeout(function(){
					done();
				}, 100);
			});

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
				expect(tone.toSeconds("((1) + 2)*4n + 1:0:0")).to.equal(3.5);
			});

			it("can quantize values", function(){
				expect(tone.toSeconds("4n @ 2n")).to.be.closeTo(1, 0.01);
				expect(tone.toSeconds("2 @ 1.4")).to.be.closeTo(2.8, 0.01);
				expect(tone.toSeconds("1 + 4n @ 4n")).to.be.closeTo(1.5, 0.01);
				expect(tone.toSeconds("(1 + 4n) @ (4n + 1)")).to.be.closeTo(1.5, 0.01);
				expect(tone.toSeconds("(0.4 + 4n) @ (4n + 1)")).to.be.closeTo(1.5, 0.01);
				expect(tone.toSeconds("(0.4 @ 4n) + (2.1 @ 2n)")).to.be.closeTo(3.5, 0.01);
			});

			it("can get the next subdivison when the transport is started", function(done){
				var now = tone.now() + 0.1;
				Tone.Transport.start(now);
				setTimeout(function(){
					expect(tone.toSeconds("@8m")).to.be.closeTo(now + 16, 0.01);
					expect(tone.toSeconds("@1m + 4n")).to.be.closeTo(now + 2.5, 0.01);
					expect(tone.toSeconds("+1.1@4n")).to.be.closeTo(now + 1.5, 0.01);
					expect(tone.toSeconds("(@4n) + 2n")).to.be.closeTo(now + 1.5, 0.01);
					expect(tone.toSeconds("(+ 0.4 + 0.7 @4n) + 2n")).to.be.closeTo(now + 2.5, 0.01);
					done();
				}, 300);
			});
		});

		context("Tone.ticksToSeconds", function(){

			it("converts ticks to seconds", function(){
				var ppq = Transport.PPQ;
				var bpm = 120;
				Transport.bpm.value = bpm;
				Transport.timeSignature = 4;
				expect(tone.ticksToSeconds("1i")).to.be.closeTo((60/bpm) / ppq, 0.01);
				expect(tone.ticksToSeconds("100i")).to.be.closeTo(100 * (60/bpm) / ppq, 0.01);
			});
		});

		context("Tone.toTicks", function(){

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

		context("Tone.toNotation", function(){

			it("converts time into notation", function(){
				Transport.bpm.value = 120;
				Transport.timeSignature = 4;
				expect(tone.toNotation("4n")).to.equal("4n");
				expect(tone.toNotation(1.5)).to.equal("2n + 4n");
				expect(tone.toNotation(0)).to.equal("0");
				expect(tone.toNotation("1:2:3")).to.equal("1m + 2n + 8n + 16n");
			});

			it("works with triplet notation", function(){
				Transport.bpm.value = 120;
				Transport.timeSignature = 5;
				expect(tone.toNotation("1m + 8t")).to.equal("1m + 8t");
			});

		});

		context("Test Types", function(){

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
				expect(tone.isNote("Cb1")).to.be.true;
				expect(tone.isNote("Cbb1")).to.be.true;
				expect(tone.isNote("Cbb-11")).to.be.true;
				expect(tone.isNote("C-1")).to.be.true;
				expect(tone.isNote("Cb-1")).to.be.true;
				expect(tone.isNote("Cx11")).to.be.true;
				expect(tone.isNote("abb0")).to.be.true;
				expect(tone.isNote("C0.0")).to.be.false;
				expect(tone.isNote("C##0")).to.be.false;
				expect(tone.isNote("Cba-1")).to.be.false;
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
		});
	})
});