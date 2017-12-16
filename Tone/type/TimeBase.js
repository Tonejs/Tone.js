define(["Tone/core/Tone"], function (Tone) {

	/**
	 *  @class Tone.TimeBase is a flexible encoding of time
	 *         which can be evaluated to and from a string.
	 *  @extends {Tone}
	 *  @param  {Time}  val    The time value as a number or string
	 *  @param  {String=}  units  Unit values
	 *  @example
	 * Tone.TimeBase(4, "n")
	 * Tone.TimeBase(2, "t")
	 * Tone.TimeBase("2t")
	 * Tone.TimeBase("2t") + Tone.TimeBase("4n");
	 */
	Tone.TimeBase = function(val, units){

		//allows it to be constructed with or without 'new'
		if (this instanceof Tone.TimeBase) {

			/**
			 *  The value
			 *  @type  {Number|String|Tone.TimeBase}
			 *  @private
			 */
			this._val = val;

			/**
			 * The units
			 * @type {String?}
			 */
			this._units = units;

		} else {

			return new Tone.TimeBase(val, units);
		}
	};

	Tone.extend(Tone.TimeBase);

	///////////////////////////////////////////////////////////////////////////
	//	ABSTRACT SYNTAX TREE PARSER
	///////////////////////////////////////////////////////////////////////////

	/**
	 *  All the primary expressions.
	 *  @private
	 *  @type  {Object}
	 */
	Tone.TimeBase.prototype._expressions = {
		"n" : {
			regexp : /^(\d+)n$/i,
			method : function(value){
				value = parseInt(value);
				if (value === 1){
					return this._beatsToUnits(this._getTimeSignature());
				} else {
					return this._beatsToUnits(4 / value);
				}
			}
		},
		"t" : {
			regexp : /^(\d+)t$/i,
			method : function(value){
				value = parseInt(value);
				return this._beatsToUnits(8 / (parseInt(value) * 3));
			}
		},
		"m" : {
			regexp : /^(\d+)m$/i,
			method : function(value){
				return this._beatsToUnits(parseInt(value) * this._getTimeSignature());
			}
		},
		"i" : {
			regexp : /^(\d+)i$/i,
			method : function(value){
				return this._ticksToUnits(parseInt(value));
			}
		},
		"hz" : {
			regexp : /^(\d+(?:\.\d+)?)hz$/i,
			method : function(value){
				return this._frequencyToUnits(parseFloat(value));
			}
		},
		"tr" : {
			regexp : /^(\d+(?:\.\d+)?):(\d+(?:\.\d+)?):?(\d+(?:\.\d+)?)?$/,
			method : function(m, q, s){
				var total = 0;
				if (m && m !== "0"){
					total += this._beatsToUnits(this._getTimeSignature() * parseFloat(m));
				}
				if (q && q !== "0"){
					total += this._beatsToUnits(parseFloat(q));
				}
				if (s && s !== "0"){
					total += this._beatsToUnits(parseFloat(s) / 4);
				}
				return total;
			}
		},
		"s" : {
			regexp : /^(\d+(?:\.\d+)?s)$/,
			method : function(value){
				return this._secondsToUnits(parseFloat(value));
			}
		},
		"samples" : {
			regexp : /^(\d+)samples$/,
			method : function(value){
				return parseInt(value) / this.context.sampleRate;
			}
		},
		"default" : {
			regexp : /^(\d+(?:\.\d+)?)$/,
			method : function(value){
				return this._expressions[this._defaultUnits].method.call(this, value);
			}
		}
	};

	/**
	 *  The default units if none are given.
	 *  @private
	 */
	Tone.TimeBase.prototype._defaultUnits = "s";

	///////////////////////////////////////////////////////////////////////////
	//	TRANSPORT FALLBACKS
	///////////////////////////////////////////////////////////////////////////

	/**
	 * Return the bpm, or 120 if Transport is not available
	 * @type {Number}
	 * @private
	 */
	Tone.TimeBase.prototype._getBpm = function(){
		if (Tone.Transport){
			return Tone.Transport.bpm.value;
		} else {
			return 120;
		}
	};

	/**
	 * Return the timeSignature or 4 if Transport is not available
	 * @type {Number}
	 * @private
	 */
	Tone.TimeBase.prototype._getTimeSignature = function(){
		if (Tone.Transport){
			return Tone.Transport.timeSignature;
		} else {
			return 4;
		}
	};

	/**
	 * Return the PPQ or 192 if Transport is not available
	 * @type {Number}
	 * @private
	 */
	Tone.TimeBase.prototype._getPPQ = function(){
		if (Tone.Transport){
			return Tone.Transport.PPQ;
		} else {
			return 192;
		}
	};

	/**
	 * Return the current time in whichever context is relevant
	 * @type {Number}
	 * @private
	 */
	Tone.TimeBase.prototype._now = function(){
		return Tone.now();
	};

	///////////////////////////////////////////////////////////////////////////
	//	UNIT CONVERSIONS
	///////////////////////////////////////////////////////////////////////////

	/**
	 *  Returns the value of a frequency in the current units
	 *  @param {Frequency} freq
	 *  @return  {Number}
	 *  @private
	 */
	Tone.TimeBase.prototype._frequencyToUnits = function(freq){
		return 1/freq;
	};

	/**
	 *  Return the value of the beats in the current units
	 *  @param {Number} beats
	 *  @return  {Number}
	 *  @private
	 */
	Tone.TimeBase.prototype._beatsToUnits = function(beats){
		return (60 / this._getBpm()) * beats;
	};

	/**
	 *  Returns the value of a second in the current units
	 *  @param {Seconds} seconds
	 *  @return  {Number}
	 *  @private
	 */
	Tone.TimeBase.prototype._secondsToUnits = function(seconds){
		return seconds;
	};

	/**
	 *  Returns the value of a tick in the current time units
	 *  @param {Ticks} ticks
	 *  @return  {Number}
	 *  @private
	 */
	Tone.TimeBase.prototype._ticksToUnits = function(ticks){
		return ticks * (this._beatsToUnits(1) / this._getPPQ());
	};

	/**
	 * With no arguments, return 'now'
	 *  @return  {Number}
	 *  @private
	 */
	Tone.TimeBase.prototype._noArg = function(){
		return this._now();
	};

	///////////////////////////////////////////////////////////////////////////
	//	EXPRESSIONS
	///////////////////////////////////////////////////////////////////////////

	/**
	 *  Evaluate the time value. Returns the time
	 *  in seconds.
	 *  @return  {Seconds}
	 */
	Tone.TimeBase.prototype.valueOf = function(){
		if (Tone.isUndef(this._val)){
			return this._noArg();
		} else if (this._val instanceof Tone.TimeBase){
			return this._val.valueOf();
		} else if (Tone.isString(this._val) && Tone.isUndef(this._units)){
			for (var units in this._expressions){
				if (this._expressions[units].regexp.test(this._val.trim())){
					this._units = units;
					break;
				}
			}
		}
		if (!Tone.isUndef(this._units)){
			var expr = this._expressions[this._units];
			var matching = this._val.toString().trim().match(expr.regexp);
			if (matching){
				return expr.method.apply(this, matching.slice(1));
			} else {
				return expr.method.call(this, parseFloat(this._val));
			}
		} else {
			return this._val;
		}
	};

	/**
	 *  Clean up
	 *  @return {Tone.TimeBase} this
	 */
	Tone.TimeBase.prototype.dispose = function(){
		this._val = null;
		this._units = null;
	};

	return Tone.TimeBase;
});
