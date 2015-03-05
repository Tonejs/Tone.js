define(["Tone/core/Tone", "Tone/effect/Effect", "Tone/component/LFO", "Tone/component/Panner"], function(Tone){

	"use strict";

	/**
	 *  @class AutoPanner is a Tone.Panner with an LFO connected to the pan amount
	 *
	 *  @constructor
	 *  @extends {Tone.Effect}
	 *  @param {number} [frequency=1] (optional) rate in HZ of the left-right pan
	 *  @example
	 *  var autoPanner = new Tone.AutoPanner("4n");
	 */
	Tone.AutoPanner = function(){

		var options = this.optionsObject(arguments, ["frequency"], Tone.AutoPanner.defaults);
		Tone.Effect.call(this, options);

		/**
		 *  the lfo which drives the panning
		 *  @type {Tone.LFO}
		 *  @private
		 */
		this._lfo = new Tone.LFO(options.frequency, 0, 1);

		/**
		 * The amount of panning between left and right. 
		 * 0 = always center. 1 = full range between left and right. 
		 * @type {Tone.Signal}
		 */
		this.amount = this._lfo.amplitude;

		/**
		 *  the panner node which does the panning
		 *  @type {Tone.Panner}
		 *  @private
		 */
		this._panner = new Tone.Panner();

		/**
		 * How fast the panner modulates
		 * @type {Tone.Signal}
		 */
		this.frequency = this._lfo.frequency;

		//connections
		this.connectEffect(this._panner);
		this._lfo.connect(this._panner.pan);
		this.type = options.type;
	};

	//extend Effect
	Tone.extend(Tone.AutoPanner, Tone.Effect);

	/**
	 *  defaults
	 *  @static
	 *  @type {Object}
	 */
	Tone.AutoPanner.defaults = {
		"frequency" : 1,
		"type" : "sine",
		"amount" : 1
	};
	
	/**
	 * Start the panner.
	 * @param {Tone.Time} [time=now] the panner begins.
	 * @returns {Tone.AutoPanner} `this`
	 */
	Tone.AutoPanner.prototype.start = function(time){
		this._lfo.start(time);
		return this;
	};

	/**
	 * Stop the panner.
	 * @param {Tone.Time} [time=now] the panner stops.
	 * @returns {Tone.AutoPanner} `this`
	 */
	Tone.AutoPanner.prototype.stop = function(time){
		this._lfo.stop(time);
		return this;
	};

	/**
	 * Sync the panner to the transport.
	 * @returns {Tone.AutoPanner} `this`
	 */
	Tone.AutoPanner.prototype.sync = function(){
		this._lfo.sync();
		return this;
	};

	/**
	 * Unsync the panner from the transport
	 * @returns {Tone.AutoPanner} `this`
	 */
	Tone.AutoPanner.prototype.unsync = function(){
		this._lfo.unsync();
		return this;
	};

	/**
	 * Type of oscillator attached to the AutoPanner.
	 * @memberOf Tone.AutoPanner#
	 * @type {string}
	 * @name type
	 */
	Object.defineProperty(Tone.AutoPanner.prototype, "type", {
		get : function(){
			return this._lfo.type;
		},
		set : function(type){
			this._lfo.type = type;
		}
	});

	/**
	 *  clean up
	 *  @returns {Tone.AutoPanner} `this`
	 */
	Tone.AutoPanner.prototype.dispose = function(){
		Tone.Effect.prototype.dispose.call(this);
		this._lfo.dispose();
		this._lfo = null;
		this._panner.dispose();
		this._panner = null;
		this.frequency = null;
		this.amount = null;
		return this;
	};

	return Tone.AutoPanner;
});
