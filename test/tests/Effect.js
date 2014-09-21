/* global it, describe */

define(["tests/Core", "chai", "Tone/component/Recorder", "Tone/core/Master", "Tone/effect/Effect", "Tone/component/DryWet",
	"Tone/effect/FeedbackEffect", "Tone/signal/Signal", "Tone/effect/AutoPanner", "Tone/effect/AutoWah", "Tone/effect/BitCrusher",
	"Tone/effect/FeedbackDelay", "Tone/effect/PingPongDelay", "Tone/effect/Chorus", "tests/Common", "Tone/effect/Freeverb", 
	"Tone/effect/JCReverb", "Tone/effect/StereoEffect"], 
function(Tone, chai, Recorder, Master, Effect, DryWet, FeedbackEffect, Signal, AutoPanner, AutoWah, BitCrusher, 
	FeedbackDelay, PingPongDelay, Chorus, Test, Freeverb, JCReverb, StereoEffect){

	var expect = chai.expect;

	Test.onlineContext();

	Master.mute();

	describe("Tone.Effect", function(){

		it("can be created and disposed", function(){
			var e = new Effect();
			e.dispose();
			Test.wasDisposed(e);
		});

		it("has a dry/wet control", function(){
			var e = new Effect();
			expect(e.dryWet).is.instanceof(DryWet);
			e.dispose();
		});

		it("can be set with options object", function(){
			var e = new Effect();
			e.set({"wet" : 0.22});
			expect(e.dryWet.wetness.getValue()).is.closeTo(0.22, 0.01);
			e.dispose();
		});
	});

	describe("Tone.StereoEffect", function(){

		it("can be created and disposed", function(){
			var stereoEffect = new StereoEffect();
			stereoEffect.dispose();
			Test.wasDisposed(stereoEffect);
		});

		it("extends Tone.Effect", function(){
			var stereoEffect = new StereoEffect();
			expect(stereoEffect).is.instanceof(Effect);
			stereoEffect.dispose();
		});
	});

	describe("Tone.FeedbackEffect", function(){

		it("can be created and disposed", function(){
			var fe = new FeedbackEffect();
			fe.dispose();
			Test.wasDisposed(fe);
		});

		it("has a dry/wet control", function(){
			var e = new FeedbackEffect();
			expect(e.dryWet).is.instanceof(DryWet);
			e.dispose();
		});

		it("has a feedback control", function(){
			var e = new FeedbackEffect();
			expect(e.feedback).is.instanceof(Signal);
			e.dispose();
		});

		it("can be set with options object", function(){
			var e = new FeedbackEffect();
			e.set({"feedback" : 0.22});
			expect(e.feedback.getValue()).is.closeTo(0.22, 0.01);
			e.dispose();
		});
	});

	describe("Tone.AutoPanner", function(){

		it("can be created and disposed", function(){
			var ap = new AutoPanner();
			ap.dispose();
			Test.wasDisposed(ap);
		});

		it("extends Tone.Effect", function(){
			var ap = new AutoPanner();
			expect(ap).is.instanceof(Effect);
			ap.dispose();
		});

		it("can be set with options object", function(){
			var ap = new AutoPanner();
			ap.set({"wet" : 0.22});
			expect(ap.dryWet.wetness.getValue()).is.closeTo(0.22, 0.01);
			ap.dispose();
		});
	});

	describe("Tone.AutoWah", function(){

		it("can be created and disposed", function(){
			var aw = new AutoWah();
			aw.dispose();
			Test.wasDisposed(aw);
		});

		it("extends Tone.Effect", function(){
			var aw = new AutoWah();
			expect(aw).is.instanceof(Effect);
			aw.dispose();
		});
	});

	describe("Tone.BitCrusher", function(){

		it("can be created and disposed", function(){
			var bc = new BitCrusher();
			bc.dispose();
			Test.wasDisposed(bc);
		});

		it("extends Tone.Effect", function(){
			var bc = new BitCrusher();
			expect(bc).is.instanceof(Effect);
			bc.dispose();
		});
	});

	describe("Tone.FeedbackDelay", function(){

		it("can be created and disposed", function(){
			var fd = new FeedbackDelay();
			fd.dispose();
			Test.wasDisposed(fd);
		});

		it("extends Tone.FeedbackEffect", function(){
			var fd = new FeedbackDelay();
			expect(fd).is.instanceof(FeedbackEffect);
			fd.dispose();
		});
	});

	describe("Tone.PingPongDelay", function(){

		it("can be created and disposed", function(){
			var ppd = new PingPongDelay();
			ppd.dispose();
			Test.wasDisposed(ppd);
		});
	});

	describe("Tone.Chorus", function(){

		it("can be created and disposed", function(){
			var chorus = new Chorus();
			chorus.dispose();
			Test.wasDisposed(chorus);
		});
		
		it("extends Tone.Effect", function(){
			var chorus = new Chorus();
			expect(chorus).is.instanceof(Effect);
			chorus.dispose();
		});
	});

	describe("Tone.Freeverb", function(){
		it("can be created and disposed", function(){
			var fv = new Freeverb();
			fv.dispose();
			Test.wasDisposed(fv);
		});
	});

	describe("Tone.JCReverb", function(){
		it("can be created and disposed", function(){
			var rev = new JCReverb();
			rev.dispose();
			Test.wasDisposed(rev);
		});
	});
});
