define(["Tone/core/Tone", "Tone/source/Oscillator", "Tone/signal/Scale", 
	"Tone/signal/Signal", "Tone/signal/AudioToGain", "Tone/type/Type", "Tone/signal/Zero"], 
function(Tone){

	"use strict";

	/**
	 *  @class  LFO stands for low frequency oscillator. Tone.LFO produces an output signal 
	 *          which can be attached to an AudioParam or Tone.Signal 
	 *          in order to modulate that parameter with an oscillator. The LFO can 
	 *          also be synced to the transport to start/stop and change when the tempo changes.
	 *
	 *  @constructor
	 *  @extends {Tone.Oscillator}
	 *  @param {Frequency|Object} [frequency] The frequency of the oscillation. Typically, LFOs will be
	 *                               in the frequency range of 0.1 to 10 hertz. 
	 *  @param {number=} min The minimum output value of the LFO. 
	 *  @param {number=} max The maximum value of the LFO. 
	 *  @example
	 * var lfo = new Tone.LFO("4n", 400, 4000);
	 * lfo.connect(filter.frequency);
	 */
	Tone.LFO = function(){

		var options = this.optionsObject(arguments, ["frequency", "min", "max"], Tone.LFO.defaults);

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

		/**
		 *  @type {Tone.Scale} 
		 *  @private
		 */
		this._scaler = this.output = new Tone.Scale(options.min, options.max);

		/**
		 *  the units of the LFO (used for converting)
		 *  @type {Tone.Type} 
		 *  @private
		 */
		this._units = Tone.Type.Default;
		this.units = options.units;

		//connect it up
		this._oscillator.chain(this._a2g, this._scaler);
		this._zeros.connect(this._a2g);
		this._stoppedSignal.connect(this._a2g);
		this._readOnly(["amplitude", "frequency"]);
		this.phase = options.phase;
	};

	Tone.extend(Tone.LFO, Tone.Oscillator);

	/**
	 *  the default parameters
	 *
	 *  @static
	 *  @const
	 *  @type {Object}
	 */
	Tone.LFO.defaults = {
		"type" : "sine",
		"min" : 0,
		"max" : 1,
		"phase" : 0,
		"frequency" : "4n",
		"amplitude" : 1,
		"units" : Tone.Type.Default
	};

	/**
	 *  Start the LFO. 
	 *  @param  {Time} [time=now] the time the LFO will start
	 *  @returns {Tone.LFO} this
	 */
	Tone.LFO.prototype.start = function(time){
		time = this.toSeconds(time);
		this._stoppedSignal.setValueAtTime(0, time);
		this._oscillator.start(time);
		return this;
	};

	/**
	 *  Stop the LFO. 
	 *  @param  {Time} [time=now] the time the LFO will stop
	 *  @returns {Tone.LFO} this
	 */
	Tone.LFO.prototype.stop = function(time){
		time = this.toSeconds(time);
		this._stoppedSignal.setValueAtTime(this._stoppedValue, time);
		this._oscillator.stop(time);
		return this;
	};

	/**
	 *  Sync the start/stop/pause to the transport 
	 *  and the frequency to the bpm of the transport
	 *  @returns {Tone.LFO} this
	 *  @example
	 *  lfo.frequency.value = "8n";
	 *  lfo.sync().start(0)
	 *  //the rate of the LFO will always be an eighth note, 
	 *  //even as the tempo changes
	 */
	Tone.LFO.prototype.sync = function(){
		this._oscillator.sync();
		this._oscillator.syncFrequency();
		return this;
	};

	/**
	 *  unsync the LFO from transport control
	 *  @returns {Tone.LFO} this
	 */
	Tone.LFO.prototype.unsync = function(){
		this._oscillator.unsync();
		this._oscillator.unsyncFrequency();
		return this;
	};

	/**
	 * The miniumum output of the LFO.
	 * @memberOf Tone.LFO#
	 * @type {number}
	 * @name min
	 */
	Object.defineProperty(Tone.LFO.prototype, "min", {
		get : function(){
			return this._toUnits(this._scaler.min);
		},
		set : function(min){
			min = this._fromUnits(min);
			this._scaler.min = min;
		}
	});

	/**
	 * The maximum output of the LFO.
	 * @memberOf Tone.LFO#
	 * @type {number}
	 * @name max
	 */
	Object.defineProperty(Tone.LFO.prototype, "max", {
		get : function(){
			return this._toUnits(this._scaler.max);
		},
		set : function(max){
			max = this._fromUnits(max);
			this._scaler.max = max;
		}
	});

	/**
	 * The type of the oscillator: sine, square, sawtooth, triangle. 
	 * @memberOf Tone.LFO#
	 * @type {string}
	 * @name type
	 */
	 Object.defineProperty(Tone.LFO.prototype, "type", {
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
	 * @memberOf Tone.LFO#
	 * @type {number}
	 * @name phase
	 */
	 Object.defineProperty(Tone.LFO.prototype, "phase", {
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
	 * @memberOf Tone.LFO#
	 * @type {Tone.Type}
	 * @name units
	 */
	 Object.defineProperty(Tone.LFO.prototype, "units", {
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
	 * @memberOf Tone.LFO#
	 * @type {Boolean}
	 * @name mute
	 */
	Object.defineProperty(Tone.LFO.prototype, "mute", {
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
	 *  @memberOf Tone.LFO#
	 *  @name state
	 */
	Object.defineProperty(Tone.LFO.prototype, "state", {
		get : function(){
			return this._oscillator.state;
		}
	});

	/**
	 *  Connect the output of the LFO to an AudioParam, AudioNode, or Tone Node. 
	 *  Tone.LFO will automatically convert to the destination units of the 
	 *  will get the units from the connected node.
	 *  @param  {Tone | AudioParam | AudioNode} node 
	 *  @param {number} [outputNum=0] optionally which output to connect from
	 *  @param {number} [inputNum=0] optionally which input to connect to
	 *  @returns {Tone.LFO} this
	 *  @private
	 */
	Tone.LFO.prototype.connect = function(node){
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
	Tone.LFO.prototype._fromUnits = Tone.Param.prototype._fromUnits;

	/**
	 *  private method borrowed from Param converts 
	 *  units to their destination value
	 *  @function
	 *  @private
	 */
	Tone.LFO.prototype._toUnits = Tone.Param.prototype._toUnits;

	/**
	 *  disconnect and dispose
	 *  @returns {Tone.LFO} this
	 */
	Tone.LFO.prototype.dispose = function(){
		Tone.prototype.dispose.call(this);
		this._writable(["amplitude", "frequency"]);
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

	return Tone.LFO;
});