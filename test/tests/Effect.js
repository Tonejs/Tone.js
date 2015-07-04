/* global it, describe */

define(["tests/Core", "chai", "Recorder", "Tone/core/Master", "Tone/effect/Effect", "Tone/component/CrossFade",
	"Tone/effect/FeedbackEffect", "Tone/signal/Signal", "Tone/effect/AutoPanner", "Tone/effect/AutoWah", "Tone/effect/BitCrusher",
	"Tone/effect/FeedbackDelay", "Tone/effect/PingPongDelay", "Tone/effect/Chorus", "tests/Common", "Tone/effect/Freeverb", 
	"Tone/effect/JCReverb", "Tone/effect/StereoEffect", "Tone/effect/StereoFeedbackEffect", 
	"Tone/effect/StereoXFeedbackEffect", "Tone/effect/Phaser", "Tone/effect/Distortion", "Tone/effect/Chebyshev", 
	"Tone/effect/Convolver", "Tone/effect/MidSideEffect", "Tone/effect/StereoWidener", 
	"Tone/effect/AutoFilter", "Tone/effect/Tremolo"], 
function(Tone, chai, Recorder, Master, Effect, CrossFade, FeedbackEffect, Signal, AutoPanner, AutoWah, BitCrusher, 
	FeedbackDelay, PingPongDelay, Chorus, Test, Freeverb, JCReverb, StereoEffect, StereoFeedbackEffect, 
	StereoXFeedbackEffect, Phaser, Distortion, Chebyshev, Convolver, MidSide, StereoWidener, AutoFilter, Tremolo){

	var expect = chai.expect;

	Test.onlineContext();

	Master.mute = true;

	describe("Tone.Effect", function(){

		it("can be created and disposed", function(){
			var e = new Effect();
			e.dispose();
			Test.wasDisposed(e);
		});

		it("can by bypassed", function(){
			var e = new Effect();
			e.bypass();
			expect(e.wet.value).to.equal(0);
			e.dispose();
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
					"wet" : 0.5
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
			expect(e.wet).is.instanceof(Signal);
			e.dispose();
		});

		it("can be set with options object", function(){
			var e = new Effect();
			e.set({"wet" : 0.22});
			expect(e.wet.value).is.closeTo(0.22, 0.01);
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
					"wet" : 0.5
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
					"wet" : 0.5
				});
				input.connect(effect);
				effect.connect(output);
			}, function(){
				effect.dispose();
				done();
			});
		});

		it("can be set with options object", function(){
			var e = new StereoFeedbackEffect();
			var values = {
				"feedback" : 0.22
			};
			e.set(values);
			expect(e.get()).to.contain.keys(Object.keys(values));
			expect(e.feedback.value).is.closeTo(values.feedback, 0.05);
			e.dispose();
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
					"wet" : 0.5
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
			expect(e.wet).is.instanceof(Signal);
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
			expect(e.feedback.value).is.closeTo(0.22, 0.01);
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
					"wet" : 0.5
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
			expect(ap.wet.value).is.closeTo(0.22, 0.01);
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

		it("handles getter/setter", function(){
			Test.onlineContext();
			var wah = new AutoWah();
			var values = {
				"baseFrequency" : 200,
				"octaves" : 4,
				"sensitivity" : 1,
				"Q" : 3,
				"gain" : 0,
				"follower" : {
					"attack" : 0.4,
					"release" : 0.6
				}
			};
			wah.set(values);
			expect(wah.get()).to.contain.keys(Object.keys(values));
			expect(wah.baseFrequency).to.equal(values.baseFrequency);
			expect(wah.octaves).to.equal(values.octaves);
			expect(wah.Q.value).to.be.closeTo(values.Q, 0.05);
			expect(wah.gain.value).to.be.closeTo(values.gain, 0.05);
			wah.dispose();
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

		it("can be created and disposed", function(){
			var fd = new FeedbackDelay();
			var values = {
				"delayTime" : 0.5
			};
			fd.set(values);
			expect(fd.get()).to.contain.keys(Object.keys(values));
			expect(fd.delayTime.value).to.be.closeTo(values.delayTime, 0.05);
			fd.dispose();
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
				delay = new PingPongDelay(0.05);
				input.connect(delay);
				delay.connect(output);
			}, function(){
				delay.dispose();
				done();
			});
		});

		it("handles getter/setters", function(){
			var ppd = new PingPongDelay();
			var values = {
				"delayTime" : 0.5
			};
			ppd.set(values);
			expect(ppd.get()).to.contain.keys(Object.keys(values));
			expect(ppd.delayTime.value).to.be.closeTo(values.delayTime, 0.05);
			ppd.dispose();
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

		it("has getter/setters", function(){
			var chorus = new Chorus();
			var values = {
				"frequency" : 1.5, 
				"delayTime" : 3.5,
				"depth" : 0.7,
				"feedback" : 0.1,
				"type" : "sine"
			};
			chorus.set(values);
			expect(chorus.get()).to.contain.keys(Object.keys(values));
			expect(chorus.frequency.value).to.be.closeTo(values.frequency, 0.05);
			expect(chorus.delayTime).to.equal(values.delayTime);
			expect(chorus.depth).to.equal(values.depth);
			expect(chorus.feedback.value).to.be.closeTo(values.feedback, 0.05);
			expect(chorus.type).to.equal(values.type);
			chorus.dispose();
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

		it("can get/set values as an object", function(){
			var phaser = new Phaser();
			var values = {
				"frequency" : 0.5,
				"depth" : 10,
				"baseFrequency" : 400,
			};
			phaser.set(values);
			expect(phaser.get()).to.contain.keys(Object.keys(values));
			expect(phaser.frequency.value).to.be.closeTo(values.frequency, 0.05);
			expect(phaser.depth).to.be.closeTo(values.depth, 0.05);
			phaser.dispose();
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

		it("can get/set values as an object", function(){
			var fv = new Freeverb();
			var values = {
				"roomSize" : 0.6, 
				"dampening" : 0.4
			};
			fv.set(values);
			expect(fv.get()).to.contain.keys(Object.keys(values));
			expect(fv.roomSize.value).to.be.closeTo(values.roomSize, 0.05);
			expect(fv.dampening.value).to.be.closeTo(values.dampening, 0.05);
			fv.dispose();
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

		it("can get/set values as an object", function(){
			var rev = new JCReverb();
			var values = {
				"roomSize" : 0.6, 
			};
			rev.set(values);
			expect(rev.get()).to.contain.keys(Object.keys(values));
			expect(rev.roomSize.value).to.be.closeTo(values.roomSize, 0.05);
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

		it("has getter/setters", function(){
			var dist = new Distortion();
			var values = {
				"distortion" : 0.5,
				"oversample" : "2x"
			};
			dist.set(values);
			expect(dist.get()).to.contain.keys(Object.keys(values));
			expect(dist.oversample).to.equal(values.oversample);
			expect(dist.distortion).to.equal(values.distortion);
			dist.dispose();
		});
	});

	describe("Tone.Chebyshev", function(){
		it("can be created and disposed", function(){
			var cheb = new Chebyshev();
			cheb.dispose();
			Test.wasDisposed(cheb);
		});

		it("extends Tone.Effect", function(){
			var cheb = new Chebyshev();
			expect(cheb).is.instanceof(Effect);
			cheb.dispose();
		});

		it("handles input and output connections", function(){
			Test.onlineContext();
			var cheb = new Chebyshev();
			Test.acceptsInputAndOutput(cheb);
			cheb.dispose();
		});

		it("passes the incoming signal through to the output", function(done){
			var cheb;
			Test.passesAudio(function(input, output){
				cheb = new Chebyshev(1);
				input.connect(cheb);
				cheb.connect(output);
			}, function(){
				cheb.dispose();
				done();
			});
		});

		it("handles getter/setters", function(){
			var cheb = new Chebyshev();
			var values = {
				"order" : 2,
				"oversample" : "2x"
			};
			cheb.set(values);
			expect(cheb.get()).to.contain.keys(Object.keys(values));
			expect(cheb.order).to.equal(values.order);
			expect(cheb.oversample).to.equal(values.oversample);
			cheb.dispose();
		});
	});

	describe("Tone.Convolver", function(){
		it("can be created and disposed", function(){
			var conv = new Convolver();
			conv.dispose();
			Test.wasDisposed(conv);
		});

		it("extends Tone.Effect", function(){
			var conv = new Convolver();
			expect(conv).is.instanceof(Effect);
			conv.dispose();
		});

		it("handles input and output connections", function(){
			Test.onlineContext();
			var conv = new Convolver();
			Test.acceptsInputAndOutput(conv);
			conv.dispose();
		});

		/*it("passes the incoming signal through to the output", function(done){
			var conv;
			Test.passesAudio(function(input, output){
				conv = new Convolver(1);
				input.connect(conv);
				conv.connect(output);
			}, function(){
				conv.dispose();
				done();
			});
		});*/
	});

	describe("Tone.MidSide", function(){
		it("can be created and disposed", function(){
			var midside = new MidSide();
			midside.dispose();
			Test.wasDisposed(midside);
		});

		it("extends Tone.StereoEffect", function(){
			var midside = new MidSide();
			expect(midside).is.instanceof(Effect);
			midside.dispose();
		});

		it("handles input and output connections", function(){
			Test.onlineContext();
			var midside = new MidSide();
			Test.acceptsInputAndOutput(midside);
			midside.dispose();
		});
	});

	describe("Tone.StereoWidener", function(){
		it("can be created and disposed", function(){
			var widen = new StereoWidener();
			widen.dispose();
			Test.wasDisposed(widen);
		});

		it("extends Tone.MidSide", function(){
			var widen = new StereoWidener();
			expect(widen).is.instanceof(MidSide);
			widen.dispose();
		});

		it("handles input and output connections", function(){
			Test.onlineContext();
			var widen = new StereoWidener();
			Test.acceptsInputAndOutput(widen);
			widen.dispose();
		});

		it("passes the incoming signal through to the output", function(done){
			var widen;
			Test.passesAudio(function(input, output){
				widen = new StereoWidener(1);
				input.connect(widen);
				widen.connect(output);
			}, function(){
				widen.dispose();
				done();
			});
		});

		it("handles getter/setters", function(){
			var widen = new StereoWidener();
			var values = {
				"width" : 0.75,
			};
			widen.set(values);
			expect(widen.get()).to.contain.keys(Object.keys(values));
			expect(widen.width.value).to.equal(values.width);
			widen.dispose();
		});
	});

	describe("Tone.AutoFilter", function(){

		it("can be created and disposed", function(){
			var af = new AutoFilter();
			af.dispose();
			Test.wasDisposed(af);
		});

		it("handles input and output connections", function(){
			Test.onlineContext();
			var af = new AutoFilter();
			Test.acceptsInputAndOutput(af);
			af.dispose();
		});

		it("passes the incoming signal through to the output", function(done){
			var af;
			Test.passesAudio(function(input, output){
				af = new AutoFilter();
				input.connect(af);
				af.connect(output);
			}, function(){
				af.dispose();
				done();
			});
		});

		it("extends Tone.Effect", function(){
			var af = new AutoFilter();
			expect(af).is.instanceof(Effect);
			af.dispose();
		});

		it("can be set with options object", function(){
			var af = new AutoFilter();
			af.set({
				"wet" : 0.22,
				"frequency" : 2,
				"depth" : 0.6,
			});
			expect(af.wet.value).is.closeTo(0.22, 0.01);
			expect(af.frequency.value).is.closeTo(2, 0.01);
			expect(af.depth.value).is.closeTo(0.6, 0.01);
			af.dispose();
		});
	});

	describe("Tone.Tremolo", function(){

		it("can be created and disposed", function(){
			var trem = new Tremolo();
			trem.dispose();
			Test.wasDisposed(trem);
		});

		it("handles input and output connections", function(){
			Test.onlineContext();
			var trem = new Tremolo();
			Test.acceptsInputAndOutput(trem);
			trem.dispose();
		});

		it("passes the incoming signal through to the output", function(done){
			var trem;
			Test.passesAudio(function(input, output){
				trem = new Tremolo().start();
				input.connect(trem);
				trem.connect(output);
			}, function(){
				trem.dispose();
				done();
			});
		});

		it("extends Tone.Effect", function(){
			var trem = new Tremolo();
			expect(trem).is.instanceof(Effect);
			trem.dispose();
		});

		it("can be set with options object", function(){
			var trem = new Tremolo();
			trem.set({
				"wet" : 0.22,
				"frequency" : 12,
				"depth" : 0.6,
			});
			expect(trem.wet.value).is.closeTo(0.22, 0.01);
			expect(trem.frequency.value).is.closeTo(12, 0.01);
			expect(trem.depth.value).is.closeTo(0.6, 0.01);
			trem.dispose();
		});
	});
});
