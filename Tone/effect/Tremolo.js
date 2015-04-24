define(["Tone/core/Tone", "Tone/component/LFO", "Tone/effect/Effect"], function(Tone){

	"use strict";

	/**
	 *  @class A tremolo is a modulation in the amplitude of the incoming signal using an LFO. 
	 *         The type, frequency, and depth of the LFO is controllable. 
	 *
	 *  @extends {Tone.Effect}
	 *  @constructor
	 *  @param {Tone.Time} [frequency=10] The rate of the effect. 
	 *  @param {number} [depth=0.5] The depth of the wavering.
	 *  @example
	 *  var tremolo = new Tone.Tremolo(9, 0.75);
	 */
	Tone.Tremolo = function(){

		var options = this.optionsObject(arguments, ["frequency", "depth"], Tone.Tremolo.defaults);
		Tone.Effect.call(this, options);

		/**
		 *  The tremelo LFO
		 *  @type  {Tone.LFO}
		 *  @private
		 */
		this._lfo = new Tone.LFO(options.frequency, 1, 0);

		/**
		 *  Where the gain is multiplied
		 *  @type  {GainNode}
		 *  @private
		 */
		this._amplitude = this.context.createGain();

		/**
		 *  The frequency of the tremolo.	
		 *  @type  {Tone.Signal}
		 */
		this.frequency = this._lfo.frequency;

		/**
		 *  The depth of the effect.	
		 *  @type  {Tone.Signal}
		 */
		this.depth = this._lfo.amplitude;

		this._readOnly(["frequency", "depth"]);
		this.connectEffect(this._amplitude);
		this._lfo.connect(this._amplitude.gain);
		this.type = options.type;
	};

	Tone.extend(Tone.Tremolo, Tone.Effect);

	/**
	 *  @static
	 *  @const
	 *  @type {Object}
	 */
	Tone.Tremolo.defaults = {
		"frequency" : 10,
		"type" : "sine",
		"depth" : 0.5
	};

	/**
	 * Start the tremolo.
	 * @param {Tone.Time} [time=now] When the tremolo begins.
	 * @returns {Tone.Tremolo} `this`
	 */
	Tone.Tremolo.prototype.start = function(time){
		this._lfo.start(time);
		return this;
	};

	/**
	 * Stop the tremolo.
	 * @param {Tone.Time} [time=now] the tremolo stops.
	 * @returns {Tone.Tremolo} `this`
	 */
	Tone.Tremolo.prototype.stop = function(time){
		this._lfo.stop(time);
		return this;
	};

	/**
	 * Sync the effect to the transport.
	 * @param {Tone.Time} [delay=0] Delay time before starting the effect after the
	 *                              Transport has started. 
	 * @returns {Tone.AutoFilter} `this`
	 */
	Tone.Tremolo.prototype.sync = function(delay){
		this._lfo.sync(delay);
		return this;
	};

	/**
	 * Unsync the filter from the transport
	 * @returns {Tone.Tremolo} `this`
	 */
	Tone.Tremolo.prototype.unsync = function(){
		this._lfo.unsync();
		return this;
	};

	/**
	 * Type of oscillator attached to the Tremolo.
	 * @memberOf Tone.Tremolo#
	 * @type {string}
	 * @name type
	 */
	Object.defineProperty(Tone.Tremolo.prototype, "type", {
		get : function(){
			return this._lfo.type;
		},
		set : function(type){
			this._lfo.type = type;
		}
	});

	/**
	 *  clean up
	 *  @returns {Tone.Tremolo} `this`
	 */
	Tone.Tremolo.prototype.dispose = function(){
		Tone.Effect.prototype.dispose.call(this);
		this._writable(["frequency", "depth"]);
		this._lfo.dispose();
		this._lfo = null;
		this._amplitude.disconnect();
		this._amplitude = null;
		this.frequency = null;
		this.depth = null;
		return this;
	};

	return Tone.Tremolo;
});