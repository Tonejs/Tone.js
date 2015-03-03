define(["Tone/core/Tone", "Tone/signal/Signal"], function(Tone){

	"use strict";

	/**
	 *  @class  Filter object which allows for all of the same native methods
	 *          as the BiquadFilter (with AudioParams implemented as Tone.Signals)
	 *          but adds the ability to set the filter rolloff at -12 (default), 
	 *          -24 and -48. 
	 *
	 *  @constructor
	 *  @extends {Tone}
	 *  @param {number|Object} [freq=350] the frequency
	 *  @param {string} [type=lowpass] the type of filter
	 *  @param {number} [rolloff=-12] the rolloff which is the drop per octave. 
	 *                                 3 choices: -12, -24, and -48
	 *  @example
	 *  var filter = new Tone.Filter(200, "highpass");
	 */
	Tone.Filter = function(){
		Tone.call(this);

		var options = this.optionsObject(arguments, ["frequency", "type", "rolloff"], Tone.Filter.defaults);

		/**
		 *  the filter(s)
		 *  @type {Array.<BiquadFilterNode>}
		 *  @private
		 */
		this._filters = [];

		/**
		 *  the frequency of the filter
		 *  @type {Tone.Signal}
		 */
		this.frequency = new Tone.Signal(options.frequency, Tone.Signal.Units.Frequency);

		/**
		 *  the detune parameter
		 *  @type {Tone.Signal}
		 */
		this.detune = new Tone.Signal(0);

		/**
		 *  the gain of the filter, only used in certain filter types
		 *  @type {AudioParam}
		 */
		this.gain = new Tone.Signal(options.gain, Tone.Signal.Units.Decibels);

		/**
		 *  the Q or Quality of the filter
		 *  @type {Tone.Signal}
		 */
		this.Q = new Tone.Signal(options.Q);

		/**
		 *  the type of the filter
		 *  @type {string}
		 *  @private
		 */
		this._type = options.type;

		/**
		 *  the rolloff value of the filter
		 *  @type {number}
		 *  @private
		 */
		this._rolloff = options.rolloff;

		//set the rolloff;
		this.rolloff = options.rolloff;
	};

	Tone.extend(Tone.Filter);

	/**
	 *  the default parameters
	 *
	 *  @static
	 *  @type {Object}
	 */
	Tone.Filter.defaults = {
		"type" : "lowpass",
		"frequency" : 350,
		"rolloff" : -12,
		"Q" : 1,
		"gain" : 0,
	};

	/**
	 * The type of the filter. Types: "lowpass", "highpass", 
	 * "bandpass", "lowshelf", "highshelf", "notch", "allpass", or "peaking". 
	 * @memberOf Tone.Filter#
	 * @type {string}
	 * @name type
	 */
	Object.defineProperty(Tone.Filter.prototype, "type", {
		get : function(){
			return this._type;
		},
		set : function(type){
			var types = ["lowpass", "highpass", "bandpass", "lowshelf", "highshelf", "notch", "allpass", "peaking"];
			if (types.indexOf(type)=== -1){
				throw new TypeError("Tone.Filter does not have filter type "+type);
			}
			this._type = type;
			for (var i = 0; i < this._filters.length; i++){
				this._filters[i].type = type;
			}
		}
	});

	/**
	 * The rolloff of the filter which is the drop in db
	 * per octave. Implemented internally by cascading filters.
	 * Only accepts the values -12, -24, and -48.
	 * @memberOf Tone.Filter#
	 * @type {number}
	 * @name rolloff
	 */
	Object.defineProperty(Tone.Filter.prototype, "rolloff", {
		get : function(){
			return this._rolloff;
		},
		set : function(rolloff){
			var cascadingCount = Math.log(rolloff / -12) / Math.LN2 + 1;
			//check the rolloff is valid
			if (cascadingCount % 1 !== 0){
				throw new RangeError("Filter rolloff can only be -12, -24, or -48");
			}
			this._rolloff = rolloff;
			//first disconnect the filters and throw them away
			this.input.disconnect();
			for (var i = 0; i < this._filters.length; i++) {
				this._filters[i].disconnect();
				this._filters[i] = null;
			}
			this._filters = new Array(cascadingCount);
			for (var count = 0; count < cascadingCount; count++){
				var filter = this.context.createBiquadFilter();
				filter.type = this._type;
				this.frequency.connect(filter.frequency);
				this.detune.connect(filter.detune);
				this.Q.connect(filter.Q);
				this.gain.connect(filter.gain);
				this._filters[count] = filter;
			}
			//connect them up
			var connectionChain = [this.input].concat(this._filters).concat([this.output]);
			this.connectSeries.apply(this, connectionChain);
		}
	});

	/**
	 *  clean up
	 *  @return {Tone.Filter} `this`
	 */
	Tone.Filter.prototype.dispose = function(){
		Tone.prototype.dispose.call(this);
		for (var i = 0; i < this._filters.length; i++) {
			this._filters[i].disconnect();
			this._filters[i] = null;
		}
		this._filters = null;
		this.frequency.dispose();
		this.Q.dispose();
		this.frequency = null;
		this.Q = null;
		this.detune.dispose();
		this.detune = null;
		this.gain.dispose();
		this.gain = null;
		return this;
	};

	return Tone.Filter;
});