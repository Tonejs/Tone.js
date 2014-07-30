/* global it, describe */

define(["chai", "Tone/core/Tone", "Tone/core/Master", "Tone/core/Bus"], function(chai, Tone, Master){
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

	/*describe("Tone.setContext", function(){
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
	});*/

});