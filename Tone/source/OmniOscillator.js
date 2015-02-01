define(["Tone/core/Tone", "Tone/source/Source", "Tone/source/Oscillator", "Tone/source/PulseOscillator", "Tone/source/PWMOscillator"], 
function(Tone){

	"use strict";

	/**
	 *  @class OmniOscillator aggregates Tone.Oscillator, Tone.PulseOscillator,
	 *         and Tone.PWMOscillator which allows it to have the types: 
	 *         sine, square, triangle, sawtooth, pulse or pwm. 
	 *
	 *  @extends {Tone.Oscillator}
	 *  @constructor
	 *  @param {frequency} frequency frequency of the oscillator (meaningless for noise types)
	 *  @param {string} type the type of the oscillator
	 */
	Tone.OmniOscillator = function(){
		var options = this.optionsObject(arguments, ["frequency", "type"], Tone.OmniOscillator.defaults);
		Tone.Source.call(this);

		/**
		 *  the frequency control
		 *  @type {Tone.Signal}
		 */
		this.frequency = new Tone.Signal(options.frequency);

		/**
		 *  the detune control
		 *  @type {Tone.Signal}
		 */
		this.detune = new Tone.Signal(options.detune);

		/**
		 *  the type of the oscillator source
		 *  @type {string}
		 *  @private
		 */
		this._sourceType = undefined;

		/**
		 *  the oscillator
		 *  @type {Tone.Oscillator|Tone.PWMOscillator|Tone.PulseOscillator}
		 *  @private
		 */
		this._oscillator = null;

		/**
		 *  callback which is invoked when the oscillator is stoped
		 *  @type {function()}
		 */
		this.onended = options.onended;

		//set the oscillator
		this.setType(options.type);
	};

	Tone.extend(Tone.OmniOscillator, Tone.Oscillator);

	/**
	 *  default values
	 *  @static
	 *  @type {Object}
	 *  @const
	 */
	Tone.OmniOscillator.defaults = {
		"frequency" : 440,
		"detune" : 0,
		"type" : "sine",
		"width" : 0.4, //only applies if the oscillator is set to "pulse",
		"modulationFrequency" : 0.4, //only applies if the oscillator is set to "pwm",
		"onended" : function(){}
	};

	/**
	 *  start the oscillator
	 *  @param {Tone.Time} [time=now] the time to start the oscillator
	 *  @returns {Tone.OmniOscillator} `this`
	 */
	Tone.OmniOscillator.prototype.start = function(time){
		if (this.state === Tone.Source.State.STOPPED){
			this.state = Tone.Source.State.STARTED;
			this._oscillator.start(time);
		}
		return this;
	};

	/**
	 *  start the oscillator
	 *  @param {Tone.Time} [time=now] the time to start the oscillator
	 *  @returns {Tone.OmniOscillator} `this`
	 */
	Tone.OmniOscillator.prototype.stop = function(time){
		if (this.state === Tone.Source.State.STARTED){
			if (!time){
				this.state = Tone.Source.State.STOPPED;
			}
			this._oscillator.stop(time);
		}
		return this;
	};

	/**
	 *  set the type of the oscillator
	 *  @param {string} type sine|square|triangle|sawtooth|pulse|pwm
	 *  @returns {Tone.OmniOscillator} `this`
	 */
	Tone.OmniOscillator.prototype.setType = function(type){
		if (type === "sine" || type === "square" || type === "triangle" || type === "sawtooth"){
			if (this._sourceType !== OmniOscType.Oscillator){
				this._sourceType = OmniOscType.Oscillator;
				this._createNewOscillator(Tone.Oscillator);
			}
			this._oscillator.setType(type);
		} else if (type === "pwm"){
			if (this._sourceType !== OmniOscType.PWMOscillator){
				this._sourceType = OmniOscType.PWMOscillator;
				this._createNewOscillator(Tone.PWMOscillator);
			}
		} else if (type === "pulse"){
			if (this._sourceType !== OmniOscType.PulseOscillator){
				this._sourceType = OmniOscType.PulseOscillator;
				this._createNewOscillator(Tone.PulseOscillator);
			}
		} else {
			throw new TypeError("Tone.OmniOscillator does not support type "+type);
		}
		return this;
	};

	/**
	 *  @returns {string} the type of oscillator
	 */
	Tone.OmniOscillator.prototype.getType = function(){
		if (this._sourceType === OmniOscType.PulseOscillator){
			return "pulse";
		} else if (this._sourceType === OmniOscType.PWMOscillator){
			return "pwm";
		} else if (this._sourceType === OmniOscType.Oscillator){
			return this._oscillator.getType();
		} 
	};

	/**
	 *  getter/setter for type
	 */
	Object.defineProperty(Tone.OmniOscillator.prototype, "type", {
		get : function(){
			return this.getType();
		},
		set : function(val){
			this.setType(val);
		}
	});

	/**
	 *  connect the oscillator to the frequency and detune signals
	 *  @private
	 */
	Tone.OmniOscillator.prototype._createNewOscillator = function(OscillatorConstructor){
		//short delay to avoid clicks on the change
		var now = this.now() + this.bufferTime;
		if (this._oscillator !== null){
			var oldOsc = this._oscillator;
			oldOsc.stop(now);
			oldOsc.onended = function(){
				oldOsc.dispose();
				oldOsc = null;
			};
		}
		this._oscillator = new OscillatorConstructor();
		this.frequency.connect(this._oscillator.frequency);
		this.detune.connect(this._oscillator.detune);
		this._oscillator.connect(this.output);
		if (this.state === Tone.Source.State.STARTED){
			this._oscillator.start(now);
		}
		this._oscillator.onended = this._onended.bind(this);
	};

	/**
	 *  internal onended callback
	 *  @private
	 */
	Tone.OmniOscillator.prototype._onended = function(){
		this.onended();
	};

	/**
	 *  set the width of the PulseOscillator
	 *  @throws {Error} If the type of oscillator is not "pulse"
	 *  @param {number} width the width of the pulse oscillator
	 *  @returns {Tone.OmniOscillator} `this`
	 */
	Tone.OmniOscillator.prototype.setWidth = function(width){
		if (this._sourceType === OmniOscType.PulseOscillator){
			this._oscillator.setWidth(width);
		} else {
			throw new Error("Invalid call to 'setWidth'. OmniOscillator type must be set to type 'pulse'.");
		}
		return this;
	};

	/**
	 *  set the modulation frequency of the PWMOscillator
	 *  @throws {Error} If the type of oscillator is not "pwm"
	 *  @param {Tone.Time} freq the modulation frequency of the pwm
	 *  @returns {Tone.OmniOscillator} `this`
	 */
	Tone.OmniOscillator.prototype.setModulationFrequency = function(freq){
		if (this._sourceType === OmniOscType.PWMOscillator){
			this._oscillator.setModulationFrequency(freq);
		} else {
			throw new Error("Invalid call to 'setModulationFrequency'. OmniOscillator type must be set to type 'pwm'.");
		}
		return this;
	};

	/**
	 *  bulk setter
	 *  @param {Object} params 
	 *  @returns {Tone.OmniOscillator} `this`
	 */
	Tone.OmniOscillator.prototype.set = function(params){
		if (!this.isUndef(params.type)) this.setType(params.type);
		if (!this.isUndef(params.onended)) this.onended = params.onended;
		if (!this.isUndef(params.frequency)) this.setFrequency(params.frequency);
		if (!this.isUndef(params.detune)) this.detune.setValue(params.detune);
		if (!this.isUndef(params.width)) this.setWidth(params.width);
		if (!this.isUndef(params.modulationFrequency)) this.setModulationFrequency(params.modulationFrequency);
		Tone.Source.prototype.set.call(this, params);
		return this;
	};

	/**
	 *  clean up
	 *  @returns {Tone.OmniOscillator} `this`
	 */
	Tone.OmniOscillator.prototype.dispose = function(){
		Tone.Source.prototype.dispose.call(this);
		this.detune.dispose();
		this.detune = null;
		this.frequency.dispose();
		this.frequency = null;
		this._oscillator.dispose();
		this._oscillator = null;
		this._sourceType = null;
		return this;
	};

	/**
	 *  @enum {string}
	 */
	var OmniOscType = {
		PulseOscillator : "PulseOscillator",
		PWMOscillator : "PWMOscillator",
		Oscillator : "Oscillator"
	};

	return Tone.OmniOscillator;
});