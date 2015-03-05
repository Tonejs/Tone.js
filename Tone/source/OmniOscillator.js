define(["Tone/core/Tone", "Tone/source/Source", "Tone/source/Oscillator", 
	"Tone/source/PulseOscillator", "Tone/source/PWMOscillator"], 
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
	 *  @example
	 *  var omniOsc = new Tone.OmniOscillator("C#4", "pwm");
	 */
	Tone.OmniOscillator = function(){
		var options = this.optionsObject(arguments, ["frequency", "type"], Tone.OmniOscillator.defaults);
		Tone.Source.call(this, options);

		/**
		 *  the frequency control
		 *  @type {Tone.Signal}
		 */
		this.frequency = new Tone.Signal(options.frequency, Tone.Signal.Units.Frequency);

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

		//set the oscillator
		this.type = options.type;
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
	};

	/**
	 *  @enum {string}
	 *  @private
	 */
	var OmniOscType = {
		PulseOscillator : "PulseOscillator",
		PWMOscillator : "PWMOscillator",
		Oscillator : "Oscillator"
	};

	/**
	 *  start the oscillator
	 *  @param {Tone.Time} [time=now] the time to start the oscillator
	 *  @private
	 */
	Tone.OmniOscillator.prototype._start = function(time){
		this._oscillator.start(time);
	};

	/**
	 *  start the oscillator
	 *  @param {Tone.Time} [time=now] the time to start the oscillator
	 *  @private
	 */
	Tone.OmniOscillator.prototype._stop = function(time){
		this._oscillator.stop(time);
	};

	/**
	 * The type of the oscillator. sine, square, triangle, sawtooth, pwm, or pulse. 
	 *  
	 * @memberOf Tone.OmniOscillator#
	 * @type {string}
	 * @name type
	 */
	Object.defineProperty(Tone.OmniOscillator.prototype, "type", {
		get : function(){
			return this._oscillator.type;
		}, 
		set : function(type){
			if (type === "sine" || type === "square" || type === "triangle" || type === "sawtooth"){
				if (this._sourceType !== OmniOscType.Oscillator){
					this._sourceType = OmniOscType.Oscillator;
					this._createNewOscillator(Tone.Oscillator);
				}
				this._oscillator.type = type;
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
	};

	/**
	 * The phase of the oscillator in degrees
	 * @memberOf Tone.OmniOscillator#
	 * @type {number}
	 * @name phase
	 */
	Object.defineProperty(Tone.OmniOscillator.prototype, "phase", {
		get : function(){
			return this._oscillator.phase;
		}, 
		set : function(phase){
			this._oscillator.phase = phase;
		}
	});

	/**
	 * The width of the oscillator (only if the oscillator is set to pulse)
	 * @memberOf Tone.OmniOscillator#
	 * @type {Tone.Signal}
	 * @name width
	 * @example
	 * var omniOsc = new Tone.OmniOscillator(440, "pulse");
	 * //can access the width attribute only if type === "pulse"
	 * omniOsc.width.value = 0.2; 
	 */
	Object.defineProperty(Tone.OmniOscillator.prototype, "width", {
		get : function(){
			if (this._sourceType === OmniOscType.PulseOscillator){
				return this._oscillator.width;
			} 
		}
	});

	/**
	 * The modulationFrequency Signal of the oscillator 
	 * (only if the oscillator type is set to pwm).
	 * @memberOf Tone.OmniOscillator#
	 * @type {Tone.Signal}
	 * @name modulationFrequency
	 * @example
	 * var omniOsc = new Tone.OmniOscillator(440, "pwm");
	 * //can access the modulationFrequency attribute only if type === "pwm"
	 * omniOsc.modulationFrequency.value = 0.2; 
	 */
	Object.defineProperty(Tone.OmniOscillator.prototype, "modulationFrequency", {
		get : function(){
			if (this._sourceType === OmniOscType.PWMOscillator){
				return this._oscillator.modulationFrequency;
			} 
		}
	});

	/**
	 *  clean up
	 *  @return {Tone.OmniOscillator} `this`
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

	return Tone.OmniOscillator;
});