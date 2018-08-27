define(["../core/Tone"], function(Tone){

	/**
	 *  @class Tone.TimeBase is a flexible encoding of time
	 *         which can be evaluated to and from a string.
	 *  @extends {Tone}
	 *  @param  {Time}  val    The time value as a number, string or object
	 *  @param  {String=}  units  Unit values
	 *  @example
	 * Tone.TimeBase(4, "n")
	 * Tone.TimeBase(2, "t")
	 * Tone.TimeBase("2t")
	 * Tone.TimeBase({"2t" : 2})
	 * Tone.TimeBase("2t") + Tone.TimeBase("4n");
	 */
	Tone.TimeBase = function(val, units){

		//allows it to be constructed with or without 'new'
		if (this instanceof Tone.TimeBase){

			/**
			 *  The value
			 *  @type  {Number|String|Tone.TimeBase}
			 *  @private
			 */
			this._val = val;

			/**
			 * The units
			 * @type {String?}
			 * @private
			 */
			this._units = units;

			//test if the value is a string representation of a number
			if (Tone.isUndef(this._units) && Tone.isString(this._val) &&
				// eslint-disable-next-line eqeqeq
				parseFloat(this._val) == this._val && this._val.charAt(0) !== "+"){
				this._val = parseFloat(this._val);
				this._units = this._defaultUnits;
			} else if (val && val.constructor === this.constructor){
				//if they're the same type, just copy values over
				this._val = val._val;
				this._units = val._units;
			} else if (val instanceof Tone.TimeBase){
				switch (this._defaultUnits){
					case "s" :
						this._val = val.toSeconds();
						break;
					case "i" :
						this._val = val.toTicks();
						break;
					case "hz" :
						this._val = val.toFrequency();
						break;
					case "midi" :
						this._val = val.toMidi();
						break;
					default :
						throw new Error("Unrecognized default units "+this._defaultUnits);
				}
			}

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
			regexp : /^(\d+)n(\.?)$/i,
			method : function(value, dot){
				value = parseInt(value);
				var scalar = dot === "." ? 1.5 : 1;
				if (value === 1){
					return this._beatsToUnits(this._getTimeSignature())*scalar;
				} else {
					return this._beatsToUnits(4 / value)*scalar;
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
			regexp : /^(\d+(?:\.\d+)?)s$/,
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
	 *  @type {String}
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
		return this.now();
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
		} else if (Tone.isString(this._val) && Tone.isUndef(this._units)){
			for (var units in this._expressions){
				if (this._expressions[units].regexp.test(this._val.trim())){
					this._units = units;
					break;
				}
			}
		} else if (Tone.isObject(this._val)){
			var total = 0;
			for (var typeName in this._val){
				var quantity = this._val[typeName];
				var time = (new this.constructor(typeName)).valueOf() * quantity;
				total += time;
			}
			return total;
		}
		if (Tone.isDefined(this._units)){
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
	 *  Return the value in seconds
	 *  @return {Seconds}
	 */
	Tone.TimeBase.prototype.toSeconds = function(){
		return this.valueOf();
	};

	/**
	 *  Return the value in hertz
	 *  @return {Frequency}
	 */
	Tone.TimeBase.prototype.toFrequency = function(){
		return 1 / this.toSeconds();
	};

	/**
	 *  Return the time in samples
	 *  @return  {Samples}
	 */
	Tone.TimeBase.prototype.toSamples = function(){
		return this.toSeconds() * this.context.sampleRate;
	};

	/**
	 *  Return the time in milliseconds.
	 *  @return  {Milliseconds}
	 */
	Tone.TimeBase.prototype.toMilliseconds = function(){
		return this.toSeconds() * 1000;
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
