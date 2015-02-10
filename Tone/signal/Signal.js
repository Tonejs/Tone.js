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
	 */
	Tone.Signal = function(value, units){

		/**
		 *  scales the constant output to the desired output
		 *  @type {GainNode}
		 *  @private
		 */
		this._scalar = this.context.createGain();

		/**
		 *  the ratio of the this value to the control signal value
		 *
		 *  @private
		 *  @type {number}
		 */
		this._syncRatio = 1;

		/**
		 * the units the signal is in
		 * @type {Tone.Signal.Type}
		 */
		this.units = this.defaultArg(units, Tone.Signal.Units.Number);

		var destination;
		if (value instanceof AudioParam){
			destination = value;
			destination.value = 0;
		} else {
			destination = this.context.createGain();
			this.value = this.defaultArg(value, 0);
		}

		/**
		 *  @type {GainNode|AudioParam}
		 */
		this.input = this.output = destination;

		//connect the constant 1 output to the node output
		Tone.Signal._constant.chain(this._scalar, this.output);
	};

	Tone.extend(Tone.Signal, Tone.SignalBase);

	/**
	 * The value of the signal. 
	 * @memberOf Tone.Signal#
	 * @type {Tone.Time|Tone.Frequency|number}
	 * @name value
	 */
	Object.defineProperty(Tone.Signal.prototype, "value", {
		get : function(){
			return this._toUnits(this._scalar.gain.value);
		},
		set : function(value){
			var convertedVal = this._fromUnits(value);
			convertedVal *= this._syncRatio;
			this._scalar.gain.value = convertedVal;
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
	 *  
	 *  @param {number}		value 
	 *  @param {Tone.Time}  time 
	 *  @returns {Tone.Signal} `this`
	 */
	Tone.Signal.prototype.setValueAtTime = function(value, time){
		value = this._fromUnits(value);
		value *= this._syncRatio;
		this._scalar.gain.setValueAtTime(value, this.toSeconds(time));
		return this;
	};

	/**
	 *  creates a schedule point with the current value at the current time
	 *
	 *  @param {number=} now (optionally) pass the now value in
	 *  @returns {Tone.Signal} `this`
	 */
	Tone.Signal.prototype.setCurrentValueNow = function(now){
		now = this.defaultArg(now, this.now());
		var currentVal = this.value;
		this.cancelScheduledValues(now);
		this._scalar.gain.setValueAtTime(currentVal, now);
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
		value *= this._syncRatio;
		this._scalar.gain.linearRampToValueAtTime(value, this.toSeconds(endTime));
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
		value *= this._syncRatio;
		//can't go below a certain value
		value = Math.max(0.00001, value);
		this._scalar.gain.exponentialRampToValueAtTime(value, this.toSeconds(endTime));
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
	 */
	Tone.Signal.prototype.exponentialRampToValueNow = function(value, rampTime ){
		value = this._fromUnits(value);
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
	 */
	Tone.Signal.prototype.linearRampToValueNow = function(value, rampTime){
		value = this._fromUnits(value);
		var now = this.now();
		this.setCurrentValueNow(now);
		value *= this._syncRatio;
		this._scalar.gain.linearRampToValueAtTime(value, now + this.toSeconds(rampTime));
		return this;
	};

	/**
	 *  Start exponentially approaching the target value at the given time with
	 *  a rate having the given time constant.
	 *  	
	 *  @param {number} value        
	 *  @param {Tone.Time} startTime    
	 *  @param {number} timeConstant 
	 *  @returns {Tone.Signal} `this`
	 */
	Tone.Signal.prototype.setTargetAtTime = function(value, startTime, timeConstant){
		value = this._fromUnits(value);
		value *= this._syncRatio;
		this._scalar.gain.setTargetAtTime(value, this.toSeconds(startTime), timeConstant);
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
			values[i] *= this._syncRatio;
		}
		this._scalar.gain.setValueCurveAtTime(values, this.toSeconds(startTime), this.toSeconds(duration));
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
		this._scalar.gain.cancelScheduledValues(this.toSeconds(startTime));
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
	 */
	Tone.Signal.prototype.rampTo = function(value, rampTime){
		rampTime = this.defaultArg(rampTime, 0);
		if (this.units === Tone.Signal.Units.Frequency){
			this.exponentialRampToValueNow(value, rampTime);
		} else {
			this.linearRampToValueNow(value, rampTime);
		}
		return this;
	};

	/**
	 *  Sync this to another signal and it will always maintain the 
	 *  ratio between the two signals until it is unsynced
	 *
	 *  Signals can only be synced to one other signal. while syncing, 
	 *  if a signal's value is changed, the new ratio between the signals
	 *  is maintained as the syncing signal is changed. 
	 *  
	 *  @param  {Tone.Signal} signal to sync to
	 *  @param {number=} ratio optionally pass in the ratio between 
	 *                         the two signals, otherwise it will be computed
	 *  @returns {Tone.Signal} `this`
	 */
	Tone.Signal.prototype.sync = function(signal, ratio){
		if (ratio){
			this._syncRatio = ratio;
		} else {
			//get the sync ratio
			if (signal.value !== 0){
				this._syncRatio = this.value / signal.value;
			} else {
				this._syncRatio = 0;
			}
		}
		//make a new scalar which is not connected to the constant signal
		this._scalar.disconnect();
		this._scalar = this.context.createGain();
		this.connectSeries(signal, this._scalar, this.output);
		//set it ot the sync ratio
		this._scalar.gain.value = this._syncRatio;
		return this;
	};

	/**
	 *  unbind the signal control
	 *
	 *  will leave the signal value as it was without the influence of the control signal
	 *  @returns {Tone.Signal} `this`
	 */
	Tone.Signal.prototype.unsync = function(){
		//make a new scalar so that it's disconnected from the control signal
		//get the current gain
		var currentGain = this.value;
		this._scalar.disconnect();
		this._scalar = this.context.createGain();
		this._scalar.gain.value = currentGain / this._syncRatio;
		this._syncRatio = 1;
		//reconnect things up
		Tone.Signal._constant.chain(this._scalar, this.output);
		return this;
	};

	/**
	 *  dispose and disconnect
	 *  @returns {Tone.Signal} `this`
	 */
	Tone.Signal.prototype.dispose = function(){
		Tone.prototype.dispose.call(this);
		this._scalar.disconnect();
		this._scalar = null;
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
		Interval : "interval"
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