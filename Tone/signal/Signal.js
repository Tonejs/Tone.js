define(["Tone/core/Tone", "Tone/signal/WaveShaper"], function(Tone){

	"use strict";

	/**
	 *  @class  Constant audio-rate signal.
	 *          Tone.Signal is a core component which allows for sample-accurate 
	 *          synchronization of many components. Tone.Signal can be scheduled 
	 *          with all of the functions available to AudioParams
	 *
	 *  @constructor
	 *  @extends {Tone.SignalBase}
	 *  @param {number|AudioParam} [value=0] initial value or the AudioParam to control
	 *                                       note that the signal has no output
	 *                                       if an AudioParam is passed in.
	 *  @param {Tone.Signal.Unit} [units=Number] unit the units the signal is in
	 *  @example
	 *  var signal = new Tone.Signal(10);
	 */
	Tone.Signal = function(value, units){

		/**
		 * the units the signal is in
		 * @type {Tone.Signal.Type}
		 */
		this.units = this.defaultArg(units, Tone.Signal.Units.Number);

		/**
		 * The node where the constant signal value is scaled.
		 * @type {AudioParam}
		 * @private
		 */
		this.output = this._scaler = this.context.createGain();

		/**
		 * The node where the value is set.
		 * @type {AudioParam}
		 * @private
		 */
		this.input = this._value = this._scaler.gain;

		if (value instanceof AudioParam){
			this._scaler.connect(value);
			//zero out the value
			value.value = 0;
		} else {
			this.value = this.defaultArg(value, Tone.Signal.defaults.value);
		}

		//connect the constant 1 output to the node output
		Tone.Signal._constant.chain(this._scaler);
	};

	Tone.extend(Tone.Signal, Tone.SignalBase);

	/**
	 *  The default values
	 *  @type  {Object}
	 *  @static
	 *  @const
	 */
	Tone.Signal.defaults = {
		"value" : 0
	};

	/**
	 * The value of the signal. 
	 * @memberOf Tone.Signal#
	 * @type {Tone.Time|Tone.Frequency|number}
	 * @name value
	 */
	Object.defineProperty(Tone.Signal.prototype, "value", {
		get : function(){
			return this._toUnits(this._value.value);
		},
		set : function(value){
			var convertedVal = this._fromUnits(value);
			//is this what you want?
			this.cancelScheduledValues(0);
			this._value.value = convertedVal;
		}
	});

	/**
	 * @private
	 * @param  {Tone.Time|Tone.Volume|Tone.Frequency|number|undefined} val the value to convert
	 * @return {number}     the number which the value should be set to
	 */
	Tone.Signal.prototype._fromUnits = function(val){
		switch(this.units){
			case Tone.Signal.Units.Time: 
				return this.toSeconds(val);
			case Tone.Signal.Units.Frequency: 
				return this.toFrequency(val);
			case Tone.Signal.Units.Decibels: 
				return this.dbToGain(val);
			case Tone.Signal.Units.Normal: 
				return Math.min(Math.max(val, 0), 1);
			case Tone.Signal.Units.Audio: 
				return Math.min(Math.max(val, -1), 1);
			default:
				return val;
		}
	};

	/**
	 * convert to the desired units
	 * @private
	 * @param  {number} val the value to convert
	 * @return {number}
	 */
	Tone.Signal.prototype._toUnits = function(val){
		switch(this.units){
			case Tone.Signal.Units.Decibels: 
				return this.gainToDb(val);
			default:
				return val;
		}
	};

	/**
	 *  Schedules a parameter value change at the given time.
	 *  @param {number}		value 
	 *  @param {Tone.Time}  time 
	 *  @returns {Tone.Signal} `this`
	 */
	Tone.Signal.prototype.setValueAtTime = function(value, time){
		value = this._fromUnits(value);
		this._value.setValueAtTime(value, this.toSeconds(time));
		return this;
	};

	/**
	 *  Creates a schedule point with the current value at the current time.
	 *
	 *  @param {number=} now (optionally) pass the now value in
	 *  @returns {Tone.Signal} `this`
	 */
	Tone.Signal.prototype.setCurrentValueNow = function(now){
		now = this.defaultArg(now, this.now());
		var currentVal = this._value.value;
		this.cancelScheduledValues(now);
		this._value.setValueAtTime(currentVal, now);
		return this;
	};

	/**
	 *  Schedules a linear continuous change in parameter value from the 
	 *  previous scheduled parameter value to the given value.
	 *  
	 *  @param  {number} value   
	 *  @param  {Tone.Time} endTime 
	 *  @returns {Tone.Signal} `this`
	 */
	Tone.Signal.prototype.linearRampToValueAtTime = function(value, endTime){
		value = this._fromUnits(value);
		this._value.linearRampToValueAtTime(value, this.toSeconds(endTime));
		return this;
	};

	/**
	 *  Schedules an exponential continuous change in parameter value from 
	 *  the previous scheduled parameter value to the given value.
	 *  
	 *  @param  {number} value   
	 *  @param  {Tone.Time} endTime 
	 *  @returns {Tone.Signal} `this`
	 */
	Tone.Signal.prototype.exponentialRampToValueAtTime = function(value, endTime){
		value = this._fromUnits(value);
		//can't go below a certain value
		value = Math.max(0.00001, value);
		this._value.exponentialRampToValueAtTime(value, this.toSeconds(endTime));
		return this;
	};

	/**
	 *  Schedules an exponential continuous change in parameter value from 
	 *  the current time and current value to the given value.
	 *  
	 *  @param  {number} value   
	 *  @param  {Tone.Time} rampTime the time that it takes the 
	 *                               value to ramp from it's current value
	 *  @returns {Tone.Signal} `this`
	 *  @example
	 *  //exponentially ramp to the value 2 over 4 seconds. 
	 *  signal.exponentialRampToValueNow(2, 4);
	 */
	Tone.Signal.prototype.exponentialRampToValueNow = function(value, rampTime ){
		var now = this.now();
		this.setCurrentValueNow(now);
		this.exponentialRampToValueAtTime(value, now + this.toSeconds(rampTime ));
		return this;
	};

	/**
	 *  Schedules an linear continuous change in parameter value from 
	 *  the current time and current value to the given value at the given time.
	 *  
	 *  @param  {number} value   
	 *  @param  {Tone.Time} rampTime the time that it takes the 
	 *                               value to ramp from it's current value
	 *  @returns {Tone.Signal} `this`
	 *  @example
	 *  //linearly ramp to the value 4 over 3 seconds. 
	 *  signal.linearRampToValueNow(4, 3);
	 */
	Tone.Signal.prototype.linearRampToValueNow = function(value, rampTime){
		var now = this.now();
		this.setCurrentValueNow(now);
		this.linearRampToValueAtTime(value, now + this.toSeconds(rampTime));
		return this;
	};

	/**
	 *  Start exponentially approaching the target value at the given time with
	 *  a rate having the given time constant.
	 *  @param {number} value        
	 *  @param {Tone.Time} startTime    
	 *  @param {number} timeConstant 
	 *  @returns {Tone.Signal} `this`
	 */
	Tone.Signal.prototype.setTargetAtTime = function(value, startTime, timeConstant){
		value = this._fromUnits(value);
		this._value.setTargetAtTime(value, this.toSeconds(startTime), timeConstant);
		return this;
	};

	/**
	 *  Sets an array of arbitrary parameter values starting at the given time
	 *  for the given duration.
	 *  	
	 *  @param {Array<number>} values    
	 *  @param {Tone.Time} startTime 
	 *  @param {Tone.Time} duration  
	 *  @returns {Tone.Signal} `this`
	 */
	Tone.Signal.prototype.setValueCurveAtTime = function(values, startTime, duration){
		for (var i = 0; i < values.length; i++){
			values[i] = this._fromUnits(values[i]);
		}
		this._value.setValueCurveAtTime(values, this.toSeconds(startTime), this.toSeconds(duration));
		return this;
	};

	/**
	 *  Cancels all scheduled parameter changes with times greater than or 
	 *  equal to startTime.
	 *  
	 *  @param  {Tone.Time} startTime
	 *  @returns {Tone.Signal} `this`
	 */
	Tone.Signal.prototype.cancelScheduledValues = function(startTime){
		this._value.cancelScheduledValues(this.toSeconds(startTime));
		return this;
	};

	/**
	 *  Ramps to the given value over the duration of the rampTime. 
	 *  Automatically selects the best ramp type (exponential or linear)
	 *  depending on the `units` of the signal
	 *  
	 *  @param  {number} value   
	 *  @param  {Tone.Time} rampTime the time that it takes the 
	 *                               value to ramp from it's current value
	 *  @returns {Tone.Signal} `this`
	 *  @example
	 *  //ramp to the value either linearly or exponentially 
	 *  //depending on the "units" value of the signal
	 *  signal.rampTo(0, 10);
	 */
	Tone.Signal.prototype.rampTo = function(value, rampTime){
		rampTime = this.defaultArg(rampTime, 0);
		if (this.units === Tone.Signal.Units.Frequency || this.units === Tone.Signal.Units.BPM){
			this.exponentialRampToValueNow(value, rampTime);
		} else {
			this.linearRampToValueNow(value, rampTime);
		}
		return this;
	};

	/**
	 *  dispose and disconnect
	 *  @returns {Tone.Signal} `this`
	 */
	Tone.Signal.prototype.dispose = function(){
		Tone.prototype.dispose.call(this);
		this._value = null;
		this._scaler = null;
		return this;
	};

	/**
	 * The units the Signal is in
	 * @enum {string}
	 */
	Tone.Signal.Units = {
		/** The default type. */
		Number : "number",
		/** Tone.Time will be converted into seconds. */
		Time : "time",
		/** Tone.Frequency will be converted into hertz. */
		Frequency : "frequency",
		/** A Gain value. */
		Gain : "gain",
		/** Within normal range [0,1]. */
		Normal : "normal",
		/** Within normal range [-1,1]. */
		Audio : "audio",
		/** In decibels. */
		Decibels : "db",
		/** In half-step increments, i.e. 12 is an octave above the root. */
		Interval : "interval",
		/** Beats per minute. */
		BPM : "bpm"
	};

	///////////////////////////////////////////////////////////////////////////
	//	STATIC
	///////////////////////////////////////////////////////////////////////////

	/**
	 *  the constant signal generator
	 *  @static
	 *  @private
	 *  @const
	 *  @type {OscillatorNode}
	 */
	Tone.Signal._generator = null;

	/**
	 *  the signal generator waveshaper. makes the incoming signal
	 *  only output 1 for all inputs.
	 *  @static
	 *  @private
	 *  @const
	 *  @type {Tone.WaveShaper}
	 */
	Tone.Signal._constant = null;

	/**
	 *  initializer function
	 */
	Tone._initAudioContext(function(audioContext){
		Tone.Signal._generator = audioContext.createOscillator();
		Tone.Signal._constant = new Tone.WaveShaper([1,1]);
		Tone.Signal._generator.connect(Tone.Signal._constant);
		Tone.Signal._generator.start(0);
		Tone.Signal._generator.noGC();
	});

	return Tone.Signal;
});