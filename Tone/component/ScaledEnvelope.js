define(["Tone/core/Tone", "Tone/component/Envelope", "Tone/signal/Multiply", "Tone/signal/Add"], 
	function(Tone){

	"use strict";

	/**
	 *  @class An envelope which can be scaled to any range. 
	 *         Useful for applying an envelope to a filter
	 *
	 *  @extends {Tone.Envelope}
	 *  @constructor
	 *  @param {Tone.Time|Object=} attack
	 *  @param {Tone.Time=} decay
	 *  @param {number=} sustain 	a percentage (0-1) of the full amplitude
	 *  @param {Tone.Time=} release
	 */
	Tone.ScaledEnvelope = function(){

		//get all of the defaults
		var options = this.optionsObject(arguments, ["attack", "decay", "sustain", "release"], Tone.Envelope.defaults);
		Tone.Envelope.call(this, options);
		options = this.defaultArg(options, Tone.ScaledEnvelope.defaults);

		/**
		 *  the output min.
		 *  @type {number}
		 */
		this.min = options.min;

		/**
		 *  the output max.
		 *  @type {number}
		 */
		this.max = options.max;

		/**
		 *  multiply the outgoing signal the range
		 *  @type {Tone.Multiply}
		 *  @private
		 */
		this._mult = new Tone.Multiply(1);

		/**
		 *  add the minimum to the outgoing signal
		 *  @type {Tone.Add}
		 *  @private
		 */
		this._add = this.output = new Tone.Add(0);


		this.chain(this._sig, this._mult, this._add);
		//set the values initially
		this._setMinMax();
	};

	Tone.extend(Tone.ScaledEnvelope, Tone.Envelope);

	/**
	 *  the default parameters
	 *  @static
	 */
	Tone.ScaledEnvelope.defaults = {
		"min" : 0,
		"max" : 1,
	};

	/**
	 *  set all of the parameters in bulk
	 *  @param {Object} param the name of member as the key
	 *                        and the value as the value 
	 */
	Tone.ScaledEnvelope.prototype.set = function(params){
		if (!this.isUndef(params.min)) this.setMin(params.min);
		if (!this.isUndef(params.max)) this.setMax(params.max);
		Tone.Envelope.prototype.set.call(this, params);
	};

	/**
	 *  set the envelope max
	 *  @param {number} max
	 */
	Tone.ScaledEnvelope.prototype.setMax = function(max){
		this.max = max;
		this._setMinMax();
	};

	/**
	 *  set the envelope min
	 *  @param {number} min
	 */
	Tone.ScaledEnvelope.prototype.setMin = function(min){
		this.min = min;
		this._setMinMax();
	};

	/**
	 *  set the min and max values
	 *  @param {number} min
	 */
	Tone.ScaledEnvelope.prototype._setMinMax = function(){
		this._add.setValue(this.min);
		this._mult.setValue(this.max - this.min);
	};


	/**
	 *  clean up
	 */
	Tone.ScaledEnvelope.prototype.dispose = function(){
		Tone.Envelope.prototype.dispose.call(this);
		this._add.dispose();
		this._add = null;
		this._mult.dispose();
		this._mult = null;
	};

	return Tone.ScaledEnvelope;
});