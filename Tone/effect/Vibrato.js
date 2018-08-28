define(["../core/Tone", "../effect/Effect", "../core/Delay", "../component/LFO"], function(Tone){

	"use strict";

	/**
	 *  @class A Vibrato effect composed of a Tone.Delay and a Tone.LFO. The LFO
	 *         modulates the delayTime of the delay, causing the pitch to rise
	 *         and fall. 
	 *  @extends {Tone.Effect}
	 *  @param {Frequency} frequency The frequency of the vibrato.
	 *  @param {NormalRange} depth The amount the pitch is modulated.
	 */
	Tone.Vibrato = function(){

		var options = Tone.defaults(arguments, ["frequency", "depth"], Tone.Vibrato);
		Tone.Effect.call(this, options);

		/**
		 *  The delay node used for the vibrato effect
		 *  @type {Tone.Delay}
		 *  @private
		 */
		this._delayNode = new Tone.Delay(0, options.maxDelay);

		/**
		 *  The LFO used to control the vibrato
		 *  @type {Tone.LFO}
		 *  @private
		 */
		this._lfo = new Tone.LFO({
			"type" : options.type,
			"min" : 0,
			"max" : options.maxDelay, 
			"frequency" : options.frequency,
			"phase" : -90 //offse the phase so the resting position is in the center
		}).start().connect(this._delayNode.delayTime);

		/**
		 *  The frequency of the vibrato
		 *  @type {Frequency}
		 *  @signal
		 */
		this.frequency = this._lfo.frequency;

		/**
		 *  The depth of the vibrato. 
		 *  @type {NormalRange}
		 *  @signal
		 */
		this.depth = this._lfo.amplitude;

		this.depth.value = options.depth;
		this._readOnly(["frequency", "depth"]);
		this.effectSend.chain(this._delayNode, this.effectReturn);
	};

	Tone.extend(Tone.Vibrato, Tone.Effect);

	/**
	 *  The defaults
	 *  @type  {Object}
	 *  @const
	 */
	Tone.Vibrato.defaults = {
		"maxDelay" : 0.005,
		"frequency" : 5,
		"depth" : 0.1,
		"type" : "sine"
	};

	/**
	 * Type of oscillator attached to the Vibrato.
	 * @memberOf Tone.Vibrato#
	 * @type {string}
	 * @name type
	 */
	Object.defineProperty(Tone.Vibrato.prototype, "type", {
		get : function(){
			return this._lfo.type;
		},
		set : function(type){
			this._lfo.type = type;
		}
	});

	/**
	 *  Clean up.
	 *  @returns {Tone.Vibrato} this
	 */
	Tone.Vibrato.prototype.dispose = function(){
		Tone.Effect.prototype.dispose.call(this);
		this._delayNode.dispose();
		this._delayNode = null;
		this._lfo.dispose();
		this._lfo = null;
		this._writable(["frequency", "depth"]);
		this.frequency = null;
		this.depth = null;
	};

	return Tone.Vibrato;
});
