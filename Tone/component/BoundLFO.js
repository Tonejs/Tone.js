define(["Tone/core/Tone", "Tone/source/Oscillator","Tone/signal/Add", "Tone/signal/Multiply", "Tone/signal/Scale",
	"Tone/signal/Signal", "Tone/signal/AudioToGain", "Tone/type/Type", "Tone/signal/WaveShaper", "Tone/signal/Zero"],
function(Tone){

	"use strict";

	/**
	 *  @class  BoundLFO represents a LFO that can be bound - meaning that the oscillator can modulate between the min and max values
	 *          but the ouput to the AudioParam or Tone.Signal will never fall outside the low or high bounds.
	 *          If you are unsure if you need a BoundLFO, please see Tone.LFO which will
	 *          likely fulfill your use case.
	 *
	 *  @constructor
	 *  @extends {Tone.Oscillator}
	 *  @param {Frequency|Object} [frequency] The frequency of the oscillation. Typically, LFOs will be
	 *                               in the frequency range of 0.1 to 10 hertz.
	 *  @param {number=} min The minimum value of the oscillator which may be constained by the lowBound.
	 *  @param {number=} max The maximum value of the oscillator which may be constained by the highBound.
	 *  @param {number=} lowBound The minimum output value of the LFO.
	 *  @param {number=} highBound The maximum output value of the LFO.
	 *  @example
	 * var lfo = new Tone.BoundLFO("4n", 0, 100, 50, 20000);
	 * lfo.connect(filter.frequency);
	 */
	Tone.BoundLFO = function(){

		var options = this.optionsObject(arguments, ["frequency", "min", "max", "lowBound", "highBound"], Tone.BoundLFO.defaults);

		/**
		 *  The oscillator.
		 *  @type {Tone.Oscillator}
		 *  @private
		 */
		this._oscillator = new Tone.Oscillator({
			"frequency" : options.frequency,
			"type" : options.type,
		});

		/**
		 *  the lfo's frequency
		 *  @type {Frequency}
		 *  @signal
		 */
		this.frequency = this._oscillator.frequency;

		/**
		 * The amplitude of the LFO, which controls the output range between
		 * the min and max output. For example if the min is -10 and the max
		 * is 10, setting the amplitude to 0.5 would make the LFO modulate
		 * between -5 and 5.
		 * @type {Number}
		 * @signal
		 */
		this.amplitude = this._oscillator.volume;
		this.amplitude.units = Tone.Type.NormalRange;
		this.amplitude.value = options.amplitude;

		/**
		 *  The signal which is output when the LFO is stopped
		 *  @type  {Tone.Signal}
		 *  @private
		 */
		this._stoppedSignal = new Tone.Signal(0, Tone.Type.AudioRange);

		/**
		 *  Just outputs zeros.
		 *  @type {Tone.Zero}
		 *  @private
		 */
		this._zeros = new Tone.Zero();

		/**
		 *  The value that the LFO outputs when it's stopped
		 *  @type {AudioRange}
		 *  @private
		 */
		this._stoppedValue = 0;

		/**
		 *  @type {Tone.AudioToGain}
		 *  @private
		 */
		this._a2g = new Tone.AudioToGain();

		// /**
		//  *  @type {mapping}
		//  *  @private
		//  */
		// this._scaler = this.output =  new Tone.Scale(options.min, options.max);


		/**
		 *  the values of the boundedLFO used in the WaveShaping mapping function
		 *  @private
		 */
		this.boundingSettings = {
			min: options.min,
			max: options.max,
			lowBound: options.lowBound,
			highBound: options.highBound
		}

		/**
		 *  the mapping function responsible for setting potentially bounded values of the output
		 *  @type {Tone.WaveShaper}
		 *  @private
		 */
		this._waveShaper = this.output = new Tone.WaveShaper()

		/**
		 *  the units of the LFO (used for converting)
		 *  @type {Tone.Type}
		 *  @private
		 */
		this._units = Tone.Type.Default;
		this.units = options.units;
		this.setWaveShaperFunction()

		//connect it up
		this._oscillator.chain(this._waveShaper);
		this._zeros.connect(this._a2g);
		this._stoppedSignal.connect(this._a2g);
		this._readOnly(["amplitude", "frequency"]);
		this.phase = options.phase;
	};

	Tone.extend(Tone.BoundLFO, Tone.Oscillator);

	/**
	 *  the default parameters
	 *
	 *  @static
	 *  @const
	 *  @type {Object}
	 */
	Tone.BoundLFO.defaults = {
		"type" : "sine",
		"min" : 0,
		"max" : 1,
		"lowBound" : 0,
		"highBound" : 1,
		"phase" : 0,
		"frequency" : "4n",
		"amplitude" : 1,
		"units" : Tone.Type.Default
	};


	/**
	 *  Responsible for creating the new mapping function for the Tone.WaveShaper
	 *  @returns {Tone.BoundLFO} this
	 */
	Tone.BoundLFO.prototype.setWaveShaperFunction = function(){
		var newLowBound  = this.boundingSettings.min < this.boundingSettings.lowBound ? this.boundingSettings.lowBound : this.boundingSettings.min
		var newHighBound = this.boundingSettings.max > this.boundingSettings.highBound ? this.boundingSettings.highBound : this.boundingSettings.max

		var newBoundLengthHalfDistance = (newHighBound - newLowBound) / 2
		var newBoundHalfwayPoint = newLowBound + newBoundLengthHalfDistance

		var distanceFromHalfToBottom = Math.abs(newBoundHalfwayPoint - this.boundingSettings.min)
		var distanceFromHalfToTop = Math.abs(this.boundingSettings.max - newBoundHalfwayPoint)

		// || 1 in case distance is 0 (modulating between 200 and 200 fr example)
		var topDistance = (distanceFromHalfToTop / newBoundLengthHalfDistance) || 1
		var bottomDistance = (distanceFromHalfToBottom / newBoundLengthHalfDistance) || 1

		var numerator = topDistance + bottomDistance
		var multiplyValue = (numerator / 2) // 2 = old distance

		// find inital addValue for conversion to new wave potentially outside of bounds
		var maxAddValue = (topDistance/multiplyValue) - 1
		var minAddValue = ((-bottomDistance)/multiplyValue) - (-1)
		var avgAddValue = (maxAddValue + minAddValue) / 2

	  // find addvalue once bounded wave needs to be converted to final output
	  var newBoundButNotZero = newBoundLengthHalfDistance ? newBoundLengthHalfDistance : 1
	  var maxAdderValue = (newHighBound/newBoundButNotZero) - 1
	  var minAdderValue = (newLowBound/newBoundButNotZero) + 1
	  var avgAdderValue = ((maxAdderValue + minAdderValue) / 2) || 0

		var wsFn = function(val) {
			// add and multiply value to set new curve potentially outside of bounds
			var newValue = (val + avgAddValue) * multiplyValue
			// clamp to set values between -1 and 1
			var originalClampedValue = Math.max(newValue, -1)
		  		originalClampedValue = Math.min(originalClampedValue, 1)

		  // scale the val (which is between -1 and 1) to your output range
		  var scaledVal = (originalClampedValue + avgAdderValue) * newBoundLengthHalfDistance
		  // final clamp on values
		  var clampedVal = Math.max(scaledVal, newLowBound);
		  clampedVal = Math.min(clampedVal, newHighBound);
		  return clampedVal
		}
		this._waveShaper.setMap(wsFn)
		return this
	};

	/**
	 *  Start the LFO.
	 *  @param  {Time} [time=now] the time the LFO will start
	 *  @returns {Tone.BoundLFO} this
	 */
	Tone.BoundLFO.prototype.start = function(time){
		time = this.toSeconds(time);
		this._stoppedSignal.setValueAtTime(0, time);
		this._oscillator.start(time);
		return this;
	};

	/**
	 *  Stop the LFO.
	 *  @param  {Time} [time=now] the time the LFO will stop
	 *  @returns {Tone.BoundLFO} this
	 */
	Tone.BoundLFO.prototype.stop = function(time){
		time = this.toSeconds(time);
		this._stoppedSignal.setValueAtTime(this._stoppedValue, time);
		this._oscillator.stop(time);
		return this;
	};

	/**
	 *  Sync the start/stop/pause to the transport
	 *  and the frequency to the bpm of the transport
	 *  @returns {Tone.BoundLFO} this
	 *  @example
	 *  lfo.frequency.value = "8n";
	 *  lfo.sync().start(0)
	 *  //the rate of the LFO will always be an eighth note,
	 *  //even as the tempo changes
	 */
	Tone.BoundLFO.prototype.sync = function(){
		this._oscillator.sync();
		this._oscillator.syncFrequency();
		return this;
	};

	/**
	 *  unsync the LFO from transport control
	 *  @returns {Tone.BoundLFO} this
	 */
	Tone.BoundLFO.prototype.unsync = function(){
		this._oscillator.unsync();
		this._oscillator.unsyncFrequency();
		return this;
	};

	/**
	 * Set the parameters of the LFO and the bounded constaints
	 * @memberOf Tone.BoundLFO#
	 * @type {object}
	 * @name bounds
	 */
	Object.defineProperty(Tone.BoundLFO.prototype, "bounds", {
		get : function(){
			return this._toUnits(this.boundingSettings);
		},
		set : function(boundingSettingsObj){
			// worry about later
			// min = this._fromUnits(min);
			this.boundingSettings = boundingSettingsObj;
			this.setWaveShaperFunction();
		}
	});

	// /**
	//  * The miniumum output of the LFO.
	//  * @memberOf Tone.BoundLFO#
	//  * @type {number}
	//  * @name min
	//  */
	// Object.defineProperty(Tone.BoundLFO.prototype, "min", {
	// 	get : function(){
	// 		return this._toUnits(this.boundingSettings.min);
	// 	},
	// 	set : function(min){
	// 		min = this._fromUnits(min);
	// 		this.boundingSettings.min = min;
	// 		this.setWaveShaperFunction();
	// 	}
	// });

	// /**
	//  * The maximum output of the LFO.
	//  * @memberOf Tone.BoundLFO#
	//  * @type {number}
	//  * @name max
	//  */
	// Object.defineProperty(Tone.BoundLFO.prototype, "max", {
	// 	get : function(){
	// 		return this._toUnits(this.boundingSettings.max);
	// 	},
	// 	set : function(max){
	// 		max = this._fromUnits(max);
	// 		this.boundingSettings.max = max;
	// 		this.setWaveShaperFunction();
	// 	}
	// });

	// *
	//  * The miniumum output of the LFO.
	//  * @memberOf Tone.BoundLFO#
	//  * @type {number}
	//  * @name min


	// Object.defineProperty(Tone.BoundLFO.prototype, "lowBound", {
	// 	get : function(){
	// 		return this._toUnits(this.boundingSettings.lowBound);
	// 	},
	// 	set : function(min){
	// 		min = this._fromUnits(min);
	// 		this.boundingSettings.lowBound = min;
	// 		this.setWaveShaperFunction();
	// 	}
	// });

	// /**
	//  * The maximum output of the LFO.
	//  * @memberOf Tone.BoundLFO#
	//  * @type {number}
	//  * @name max
	//  */
	// Object.defineProperty(Tone.BoundLFO.prototype, "highBound", {
	// 	get : function(){
	// 		// return this._toUnits(this._scaler.max);
	// 		return this._toUnits(this.boundingSettings.highBound);
	// 	},
	// 	set : function(max){
	// 		max = this._fromUnits(max);
	// 		this.boundingSettings.highBound = max;
	// 		this.setWaveShaperFunction();
	// 	}
	// });

	/**
	 * The type of the oscillator: sine, square, sawtooth, triangle.
	 * @memberOf Tone.BoundLFO#
	 * @type {string}
	 * @name type
	 */
	 Object.defineProperty(Tone.BoundLFO.prototype, "type", {
		get : function(){
			return this._oscillator.type;
		},
		set : function(type){
			this._oscillator.type = type;
			this._stoppedValue = this._oscillator._getInitialValue();
			this._stoppedSignal.value = this._stoppedValue;
		}
	});

	/**
	 * The phase of the LFO.
	 * @memberOf Tone.BoundLFO#
	 * @type {number}
	 * @name phase
	 */
	 Object.defineProperty(Tone.BoundLFO.prototype, "phase", {
		get : function(){
			return this._oscillator.phase;
		},
		set : function(phase){
			this._oscillator.phase = phase;
			this._stoppedValue = this._oscillator._getInitialValue();
			this._stoppedSignal.value = this._stoppedValue;
		}
	});

	/**
	 * The output units of the LFO.
	 * @memberOf Tone.BoundLFO#
	 * @type {Tone.Type}
	 * @name units
	 */
	 Object.defineProperty(Tone.BoundLFO.prototype, "units", {
		get : function(){
			return this._units;
		},
		set : function(val){
			var currentMin = this.min;
			var currentMax = this.max;
			//convert the min and the max
			this._units = val;
			this.min = currentMin;
			this.max = currentMax;
		}
	});

	/**
	 * Mute the output.
	 * @memberOf Tone.BoundLFO#
	 * @type {Boolean}
	 * @name mute
	 */
	Object.defineProperty(Tone.BoundLFO.prototype, "mute", {
		get : function(){
			return this._oscillator.mute;
		},
		set : function(mute){
			this._oscillator.mute = mute;
		}
	});

	/**
	 *  Returns the playback state of the source, either "started" or "stopped".
	 *  @type {Tone.State}
	 *  @readOnly
	 *  @memberOf Tone.BoundLFO#
	 *  @name state
	 */
	Object.defineProperty(Tone.BoundLFO.prototype, "state", {
		get : function(){
			return this._oscillator.state;
		}
	});

	/**
	 *  Connect the output of the LFO to an AudioParam, AudioNode, or Tone Node.
	 *  Tone.BoundLFO will automatically convert to the destination units of the
	 *  will get the units from the connected node.
	 *  @param  {Tone | AudioParam | AudioNode} node
	 *  @param {number} [outputNum=0] optionally which output to connect from
	 *  @param {number} [inputNum=0] optionally which input to connect to
	 *  @returns {Tone.BoundLFO} this
	 *  @private
	 */
	Tone.BoundLFO.prototype.connect = function(node){
		if (node.constructor === Tone.Signal || node.constructor === Tone.Param || node.constructor === Tone.TimelineSignal){
			this.convert = node.convert;
			this.units = node.units;
		}
		Tone.Signal.prototype.connect.apply(this, arguments);
		return this;
	};

	/**
	 *  private method borrowed from Param converts
	 *  units from their destination value
	 *  @function
	 *  @private
	 */
	Tone.BoundLFO.prototype._fromUnits = Tone.Param.prototype._fromUnits;

	/**
	 *  private method borrowed from Param converts
	 *  units to their destination value
	 *  @function
	 *  @private
	 */
	Tone.BoundLFO.prototype._toUnits = Tone.Param.prototype._toUnits;

	/**
	 *  disconnect and dispose
	 *  @returns {Tone.BoundLFO} this
	 */
	Tone.BoundLFO.prototype.dispose = function(){
		Tone.prototype.dispose.call(this);
		this._writable(["amplitude", "frequency"]);
		this._waveShaper.dispose();
		this._oscillator.dispose();
		this._oscillator = null;
		this._stoppedSignal.dispose();
		this._stoppedSignal = null;
		this._zeros.dispose();
		this._zeros = null;
		this._scaler.dispose();
		this._scaler = null;
		this._a2g.dispose();
		this._a2g = null;
		this.frequency = null;
		this.amplitude = null;
		return this;
	};

	return Tone.BoundLFO;
});