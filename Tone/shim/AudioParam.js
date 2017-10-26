define(["Tone/core/Tone", "Tone/core/Timeline"], function (Tone) {

	//initialize the events of the audio param
	function initializeAudioParam(param){
		if (!param._events){
			param._events = new Tone.Timeline(1000);
		}
	}

	///////////////////////////////////////////////////////////////////////////
	//	AUTOMATION CURVE CALCULATIONS
	//	MIT License, copyright (c) 2014 Jordan Santell
	///////////////////////////////////////////////////////////////////////////

	// Calculates the the value along the curve produced by setTargetAtTime
	var exponentialApproach = function (t0, v0, v1, timeConstant, t) {
		return v1 + (v0 - v1) * Math.exp(-(t - t0) / timeConstant);
	};

	// Calculates the the value along the curve produced by linearRampToValueAtTime
	var linearInterpolate = function (t0, v0, t1, v1, t) {
		return v0 + (v1 - v0) * ((t - t0) / (t1 - t0));
	};

	// Calculates the the value along the curve produced by exponentialRampToValueAtTime
	var exponentialInterpolate = function (t0, v0, t1, v1, t) {
		return v0 * Math.pow(v1 / v0, (t - t0) / (t1 - t0));
	};

	/**
	 *  The event types
	 *  @enum {String}
	 *  @private
	 */
	var AutomationType = {
		Linear : "linearRampToValueAtTime",
		Exponential : "exponentialRampToValueAtTime",
		Target : "setTargetAtTime",
		SetValue : "setValueAtTime"
	};

	//only shim if needed
	if (Tone.supported){

		// overwrite getting the default value
		Object.defineProperty(AudioParam.prototype, "value", {
			get : function(){
				var now = Tone.context.currentTime;
				return this.getValueAtTime(now);
			},
			set : function(val){
				this._initialValue = val;
				//set the value
				var now = Tone.context.currentTime;
				this.setValueAtTime(val, now);
			}
		});

		// defaultValue
		if (!AudioParam.prototype.hasOwnProperty("defaultValue")){
			Object.defineProperty(AudioParam.prototype, "defaultValue", {
				get : function(){
					return 1;
				}
			});
		}

		// minValue
		if (!AudioParam.prototype.hasOwnProperty("minValue")){
			Object.defineProperty(AudioParam.prototype, "minValue", {
				get : function(){
					return -3.4028235e38;
				}
			});
		}

		// maxValue
		if (!AudioParam.prototype.hasOwnProperty("maxValue")){
			Object.defineProperty(AudioParam.prototype, "maxValue", {
				get : function(){
					return 3.4028235e38;
				}
			});
		}

		///////////////////////////////////////////////////////////////////////////
		//	SCHEDULING
		///////////////////////////////////////////////////////////////////////////

		// wrap the basic methods
		["setValueAtTime",
		"linearRampToValueAtTime",
		"exponentialRampToValueAtTime"].forEach(function(method){
			var nativeMethodName = "_native_"+method;
			if (!AudioParam.prototype[nativeMethodName]){
				//make a copy of the original method prefixed _native_
				AudioParam.prototype[nativeMethodName] = AudioParam.prototype[method];
				AudioParam.prototype[method] = function(value, time){
					//initialize the events array if it hasn't already
					initializeAudioParam(this);
					//check if the exponential ramp is starting from above 0
					if (method === AutomationType.Exponential){
						var before = this._events.get(time);
						if (before && this.getValueAtTime(before.time) <= 0){
							throw new Error("exponentialRampToValueAtTime must ramp from a value > 0");
						}
					}
					//remember the events
					this._events.add({
						type : method,
						time : time,
						value : value
					});
					//invoke the native method
					return AudioParam.prototype[nativeMethodName].call(this, value, time);
				};
			}
		});

		// setTargetAtTime
		if (!AudioParam.prototype._native_setTargetAtTime){
			AudioParam.prototype._native_setTargetAtTime = AudioParam.prototype.setTargetAtTime;
			AudioParam.prototype.setTargetAtTime = function(value, time, timeConstant){
				//initialize the events array if it hasn't already
				initializeAudioParam(this);
				this._events.add({
					type : AutomationType.Target,
					value : value,
					time : time,
					constant : timeConstant
				});
				return this._native_setTargetAtTime(value, time, timeConstant);
			};
		}

		// setValueCurveAtTime
		if (!AudioParam.prototype._native_setValueCurveAtTime){
			AudioParam.prototype._native_setValueCurveAtTime = AudioParam.prototype.setValueCurveAtTime;
			AudioParam.prototype.setValueCurveAtTime = function(values, time, duration){
				//initialize the events array if it hasn't already
				initializeAudioParam(this);
				//set the initial value
				this._events.add({
					type : AutomationType.SetValue,
					value : values[0],
					time : time,
				});
				var segTime = duration / (values.length - 1);
				//set the rest as linear ramps
				for (var i = 1; i < values.length; i++){
					this._events.add({
						type : AutomationType.Linear,
						value : values[i],
						time :  time + i * segTime,
					});
				}
				//call the native method
				return this._native_setValueCurveAtTime(values, time, duration);
			};
		}

		// cancelScheduledValues
		if (!AudioParam.prototype._native_cancelScheduledValues){
			AudioParam.prototype._native_cancelScheduledValues = AudioParam.prototype.cancelScheduledValues;
			AudioParam.prototype.cancelScheduledValues = function(time){
				initializeAudioParam(this);
				this._events.cancel(time);
				return this._native_cancelScheduledValues(time);
			};
		}

		// cancelAndHoldAtTime
		if (!AudioParam.prototype._native_cancelAndHoldAtTime){
			AudioParam.prototype._native_cancelAndHoldAtTime = AudioParam.prototype.cancelAndHoldAtTime;
			AudioParam.prototype.cancelAndHoldAtTime = function(time){
				initializeAudioParam(this);
				var valueAtTime = this.getValueAtTime(time);
				//if there is an event at the given time
				//and that even is not a "set"
				var before = this._events.get(time);
				var after = this._events.getAfter(time);
				if (before && before.time === time){
					//remove everything after
					if (after){
						this._events.cancel(after.time);
					} else {
						this._events.cancel(time + 1e-6);
					}
				} else if (after){
					//cancel the next event(s)
					this._events.cancel(after.time);
					if (!this._native_cancelAndHoldAtTime){
						this._native_cancelScheduledValues(time);
					}
					if (after.type === AutomationType.Linear){
						if (!this._native_cancelAndHoldAtTime){
							this.linearRampToValueAtTime(valueAtTime, time);
						} else {
							this._events.add({
								type : AutomationType.Linear,
								value : valueAtTime,
								time : time
							});
						}
					} else if (after.type === AutomationType.Exponential){
						if (!this._native_cancelAndHoldAtTime){
							this.exponentialRampToValueAtTime(valueAtTime, time);
						} else {
							this._events.add({
								type : AutomationType.Exponential,
								value : valueAtTime,
								time : time
							});
						}
					}
				}

				//set the value at the given time
				this._events.add({
					type : AutomationType.SetValue,
					value : valueAtTime,
					time : time
				});
				if (this._native_cancelAndHoldAtTime){
					return this._native_cancelAndHoldAtTime(time);
				} else {
					return this._native_setValueAtTime(valueAtTime, time);
				}
			};
		}

		// getValueAtTime
		AudioParam.prototype.getValueAtTime = function(time){
			initializeAudioParam(this);
			var after = this._events.getAfter(time);
			var before = this._events.get(time);
			var initialValue = Tone.defaultArg(this._initialValue, this.defaultValue);
			//if it was set by
			if (before === null){
				return initialValue;
			} else if (before.type === AutomationType.Target){
				var previous = this._events.getBefore(before.time);
				var previousVal;
				if (previous === null){
					previousVal = initialValue;
				} else {
					previousVal = previous.value;
				}
				return exponentialApproach(before.time, previousVal, before.value, before.constant, time);
			} else if (after === null){
				return before.value;
			} else if (after.type === AutomationType.Linear){
				return linearInterpolate(before.time, before.value, after.time, after.value, time);
			} else if (after.type === AutomationType.Exponential){
				return exponentialInterpolate(before.time, before.value, after.time, after.value, time);
			} else {
				return before.value;
			}
		};
	}
});
