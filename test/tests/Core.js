/* global it, describe, after */

define(["chai", "Tone/core/Tone", "Tone/core/Master", "Tone/core/Bus", "Tone/core/Note"], function(chai, Tone, Master, Note){
	var expect = chai.expect;

	describe("AudioContext", function(){
		this.timeout(3000);

		it ("was created", function(){
			expect(Tone.context).to.be.instanceof(AudioContext);
		});

		it ("has OscillatorNode", function(){
			expect(Tone.context.createOscillator).to.be.instanceof(Function);
		});

		it ("clock running", function(done){
			var interval = setInterval(function(){
				if (Tone.context.currentTime > 0){
					clearInterval(interval);
					done();
				}
			}, 20);
		});

		it ("has current API", function(){
			expect(OscillatorNode.prototype.start).to.be.instanceof(Function);
			expect(AudioBufferSourceNode.prototype.start).to.be.instanceof(Function);
			expect(AudioContext.prototype.createGain).to.be.instanceof(Function);
		});

	});

	describe("Tone", function(){

		var tone = new Tone();

		after(function(){
			tone.dispose();
		});

		it("correctly calculates samples to seconds", function(){
			var sampleRate = tone.context.sampleRate;
			expect(tone.samplesToSeconds(100)).to.equal(100/sampleRate);
			expect(tone.samplesToSeconds(800)).to.equal(800/sampleRate);
		});

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

		it("returns a default argument when the given is not defined", function(){
			expect(tone.defaultArg(undefined, 0)).is.equal(0);
			expect(tone.defaultArg(undefined, "also")).is.equal("also");
			expect(tone.defaultArg("hihi", 100)).is.equal("hihi");
		});

		it("handles default arguments on an object", function(){
			expect(tone.defaultArg({"b" : 10}, {"a" : 4, "b" : 10})).has.property("a", 4);
			expect(tone.defaultArg({"b" : 10}, {"a" : 4, "b" : 10})).has.property("b", 10);
			expect(tone.defaultArg({"b" : {"c" : 10}}, {"b" : {"c" : 20}})).has.deep.property("b.c", 10);
			expect(tone.defaultArg({"a" : 10}, {"b" : {"c" : 20}})).has.deep.property("b.c", 20);
		});


	});

	describe("Tone.Note", function(){

		var tone = new Tone();

		after(function(){
			tone.dispose();
		});

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

		it("can convert semitone intervals to frequency ratios", function(){
			expect(tone.intervalToFrequencyRatio(0)).to.equal(1);
			expect(tone.intervalToFrequencyRatio(12)).to.equal(2);
			expect(tone.intervalToFrequencyRatio(7)).to.be.closeTo(1.5, 0.01);
		});
	});

	describe("Tone.Master", function(){
		it ("exists", function(){
			expect(Tone.Master).to.equal(Master);
		});
	});

	describe("Tone.Bus", function(){
		it ("provides a send and receive method", function(){
			expect(Tone.prototype.send).is.a("function");
			expect(Tone.prototype.receive).is.a("function");
		});
	});

	describe("Tone.setContext", function(){
		it ("can set a new context", function(){
			var origCtx = Tone.context;
			var ctx = new OfflineAudioContext(2, 44100, 44100);
			Tone.setContext(ctx);
			expect(Tone.context).to.equal(ctx);
			expect(Tone.prototype.context).to.equal(ctx);
			//then set it back
			Tone.setContext(origCtx);
			expect(Tone.context).to.equal(origCtx);
			expect(Tone.prototype.context).to.equal(origCtx);
			//and a saftey check
			expect(ctx).to.not.equal(origCtx);
		});
	});

});