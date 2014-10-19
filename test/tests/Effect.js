/* global it, describe */

define(["tests/Core", "chai", "Tone/component/Recorder", "Tone/core/Master", "Tone/effect/Effect", "Tone/component/DryWet",
	"Tone/effect/FeedbackEffect", "Tone/signal/Signal", "Tone/effect/AutoPanner", "Tone/effect/AutoWah", "Tone/effect/BitCrusher",
	"Tone/effect/FeedbackDelay", "Tone/effect/PingPongDelay", "Tone/effect/Chorus", "tests/Common", "Tone/effect/Freeverb", 
	"Tone/effect/JCReverb", "Tone/effect/StereoEffect", "Tone/effect/StereoFeedbackEffect", 
	"Tone/effect/StereoXFeedbackEffect", "Tone/effect/Phaser", "Tone/effect/Distortion"], 
function(Tone, chai, Recorder, Master, Effect, DryWet, FeedbackEffect, Signal, AutoPanner, AutoWah, BitCrusher, 
	FeedbackDelay, PingPongDelay, Chorus, Test, Freeverb, JCReverb, StereoEffect, StereoFeedbackEffect, 
	StereoXFeedbackEffect, Phaser, Distortion){

	var expect = chai.expect;

	Test.onlineContext();

	Master.mute();

	describe("Tone.Effect", function(){

		it("can be created and disposed", function(){
			var e = new Effect();
			e.dispose();
			Test.wasDisposed(e);
		});

		it("handles input and output connections", function(){
			Test.onlineContext();
			var e = new Effect();
			Test.acceptsInputAndOutput(e);
			e.dispose();
		});

		it("passes the incoming signal through to the output", function(done){
			var effect;
			Test.passesAudio(function(input, output){
				effect = new Effect({
					"dry" : 0.5
				});
				input.connect(effect);
				effect.connect(output);
			}, function(){
				effect.dispose();
				done();
			});
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

		it("handles input and output connections", function(){
			Test.onlineContext();
			var e = new StereoEffect();
			Test.acceptsInputAndOutput(e);
			e.dispose();
		});

		it("passes the incoming signal through to the output", function(done){
			var effect;
			Test.passesAudio(function(input, output){
				effect = new StereoEffect({
					"dry" : 0.5
				});
				input.connect(effect);
				effect.connect(output);
			}, function(){
				effect.dispose();
				done();
			});
		});
	});

	describe("Tone.StereoFeedbackEffect", function(){

		it("can be created and disposed", function(){
			var stereoEffect = new StereoFeedbackEffect();
			stereoEffect.dispose();
			Test.wasDisposed(stereoEffect);
		});

		it("extends Tone.Effect", function(){
			var stereoEffect = new StereoFeedbackEffect();
			expect(stereoEffect).is.instanceof(Effect);
			stereoEffect.dispose();
		});

		it("handles input and output connections", function(){
			Test.onlineContext();
			var e = new StereoFeedbackEffect();
			Test.acceptsInputAndOutput(e);
			e.dispose();
		});

		it("passes the incoming signal through to the output", function(done){
			var effect;
			Test.passesAudio(function(input, output){
				effect = new StereoFeedbackEffect({
					"dry" : 0.5
				});
				input.connect(effect);
				effect.connect(output);
			}, function(){
				effect.dispose();
				done();
			});
		});
	});

	describe("Tone.StereoXFeedbackEffect", function(){

		it("can be created and disposed", function(){
			var stereoEffect = new StereoXFeedbackEffect();
			stereoEffect.dispose();
			Test.wasDisposed(stereoEffect);
		});

		it("extends Tone.Effect", function(){
			var stereoEffect = new StereoXFeedbackEffect();
			expect(stereoEffect).is.instanceof(Effect);
			stereoEffect.dispose();
		});

		it("handles input and output connections", function(){
			Test.onlineContext();
			var e = new StereoXFeedbackEffect();
			Test.acceptsInputAndOutput(e);
			e.dispose();
		});

		it("passes the incoming signal through to the output", function(done){
			var effect;
			Test.passesAudio(function(input, output){
				effect = new StereoXFeedbackEffect({
					"dry" : 0.5
				});
				input.connect(effect);
				effect.connect(output);
			}, function(){
				effect.dispose();
				done();
			});
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

		it("handles input and output connections", function(){
			Test.onlineContext();
			var e = new FeedbackEffect();
			Test.acceptsInputAndOutput(e);
			e.dispose();
		});

		it("passes the incoming signal through to the output", function(done){
			var effect;
			Test.passesAudio(function(input, output){
				effect = new FeedbackEffect({
					"dry" : 0.5
				});
				input.connect(effect);
				effect.connect(output);
			}, function(){
				effect.dispose();
				done();
			});
		});
	});

	describe("Tone.AutoPanner", function(){

		it("can be created and disposed", function(){
			var ap = new AutoPanner();
			ap.dispose();
			Test.wasDisposed(ap);
		});

		it("handles input and output connections", function(){
			Test.onlineContext();
			var ap = new AutoPanner();
			Test.acceptsInputAndOutput(ap);
			ap.dispose();
		});

		it("passes the incoming signal through to the output", function(done){
			var ap;
			Test.passesAudio(function(input, output){
				ap = new AutoPanner();
				input.connect(ap);
				ap.connect(output);
			}, function(){
				ap.dispose();
				done();
			});
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

		it("handles input and output connections", function(){
			Test.onlineContext();
			var wah = new AutoWah();
			Test.acceptsInputAndOutput(wah);
			wah.dispose();
		});

		it("passes the incoming signal through to the output", function(done){
			var aw;
			Test.passesAudio(function(input, output){
				aw = new AutoWah();
				input.connect(aw);
				aw.connect(output);
			}, function(){
				aw.dispose();
				done();
			});
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

		it("handles input and output connections", function(){
			Test.onlineContext();
			var bc = new BitCrusher();
			Test.acceptsInputAndOutput(bc);
			bc.dispose();
		});

		it("passes the incoming signal through to the output", function(done){
			var bc;
			Test.passesAudio(function(input, output){
				bc = new BitCrusher();
				input.connect(bc);
				bc.connect(output);
			}, function(){
				bc.dispose();
				done();
			});
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

		it("handles input and output connections", function(){
			Test.onlineContext();
			var delay = new FeedbackDelay();
			Test.acceptsInputAndOutput(delay);
			delay.dispose();
		});

		it("passes the incoming signal through to the output", function(done){
			var delay;
			Test.passesAudio(function(input, output){
				delay = new FeedbackDelay(0.01);
				input.connect(delay);
				delay.connect(output);
			}, function(){
				delay.dispose();
				done();
			});
		});
	});

	describe("Tone.PingPongDelay", function(){

		it("can be created and disposed", function(){
			var ppd = new PingPongDelay();
			ppd.dispose();
			Test.wasDisposed(ppd);
		});

		it("handles input and output connections", function(){
			Test.onlineContext();
			var delay = new PingPongDelay();
			Test.acceptsInputAndOutput(delay);
			delay.dispose();
		});

		it("extends Tone.StereoXFeedbackEffect", function(){
			var ppd = new PingPongDelay();
			expect(ppd).is.instanceof(StereoXFeedbackEffect);
			ppd.dispose();
		});

		it("passes the incoming signal through to the output", function(done){
			var delay;
			Test.passesAudio(function(input, output){
				delay = new PingPongDelay(0.01);
				input.connect(delay);
				delay.connect(output);
			}, function(){
				delay.dispose();
				done();
			});
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

		it("handles input and output connections", function(){
			Test.onlineContext();
			var chorus = new Chorus();
			Test.acceptsInputAndOutput(chorus);
			chorus.dispose();
		});

		it("passes the incoming signal through to the output", function(done){
			var chorus;
			Test.passesAudio(function(input, output){
				chorus = new Chorus();
				input.connect(chorus);
				chorus.connect(output);
			}, function(){
				chorus.dispose();
				done();
			});
		});
	});

	describe("Tone.Phaser", function(){

		it("can be created and disposed", function(){
			var phaser = new Phaser();
			phaser.dispose();
			Test.wasDisposed(phaser);
		});
		
		it("extends Tone.Effect", function(){
			var phaser = new Phaser();
			expect(phaser).is.instanceof(Effect);
			phaser.dispose();
		});

		it("handles input and output connections", function(){
			Test.onlineContext();
			var phaser = new Phaser();
			Test.acceptsInputAndOutput(phaser);
			phaser.dispose();
		});

		it("passes the incoming signal through to the output", function(done){
			var phaser;
			Test.passesAudio(function(input, output){
				phaser = new Phaser();
				input.connect(phaser);
				phaser.connect(output);
			}, function(){
				phaser.dispose();
				done();
			});
		});
	});

	describe("Tone.Freeverb", function(){
		it("can be created and disposed", function(){
			var fv = new Freeverb();
			fv.dispose();
			Test.wasDisposed(fv);
		});

		it("extends Tone.Effect", function(){
			var fv = new Freeverb();
			expect(fv).is.instanceof(Effect);
			fv.dispose();
		});

		it("handles input and output connections", function(){
			Test.onlineContext();
			var fv = new Freeverb();
			Test.acceptsInputAndOutput(fv);
			fv.dispose();
		});

		it("passes the incoming signal through to the output", function(done){
			var fv;
			Test.passesAudio(function(input, output){
				fv = new Freeverb();
				input.connect(fv);
				fv.connect(output);
			}, function(){
				fv.dispose();
				done();
			});
		});
	});

	describe("Tone.JCReverb", function(){
		it("can be created and disposed", function(){
			var rev = new JCReverb();
			rev.dispose();
			Test.wasDisposed(rev);
		});

		it("extends Tone.Effect", function(){
			var rev = new JCReverb();
			expect(rev).is.instanceof(Effect);
			rev.dispose();
		});

		it("handles input and output connections", function(){
			Test.onlineContext();
			var rev = new JCReverb();
			Test.acceptsInputAndOutput(rev);
			rev.dispose();
		});

		it("passes the incoming signal through to the output", function(done){
			var rev;
			Test.passesAudio(function(input, output){
				rev = new JCReverb();
				input.connect(rev);
				rev.connect(output);
			}, function(){
				rev.dispose();
				done();
			});
		});
	});

	describe("Tone.Distortion", function(){
		it("can be created and disposed", function(){
			var dist = new Distortion();
			dist.dispose();
			Test.wasDisposed(dist);
		});

		it("extends Tone.Effect", function(){
			var dist = new Distortion();
			expect(dist).is.instanceof(Effect);
			dist.dispose();
		});

		it("handles input and output connections", function(){
			Test.onlineContext();
			var dist = new Distortion();
			Test.acceptsInputAndOutput(dist);
			dist.dispose();
		});

		it("passes the incoming signal through to the output", function(done){
			var dist;
			Test.passesAudio(function(input, output){
				dist = new Distortion();
				input.connect(dist);
				dist.connect(output);
			}, function(){
				dist.dispose();
				done();
			});
		});
	});
});
