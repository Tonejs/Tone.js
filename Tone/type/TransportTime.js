define(["Tone/core/Tone", "Tone/type/Time"], function (Tone) {

	/**
	 *  @extends {Tone.Time}
	 */
	Tone.TransportTime = function(val, units){
		if (this instanceof Tone.TransportTime){
			
			Tone.Time.call(this, val, units);

		} else {
			return new Tone.TransportTime(val, units);
		}
	};

	Tone.extend(Tone.TransportTime, Tone.Time);

	//clone the expressions so that 
	//we can add more without modifying the original
	Tone.TransportTime.prototype._unaryExpressions = Object.create(Tone.Time.prototype._unaryExpressions);

	/**
	 *  Adds an additional unary expression
	 *  which quantizes values to the next subdivision
	 *  @type {Object}
	 *  @private
	 */
	Tone.TransportTime.prototype._unaryExpressions.quantize = {
		regexp : /^@/,
		method : function(rh){
			var subdivision = rh();
			var multiple = Math.ceil(Tone.Transport.ticks / subdivision);
			return multiple * subdivision;
		}
	};

	/**
	 *  @override
	 *  The value of a beat in ticks.
	 *  @param {Number} beats
	 *  @return  {Number}
	 *  @private
	 */
	Tone.TransportTime.prototype._beatsToUnits = function(beats){
		return Tone.Transport.PPQ * beats;
	};

	/**
	 *  @override
	 *  @param {Ticks} ticks
	 *  @return  {Number}
	 *  @private
	 */
	Tone.TransportTime.prototype._ticksToUnits = function(ticks){
		return ticks;
	};

	/**
	 *  Returns the value of a second in the current units
	 *  @param {Seconds} seconds
	 *  @return  {Number}
	 *  @private
	 */
	Tone.TransportTime.prototype._secondsToUnits = function(seconds){
		var quarterTime = (60 / Tone.Transport.bpm.value);
		var quarters = seconds / quarterTime;
		return Math.floor(quarters * Tone.Transport.PPQ);
	};

	/**
	 *  Evaluate the time expression. Returns values in ticks
	 *  @return {Ticks}
	 */
	Tone.TransportTime.prototype.eval = function(){
		return Math.floor(this._expr());
	};

	/**
	 *  The current time along the Transport
	 *  @return {Ticks} The Transport's position in ticks. 
	 */
	Tone.TransportTime.prototype.now = function(){
		return Tone.Transport.ticks;
	};

	/**
	 *  Return the time in ticks.
	 *  @return  {Ticks}
	 */
	Tone.TransportTime.prototype.toTicks = function(){
		return this.eval();
	};

	/**
	 *  Return the time in samples
	 *  @return  {Samples}  
	 */
	Tone.TransportTime.prototype.toSamples = function(){
		return this.toSeconds() * this.context.sampleRate;
	};

	/**
	 *  Return the time as a frequency value
	 *  @return  {Frequency} 
	 */
	Tone.TransportTime.prototype.toFrequency = function(){
		return 1/this.toSeconds();
	};

	/**
	 *  Return the time in seconds.
	 *  @return  {Seconds} 
	 */
	Tone.TransportTime.prototype.toSeconds = function(){
		var beatTime = 60/Tone.Transport.bpm.value;
		var tickTime = beatTime / Tone.Transport.PPQ;
		return this.eval() * tickTime;
	};

	return Tone.TransportTime;
});