define(["Tone/core/Tone", "Tone/source/Oscillator", "Tone/signal/Scale", "Tone/signal/Signal", "Tone/signal/AudioToGain"], 
function(Tone){

	"use strict";

	/**
	 *  @class  The Low Frequency Oscillator produces an output signal 
	 *          which can be attached to an AudioParam or Tone.Signal 
	 *          for constant control over that parameter. the LFO can 
	 *          also be synced to the transport to start/stop/pause
	 *          and change when the tempo changes.
	 *
	 *  @constructor
	 *  @extends {Tone.Oscillator}
	 *  @param {Tone.Time} [frequency="4n"]
	 *  @param {number} [outputMin=0]
	 *  @param {number} [outputMax=1]
	 *  @example
	 *  var lfo = new Tone.LFO("4n", 400, 4000);
	 *  lfo.connect(filter.frequency);
	 */
	Tone.LFO = function(){

		var options = this.optionsObject(arguments, ["frequency", "min", "max"], Tone.LFO.defaults);

		/** 
		 *  the oscillator
		 *  @type {Tone.Oscillator}
		 */
		this.oscillator = new Tone.Oscillator({
			"frequency" : options.frequency, 
			"type" : options.type, 
			"phase" : options.phase
		});

		/**
		 *  the lfo's frequency
		 *  @type {Tone.Signal}
		 */
		this.frequency = this.oscillator.frequency;

		/**
		 * The amplitude of the LFO, which controls the output range between
		 * the min and max output. For example if the min is -10 and the max 
		 * is 10, setting the amplitude to 0.5 would make the LFO modulate
		 * between -5 and 5. 
		 * @type {Tone.Signal}
		 */
		this.amplitude = this.oscillator.volume;
		this.amplitude.units = Tone.Signal.Units.Normal;
		this.amplitude.value = options.amplitude;

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

		//connect it up
		this.oscillator.chain(this._a2g, this._scaler);
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
		"amplitude" : 1
	};

	/**
	 *  Start the LFO. 
	 *  @param  {Tone.Time} [time=now] the time the LFO will start
	 *  @returns {Tone.LFO} `this`
	 */
	Tone.LFO.prototype.start = function(time){
		this.oscillator.start(time);
		return this;
	};

	/**
	 *  Stop the LFO. 
	 *  @param  {Tone.Time} [time=now] the time the LFO will stop
	 *  @returns {Tone.LFO} `this`
	 */
	Tone.LFO.prototype.stop = function(time){
		this.oscillator.stop(time);
		return this;
	};

	/**
	 *  Sync the start/stop/pause to the transport 
	 *  and the frequency to the bpm of the transport
	 *
	 *  @param {Tone.Time} [delay=0] the time to delay the start of the
	 *                                LFO from the start of the transport
	 *  @returns {Tone.LFO} `this`
	 *  @example
	 *  lfo.frequency.value = "8n";
	 *  lfo.sync();
	 *  // the rate of the LFO will always be an eighth note, 
	 *  // even as the tempo changes
	 */
	Tone.LFO.prototype.sync = function(delay){
		this.oscillator.sync(delay);
		this.oscillator.syncFrequency();
		return this;
	};

	/**
	 *  unsync the LFO from transport control
	 *  @returns {Tone.LFO} `this`
	 */
	Tone.LFO.prototype.unsync = function(){
		this.oscillator.unsync();
		this.oscillator.unsyncFrequency();
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
			return this._scaler.min;
		},
		set : function(min){
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
			return this._scaler.max;
		},
		set : function(max){
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
			return this.oscillator.type;
		},
		set : function(type){
			this.oscillator.type = type;
		}
	});

	/**
	 * The phase of the LFO
	 * @memberOf Tone.LFO#
	 * @type {string}
	 * @name phase
	 */
	 Object.defineProperty(Tone.LFO.prototype, "phase", {
		get : function(){
			return this.oscillator.phase;
		},
		set : function(phase){
			this.oscillator.phase = phase;
		}
	});

	/**
	 *	Override the connect method so that it 0's out the value 
	 *	if attached to an AudioParam or Tone.Signal. Borrowed from {@link Tone.Signal}
	 *  @function
	 */
	Tone.LFO.prototype.connect = Tone.Signal.prototype.connect;

	/**
	 *  disconnect and dispose
	 *  @returns {Tone.LFO} `this`
	 */
	Tone.LFO.prototype.dispose = function(){
		Tone.prototype.dispose.call(this);
		this.oscillator.dispose();
		this.oscillator = null;
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