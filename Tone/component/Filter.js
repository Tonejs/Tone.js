define(["Tone/core/Tone", "Tone/signal/Signal", "Tone/core/AudioNode"], function(Tone){

	"use strict";

	/**
	 *  @class  Tone.Filter is a filter which allows for all of the same native methods
	 *          as the [BiquadFilterNode](http://webaudio.github.io/web-audio-api/#the-biquadfilternode-interface).
	 *          Tone.Filter has the added ability to set the filter rolloff at -12
	 *          (default), -24 and -48.
	 *
	 *  @constructor
	 *  @extends {Tone.AudioNode}
	 *  @param {Frequency|Object} [frequency] The cutoff frequency of the filter.
	 *  @param {string=} type The type of filter.
	 *  @param {number=} rolloff The drop in decibels per octave after the cutoff frequency.
	 *                            3 choices: -12, -24, and -48
	 *  @example
	 *  var filter = new Tone.Filter(200, "highpass");
	 */
	Tone.Filter = function(){

		var options = Tone.defaults(arguments, ["frequency", "type", "rolloff"], Tone.Filter);
		Tone.AudioNode.call(this);
		this.createInsOuts(1, 1);

		/**
		 *  the filter(s)
		 *  @type {Array}
		 *  @private
		 */
		this._filters = [];

		/**
		 *  The cutoff frequency of the filter.
		 *  @type {Frequency}
		 *  @signal
		 */
		this.frequency = new Tone.Signal(options.frequency, Tone.Type.Frequency);

		/**
		 *  The detune parameter
		 *  @type {Cents}
		 *  @signal
		 */
		this.detune = new Tone.Signal(0, Tone.Type.Cents);

		/**
		 *  The gain of the filter, only used in certain filter types
		 *  @type {Number}
		 *  @signal
		 */
		this.gain = new Tone.Signal({
			"value" : options.gain,
			"convert" : false
		});

		/**
		 *  The Q or Quality of the filter
		 *  @type {Positive}
		 *  @signal
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
		this._readOnly(["detune", "frequency", "gain", "Q"]);
	};

	Tone.extend(Tone.Filter, Tone.AudioNode);

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
				throw new TypeError("Tone.Filter: invalid type "+type);
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
	 * Only accepts the values -12, -24, -48 and -96.
	 * @memberOf Tone.Filter#
	 * @type {number}
	 * @name rolloff
	 */
	Object.defineProperty(Tone.Filter.prototype, "rolloff", {
		get : function(){
			return this._rolloff;
		},
		set : function(rolloff){
			rolloff = parseInt(rolloff, 10);
			var possibilities = [-12, -24, -48, -96];
			var cascadingCount = possibilities.indexOf(rolloff);
			//check the rolloff is valid
			if (cascadingCount === -1){
				throw new RangeError("Tone.Filter: rolloff can only be -12, -24, -48 or -96");
			}
			cascadingCount += 1;
			this._rolloff = rolloff;
			//first disconnect the filters and throw them away
			this.input.disconnect();
			for (var i = 0; i < this._filters.length; i++){
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
			Tone.connectSeries.apply(Tone, connectionChain);
		}
	});

	/**
	 *  Clean up.
	 *  @return {Tone.Filter} this
	 */
	Tone.Filter.prototype.dispose = function(){
		Tone.AudioNode.prototype.dispose.call(this);
		for (var i = 0; i < this._filters.length; i++){
			this._filters[i].disconnect();
			this._filters[i] = null;
		}
		this._filters = null;
		this._writable(["detune", "frequency", "gain", "Q"]);
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
