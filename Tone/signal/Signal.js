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
	 *  @param {number} [value=0] initial value
	 */
	Tone.Signal = function(value){

		/**
		 *  scales the constant output to the desired output
		 *  @type {GainNode}
		 *  @private
		 */
		this._scalar = this.context.createGain();

		/**
		 *  @type {GainNode}
		 */
		this.input = this.output = this.context.createGain();

		/**
		 *  the ratio of the this value to the control signal value
		 *
		 *  @private
		 *  @type {number}
		 */
		this._syncRatio = 1;

		/**
		 *  the value of the Signal
		 *  @type {number}
		 */
		this.value = this.defaultArg(value, 0);

		//connect the constant 1 output to the node output
		Tone.Signal._constant.chain(this._scalar, this.output);
		
	};

	Tone.extend(Tone.Signal, Tone.SignalBase);

	/**
	 *  @return {number} the current value of the signal
	 */
	Tone.Signal.prototype.getValue = function(){
		return this._scalar.gain.value;
	};

	/**
	 *  set the value of the signal right away
	 *  will be overwritten if there are previously scheduled automation curves
	 *  
	 *  @param {number} value 
	 */
	Tone.Signal.prototype.setValue = function(value){
		if (this._syncRatio === 0){
			value = 0;
		} else {
			value *= this._syncRatio;
		}
		this._scalar.gain.value = value;
	};

	/**
	 *  Schedules a parameter value change at the given time.
	 *  
	 *  @param {number}		value 
	 *  @param {Tone.Time}  time 
	 */
	Tone.Signal.prototype.setValueAtTime = function(value, time){
		value *= this._syncRatio;
		this._scalar.gain.setValueAtTime(value, this.toSeconds(time));
	};

	/**
	 *  creates a schedule point with the current value at the current time
	 *
	 *  @param {number=} now (optionally) pass the now value in
	 *  @returns {number} the current value
	 */
	Tone.Signal.prototype.setCurrentValueNow = function(now){
		now = this.defaultArg(now, this.now());
		var currentVal = this.getValue();
		this.cancelScheduledValues(now);
		this._scalar.gain.setValueAtTime(currentVal, now);
		return currentVal;
	};

	/**
	 *  Schedules a linear continuous change in parameter value from the 
	 *  previous scheduled parameter value to the given value.
	 *  
	 *  @param  {number} value   
	 *  @param  {Tone.Time} endTime 
	 */
	Tone.Signal.prototype.linearRampToValueAtTime = function(value, endTime){
		value *= this._syncRatio;
		this._scalar.gain.linearRampToValueAtTime(value, this.toSeconds(endTime));
	};

	/**
	 *  Schedules an exponential continuous change in parameter value from 
	 *  the previous scheduled parameter value to the given value.
	 *  
	 *  @param  {number} value   
	 *  @param  {Tone.Time} endTime 
	 */
	Tone.Signal.prototype.exponentialRampToValueAtTime = function(value, endTime){
		value *= this._syncRatio;
		//can't go below a certain value
		value = Math.max(0.00001, value);
		this._scalar.gain.exponentialRampToValueAtTime(value, this.toSeconds(endTime));
	};

	/**
	 *  Schedules an exponential continuous change in parameter value from 
	 *  the current time and current value to the given value.
	 *  
	 *  @param  {number} value   
	 *  @param  {Tone.Time} endTime 
	 */
	Tone.Signal.prototype.exponentialRampToValueNow = function(value, endTime){
		var now = this.now();
		this.setCurrentValueNow(now);
		//make sure that the endTime doesn't start with +
		if (endTime.toString().charAt(0) === "+"){
			endTime = endTime.substr(1);
		}
		this.exponentialRampToValueAtTime(value, now + this.toSeconds(endTime));
	};

	/**
	 *  Schedules an linear continuous change in parameter value from 
	 *  the current time and current value to the given value at the given time.
	 *  
	 *  @param  {number} value   
	 *  @param  {Tone.Time} endTime 
	 */
	Tone.Signal.prototype.linearRampToValueNow = function(value, endTime){
		var now = this.now();
		this.setCurrentValueNow(now);
		value *= this._syncRatio;
		//make sure that the endTime doesn't start with +
		if (endTime.toString().charAt(0) === "+"){
			endTime = endTime.substr(1);
		}
		this._scalar.gain.linearRampToValueAtTime(value, now + this.toSeconds(endTime));
	};

	/**
	 *  Start exponentially approaching the target value at the given time with
	 *  a rate having the given time constant.
	 *  	
	 *  @param {number} value        
	 *  @param {Tone.Time} startTime    
	 *  @param {number} timeConstant 
	 */
	Tone.Signal.prototype.setTargetAtTime = function(value, startTime, timeConstant){
		value *= this._syncRatio;
		this._scalar.gain.setTargetAtTime(value, this.toSeconds(startTime), timeConstant);
	};

	/**
	 *  Sets an array of arbitrary parameter values starting at the given time
	 *  for the given duration.
	 *  	
	 *  @param {Array<number>} values    
	 *  @param {Tone.Time} startTime 
	 *  @param {Tone.Time} duration  
	 */
	Tone.Signal.prototype.setValueCurveAtTime = function(values, startTime, duration){
		for (var i = 0; i < values.length; i++){
			values[i] *= this._syncRatio;
		}
		this._scalar.gain.setValueCurveAtTime(values, this.toSeconds(startTime), this.toSeconds(duration));
	};

	/**
	 *  Cancels all scheduled parameter changes with times greater than or 
	 *  equal to startTime.
	 *  
	 *  @param  {Tone.Time} startTime
	 */
	Tone.Signal.prototype.cancelScheduledValues = function(startTime){
		this._scalar.gain.cancelScheduledValues(this.toSeconds(startTime));
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
	 */
	Tone.Signal.prototype.sync = function(signal, ratio){
		if (ratio){
			this._syncRatio = ratio;
		} else {
			//get the sync ratio
			if (signal.getValue() !== 0){
				this._syncRatio = this.getValue() / signal.getValue();
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
	};

	/**
	 *  unbind the signal control
	 *
	 *  will leave the signal value as it was without the influence of the control signal
	 */
	Tone.Signal.prototype.unsync = function(){
		//make a new scalar so that it's disconnected from the control signal
		//get the current gain
		var currentGain = this.getValue();
		this._scalar.disconnect();
		this._scalar = this.context.createGain();
		this._scalar.gain.value = currentGain / this._syncRatio;
		this._syncRatio = 1;
		//reconnect things up
		Tone.Signal._constant.chain(this._scalar, this.output);
	};

	/**
	 *  dispose and disconnect
	 */
	Tone.Signal.prototype.dispose = function(){
		Tone.prototype.dispose.call(this);
		this._scalar.disconnect();
		this._scalar = null;
	};

	/**
	 * the value of the 
	 * @memberOf Tone.Oscillator#
	 * @type {number}
	 * @name value
	 */
	Tone._defineGetterSetter(Tone.Signal, "value");

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