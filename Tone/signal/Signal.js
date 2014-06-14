define(["Tone/core/Tone"], function(Tone){
	
	/**
	 *  Signal
	 *
	 *  audio rate value with ramping syncing
	 *  useful for controlling AudioParams
	 *  can sync to another Tone.Signal
	 *
	 *  Tone.Signal can be scheduled with all of the functions available to AudioParams
	 *
	 *  @constructor
	 *  @param {number=} value (optional) initial value
	 */
	Tone.Signal = function(value){

		//components
		this.constant = this.context.createWaveShaper();
		this.scalar = this.context.createGain();
		this.output = this.context.createGain();
		//generator to drive values
		this.generator = this.context.createOscillator();
		//the ratio of the this value to the control signal value
		this._syncRatio = 1;

		//connections
		this.chain(this.generator, this.constant, this.scalar, this.output);

		//setup
		this.generator.start(0);
		this._signalCurve();
		this.setValue(this.defaultArg(value, 0));

	};

	Tone.extend(Tone.Signal);

	/**
	 *  generates a WaveShaper curve where the value for any input is 1
	 */
	Tone.Signal.prototype._signalCurve = function(){
		var len = 8;
		var curve = new Float32Array(len);
		for (var i = 0; i < len; i++){
			//all inputs produce the output value
			curve[i] = 1;
		}
		this.constant.curve = curve;
	};

	/**
	 *  @return {number} the current value of the signal
	 */
	Tone.Signal.prototype.getValue = function(){
		return this.scalar.gain.value;
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
		this.scalar.gain.value = value;
	};

	/**
	 *  Schedules a parameter value change at the given time.
	 *  
	 *  @param {number}		 value 
	 *  @param {Tone.Timing} time 
	 */
	Tone.Signal.prototype.setValueAtTime = function(value, time){
		value *= this._syncRatio;
		this.scalar.gain.setValueAtTime(value, this.toSeconds(time));
	};

	/**
	 *  Schedules a linear continuous change in parameter value from the 
	 *  previous scheduled parameter value to the given value.
	 *  
	 *  @param  {number} value   
	 *  @param  {Tone.Timing} endTime 
	 */
	Tone.Signal.prototype.linearRampToValueAtTime = function(value, endTime){
		value *= this._syncRatio;
		this.scalar.gain.linearRampToValueAtTime(value, this.toSeconds(endTime));
	};

	/**
	 *  Schedules an exponential continuous change in parameter value from 
	 *  the previous scheduled parameter value to the given value.
	 *  
	 *  @param  {number} value   
	 *  @param  {Tone.Timing} endTime 
	 */
	Tone.Signal.prototype.exponentialRampToValueAtTime = function(value, endTime){
		value *= this._syncRatio;
		this.scalar.gain.exponentialRampToValueAtTime(value, this.toSeconds(endTime));
	};

	/**
	 *  Start exponentially approaching the target value at the given time with
	 *  a rate having the given time constant.
	 *  	
	 *  @param {number} value        
	 *  @param {Tone.Timing} startTime    
	 *  @param {number} timeConstant 
	 */
	Tone.Signal.prototype.setTargetAtTime = function(value, startTime, timeConstant){
		value *= this._syncRatio;
		this.scalar.gain.setTargetAtTime(value, this.toSeconds(startTime), timeConstant);
	};

	/**
	 *  Sets an array of arbitrary parameter values starting at the given time
	 *  for the given duration.
	 *  	
	 *  @param {Array<number>} values    
	 *  @param {Tone.Timing} startTime 
	 *  @param {Tone.Timing} duration  
	 */
	Tone.Signal.prototype.setValueCurveAtTime = function(values, startTime, duration){
		for (var i = 0; i < values.length; i++){
			values[i] *= this._syncRatio;
		}
		this.scalar.gain.setValueCurveAtTime(values, this.toSeconds(startTime), this.toSeconds(duration));
	};

	/**
	 *  Cancels all scheduled parameter changes with times greater than or 
	 *  equal to startTime.
	 *  
	 *  @param  {Tone.Timing} startTime
	 */
	Tone.Signal.prototype.cancelScheduledValues = function(startTime){
		this.scalar.gain.cancelScheduledValues(this.toSeconds(startTime));
	};

	/**
	 *  Sync this signal value to a ratio of the input signal
	 *  
	 *  @param  {Tone.Signal} signal to sync to
	 */
	Tone.Signal.prototype.sync = function(signal){
		//replace the this.constant with the incoming signal
		this.constant.disconnect();
		signal.connect(this.scalar);
		//compute the sync ratio
		if (signal.getValue() !== 0){
			this._syncRatio = this.getValue() / signal.getValue();
		} else {
			this._syncRatio = 0;
		}
		this.scalar.gain.value = this._syncRatio;
		//destroy the signal to free up compute and memory
		this.generator.stop(0);
		this.generator = null;
	};

	/**
	 *  unbind the signal control
	 *
	 *  will leave the signal value as it was without the influence of the control signal
	 */
	Tone.Signal.prototype.unsync = function(){
		//make a new scalar so that it's disconnected from the control signal
		//get the current gain
		var currentGain = this.scalar.gain.value;
		this.scalar.disconnect();
		this.scalar = this.context.createGain();
		this.scalar.gain.value = currentGain / this._syncRatio;
		this._syncRatio = 1;
		//make a new generator
		this.generator = this.context.createOscillator();
		//connect things up
		this.chain(this.generator, this.constant, this.scalar, this.output);
		//start the generator
		this.generator.start(0);
	};

	return Tone.Signal;
});