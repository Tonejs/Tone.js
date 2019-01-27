import Basic from "helper/Basic";
import Test from "helper/Test";
import Frequency from "Tone/type/Frequency";
import Tone from "Tone/core/Tone";
import teoria from "teoria";
import Offline from "helper/Offline";
import Time from "Tone/type/Time";
import TransportTime from "Tone/type/TransportTime";
import Ticks from "Tone/type/Ticks";
import Midi from "Tone/type/Midi";

describe("Frequency", function(){

	Basic(Frequency);

	context("Constructor", function(){

		it("can be made with or without 'new'", function(){
			var f0 = Frequency();
			expect(f0).to.be.instanceOf(Frequency);
			f0.dispose();
			var f1 = new Frequency();
			expect(f1).to.be.instanceOf(Frequency);
			f1.dispose();
		});

		it("can pass in a number in the constructor", function(){
			var frequency = Frequency(1);
			expect(frequency).to.be.instanceOf(Frequency);
			frequency.dispose();
		});

		it("can pass in a string in the constructor", function(){
			var frequency = Frequency("1");
			expect(frequency).to.be.instanceOf(Frequency);
			frequency.dispose();
		});

		it("can pass in a value and a type", function(){
			expect(Frequency(4, "n").valueOf()).to.equal(2);
		});

		it("with no arguments evaluates to 0", function(){
			expect(Frequency().valueOf()).to.equal(0);
		});

		it("is evaluated in equations and comparisons using valueOf", function(){
			expect(Frequency(1) + 1).to.equal(2);
			expect(Frequency(1) + Frequency(1)).to.equal(2);
			expect(Frequency(1) > Frequency(0)).to.be.true;
			expect(+Frequency(1)).to.equal(1);
		});

		it("can convert from Time", function(){
			expect(Frequency(Time(2)).valueOf()).to.equal(0.5);
			expect(Frequency(Time("4n")).valueOf()).to.equal(2);
			expect(Frequency(Time(4, "n")).valueOf()).to.equal(2);
		});

		it("can convert from Frequency", function(){
			expect(Frequency(Frequency(2)).valueOf()).to.equal(2);
			expect(Frequency(Frequency("4n")).valueOf()).to.equal(2);
			expect(Frequency(Frequency(4, "n")).valueOf()).to.equal(2);
		});

		it("can convert from TransportTime", function(){
			expect(Frequency(TransportTime(2)).valueOf()).to.equal(0.5);
			expect(Frequency(TransportTime("4n")).valueOf()).to.equal(2);
		});

		it("can convert from Midi", function(){
			expect(Frequency(Midi("C4")).valueOf()).to.equal(Frequency("C4").valueOf());
			expect(Frequency(Midi(60)).valueOf()).to.equal(Frequency("C4").valueOf());
			expect(Frequency(Midi(61)).valueOf()).to.equal(Frequency("C#4").valueOf());
		});

		it("can convert from Ticks", function(){
			return Offline(function(Transport){
				expect(Frequency(Ticks(Transport.PPQ)).valueOf()).to.equal(2);
				expect(Frequency(Ticks("4n")).valueOf()).to.equal(2);
			});
		});
	});

	context("Eval Types", function(){

		it("evaluates numbers as frequency", function(){
			expect(Frequency("1").valueOf()).to.equal(1);
			expect(Frequency("123").valueOf()).to.equal(123);
			expect(Frequency(3.2).valueOf()).to.equal(3.2);
		});

		it("evaluates notation", function(){
			return Offline(function(Transport){
				Transport.bpm.value = 120;
				Transport.timeSignature = 4;
				expect(Frequency("4n").valueOf()).to.equal(2);
				expect(Frequency("8n").valueOf()).to.equal(4);
				expect(Frequency(16, "n").valueOf()).to.equal(8);
				Transport.bpm.value = 60;
				Transport.timeSignature = [5, 4];
				expect(Frequency("1m").valueOf()).to.equal(1/5);
				Transport.bpm.value = 120;
				Transport.timeSignature = 4;
			});
		});

		it("evalutes hertz", function(){
			expect(Frequency("1hz").valueOf()).to.equal(1);
			expect(Frequency("2hz").valueOf()).to.equal(2);
			expect(Frequency(4, "hz").valueOf()).to.equal(4);
			expect(Frequency("0.25hz").valueOf()).to.equal(0.25);
		});

		it("evalutes ticks", function(){
			return Offline(function(Transport){
				expect(Frequency(Transport.PPQ, "i").valueOf()).to.equal(2);
				expect(Frequency(1, "i").valueOf()).to.equal(Transport.PPQ * 2);
			});
		});

		it("evalutes transport time", function(){
			expect(Frequency("1:0").valueOf()).to.equal(0.5);
			expect(Frequency("1:4:0").valueOf()).to.equal(0.25);
			// expect(Frequency("2:1:0").valueOf()).to.equal(0.25);
		});

		it("evalutes midi", function(){
			expect(Frequency(48, "midi").valueOf()).to.be.closeTo(teoria.Note.fromMIDI(48).fq(), 0.0001);
			expect(Frequency(69, "midi").valueOf()).to.be.closeTo(teoria.Note.fromMIDI(69).fq(), 0.0001);
		});

		it("evalutes hz", function(){
			expect(Frequency(48, "hz").valueOf()).to.equal(48);
			expect(Frequency(480, "hz").valueOf()).to.equal(480);
		});

		it("can convert notes into frequencies", function(){
			expect(Frequency("C4").valueOf()).to.be.closeTo(teoria.note("C4").fq(), 0.0001);
			expect(Frequency("D4").valueOf()).to.be.closeTo(teoria.note("D4").fq(), 0.0001);
			expect(Frequency("Db4").valueOf()).to.be.closeTo(teoria.note("Db4").fq(), 0.0001);
			expect(Frequency("E4").valueOf()).to.be.closeTo(teoria.note("E4").fq(), 0.0001);
			expect(Frequency("F2").valueOf()).to.be.closeTo(teoria.note("F2").fq(), 0.0001);
			expect(Frequency("Gb-1").valueOf()).to.be.closeTo(teoria.note("Gb-1").fq(), 0.0001);
			expect(Frequency("A#10").valueOf()).to.be.closeTo(teoria.note("A#10").fq(), 0.0001);
			expect(Frequency("Bb2").valueOf()).to.be.closeTo(teoria.note("Bb2").fq(), 0.0001);
		});

		it("handles double accidentals", function(){
			expect(Frequency("Cbb4").valueOf()).to.be.closeTo(teoria.note("Cbb4").fq(), 0.0001);
			expect(Frequency("Dx4").valueOf()).to.be.closeTo(teoria.note("Dx4").fq(), 0.0001);
			expect(Frequency("Dbb4").valueOf()).to.be.closeTo(teoria.note("Dbb4").fq(), 0.0001);
			expect(Frequency("Ex4").valueOf()).to.be.closeTo(teoria.note("Ex4").fq(), 0.0001);
			expect(Frequency("Fx2").valueOf()).to.be.closeTo(teoria.note("Fx2").fq(), 0.0001);
			expect(Frequency("Gbb-1").valueOf()).to.be.closeTo(teoria.note("Gbb-1").fq(), 0.0001);
			expect(Frequency("Ax10").valueOf()).to.be.closeTo(teoria.note("Ax10").fq(), 0.0001);
			expect(Frequency("Bbb2").valueOf()).to.be.closeTo(teoria.note("Bbb2").fq(), 0.0001);
		});

		it("can accomidate different concert tuning", function(){
			Frequency.A4 = 444;
			expect(Frequency("C4").valueOf()).to.be.closeTo(teoria.note("C4").fq(Frequency.A4), 0.0001);
			expect(Frequency("D1").valueOf()).to.be.closeTo(teoria.note("D1").fq(Frequency.A4), 0.0001);
			Frequency.A4 = 100;
			expect(Frequency("C4").valueOf()).to.be.closeTo(teoria.note("C4").fq(Frequency.A4), 0.0001);
			//return it to normal
			Frequency.A4 = 440;
		});

	});

	context("transpose/harmonize", function(){

		it("can transpose a value", function(){
			expect(Tone.Frequency("A4").transpose(3).toMidi()).to.equal(72);
			expect(Tone.Frequency("A4").transpose(-3).toMidi()).to.equal(66);
			expect(Tone.Frequency(440).transpose(-12).valueOf()).to.equal(220);
		});

		it("can harmonize a value", function(){
			expect(Tone.Frequency("A4").harmonize([0, 3])).to.be.an("array");
			expect(Tone.Frequency("A4").harmonize([0, 3]).length).to.equal(2);
			expect(Tone.Frequency("A4").harmonize([0, 3])[0].toNote()).to.equal("A4");
			expect(Tone.Frequency("A4").harmonize([0, 3])[1].toNote()).to.equal("C5");

			expect(Tone.Frequency("A4").harmonize([-12, 0, 12])).to.be.an("array");
			expect(Tone.Frequency("A4").harmonize([-12, 0, 12]).length).to.equal(3);
			expect(Tone.Frequency("A4").harmonize([-12, 0, 12])[0].toNote()).to.equal("A3");
			expect(Tone.Frequency("A4").harmonize([-12, 0, 12])[1].toNote()).to.equal("A4");
			expect(Tone.Frequency("A4").harmonize([-12, 0, 12])[2].toNote()).to.equal("A5");
		});
	});

	context("Conversions", function(){

		it("can convert frequencies into notes", function(){
			expect(Frequency(261.625).toNote()).to.equal(teoria.Note.fromFrequency(261.625).note.scientific());
			expect(Frequency(440).toNote()).to.equal(teoria.Note.fromFrequency(440).note.scientific());
			expect(Frequency(220).toNote()).to.equal(teoria.Note.fromFrequency(220).note.scientific());
			expect(Frequency(13.75).toNote()).to.equal(teoria.Note.fromFrequency(13.75).note.scientific());
			expect(Frequency(4979).toNote()).to.equal("D#8");
		});

		it("can convert note to midi values", function(){
			expect(Frequency("C4").toMidi()).to.equal(teoria.note("C4").midi());
			expect(Frequency("C#0").toMidi()).to.equal(teoria.note("C#0").midi());
			expect(Frequency("A-4").toMidi()).to.equal(teoria.note("A-4").midi());
		});

		it("can convert hertz to seconds", function(){
			expect(Frequency(4).toSeconds()).to.equal(0.25);
			expect(Frequency("2hz").toSeconds()).to.equal(0.5);
		});
	});

});

