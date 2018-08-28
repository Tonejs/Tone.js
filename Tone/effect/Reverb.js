define(["../core/Tone", "../core/Offline", "../component/Filter", "../component/Merge",
	"../source/Noise", "../core/Gain", "../effect/Convolver"], function(Tone){

	"use strict";

	/**
	 *  @class Simple convolution created with decaying noise.
	 *  		Generates an Impulse Response Buffer
	 * 			with Tone.Offline then feeds the IR into ConvolverNode.
	 * 			Note: the Reverb will not make any sound until [generate](#generate)
	 * 			has been invoked and resolved.
	 *
	 * 			Inspiration from [ReverbGen](https://github.com/adelespinasse/reverbGen).
	 * 			Copyright (c) 2014 Alan deLespinasse Apache 2.0 License.
	 *
	 *  @extends {Tone.Convolver}
	 *  @param {Time=} decay The amount of time it will reverberate for.
	 */
	Tone.Reverb = function(){

		var options = Tone.defaults(arguments, ["decay"], Tone.Reverb);
		Tone.Effect.call(this, options);

		/**
		 *  Convolver node
		 *  @type {ConvolverNode}
		 *  @private
		 */
		this._convolver = this.context.createConvolver();

		/**
		 * The duration of the reverb
		 * @type {Time}
		 */
		this.decay = options.decay;

		/**
		 * The amount of time before the reverb is fully
		 * ramped in.
		 * @type {Time}
		 */
		this.preDelay = options.preDelay;

		this.connectEffect(this._convolver);
	};

	Tone.extend(Tone.Reverb, Tone.Effect);

	/**
	 * The defaults
	 * @type {Object}
	 * @static
	 */
	Tone.Reverb.defaults = {
		"decay" : 1.5,
		"preDelay" : 0.01,
	};

	/**
	 * Generate the Impulse Response. Returns a promise while the IR is being
	 * generated.
	 * @return {Promise<Tone.Reverb>} Promise which returns this object.
	 */
	Tone.Reverb.prototype.generate = function(){
		return Tone.Offline(function(){
			//create a noise burst which decays over the duration
			var noiseL = new Tone.Noise();
			var noiseR = new Tone.Noise();
			var merge = new Tone.Merge();
			noiseL.connect(merge.left);
			noiseR.connect(merge.right);
			var gainNode = new Tone.Gain().toMaster();
			merge.connect(gainNode);
			noiseL.start(0);
			noiseR.start(0);
			//short fade in
			gainNode.gain.setValueAtTime(0, 0);
			gainNode.gain.linearRampToValueAtTime(1, this.preDelay);
			//decay
			gainNode.gain.exponentialApproachValueAtTime(0, this.preDelay, this.decay - this.preDelay);
		}.bind(this), this.decay).then(function(buffer){
			this._convolver.buffer = buffer.get();
			return this;
		}.bind(this));
	};

	/**
	 *  Clean up.
	 *  @return  {Tone.Reverb}  this
	 */
	Tone.Reverb.prototype.dispose = function(){
		Tone.Effect.prototype.dispose.call(this);
		this._convolver.disconnect();
		this._convolver = null;
		return this;
	};

	return Tone.Reverb;
});
