///////////////////////////////////////////////////////////////////////////////
//
//  SAMPLE PLAYER
//
//	dependencies : Tone, Player, Envelope, LFO
///////////////////////////////////////////////////////////////////////////////

define(["Tone/core/Tone", "Tone/component/Envelope", "Tone/source/Player"], function(Tone){

	Tone.Sampler = function(url){
		Tone.call(this);

		//components
		this.player = new Tone.Player(url);
		this.envelope = new Tone.Envelope(.1, .01, .1, 1);
		this.filter = this.context.createBiquadFilter();
		this.filter.type = "lowpass";
		this.filter.Q.value = 12;
		this.filterEnvelope = new Tone.Envelope(.4, 0, 1, .6, this.filter.frequency, 0, 1200);

		//connect it up
		this.chain(this.player, this.envelope, this.filter, this.output);
	}

	Tone.extend(Tone.Sampler, Tone);


	//@param {function()=} callback
	Tone.Sampler.prototype.load = function(callback){
		this.player.load(callback);
	}

	Tone.Sampler.prototype.triggerAttack = function(startTime){
		this.player.start(startTime);
		this.envelope.triggerAttack(startTime);
		this.filterEnvelope.triggerAttack(startTime);
	}

	Tone.Sampler.prototype.triggerRelease = function(stopTime){
		stopTime = this.defaultArg(stopTime, this.now());
		this.player.stop(stopTime + Math.max(this.envelope.release, this.filterEnvelope.release));
		this.envelope.triggerRelease(stopTime);
		this.filterEnvelope.triggerRelease(stopTime);
	}

	return Tone.Sampler;
});