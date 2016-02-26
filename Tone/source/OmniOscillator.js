define(["Tone/core/Tone", "Tone/source/Source", "Tone/source/Oscillator", 
	"Tone/source/PulseOscillator", "Tone/source/PWMOscillator"], 
function(Tone){

	"use strict";

	/**
	 *  @class Tone.OmniOscillator aggregates Tone.Oscillator, Tone.PulseOscillator,
	 *         and Tone.PWMOscillator into one class, allowing it to have the 
	 *         types: sine, square, triangle, sawtooth, pulse or pwm. Additionally,
	 *         OmniOscillator is capable of setting the first x number of partials 
	 *         of the oscillator. For example: "sine4" would set be the first 4 
	 *         partials of the sine wave and "triangle8" would set the first 
	 *         8 partials of the triangle wave. 
	 *
	 *  @extends {Tone.Oscillator}
	 *  @constructor
	 *  @param {Frequency} frequency The initial frequency of the oscillator.
	 *  @param {string} type The type of the oscillator.
	 *  @example
	 *  var omniOsc = new Tone.OmniOscillator("C#4", "pwm");
	 */
	Tone.OmniOscillator = function(){
		var options = this.optionsObject(arguments, ["frequency", "type"], Tone.OmniOscillator.defaults);
		Tone.Source.call(this, options);

		/**
		 *  The frequency control.
		 *  @type {Frequency}
		 *  @signal
		 */
		this.frequency = new Tone.Signal(options.frequency, Tone.Type.Frequency);

		/**
		 *  The detune control
		 *  @type {Cents}
		 *  @signal
		 */
		this.detune = new Tone.Signal(options.detune, Tone.Type.Cents);

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
		this.phase = options.phase;
		this._readOnly(["frequency", "detune"]);
		if (this.isArray(options.partials)){
			this.partials = options.partials;
		}
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
		"phase" : 0,
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
	 *  @param {Time} [time=now] the time to start the oscillator
	 *  @private
	 */
	Tone.OmniOscillator.prototype._start = function(time){
		this._oscillator.start(time);
	};

	/**
	 *  start the oscillator
	 *  @param {Time} [time=now] the time to start the oscillator
	 *  @private
	 */
	Tone.OmniOscillator.prototype._stop = function(time){
		this._oscillator.stop(time);
	};

	/**
	 * The type of the oscillator. sine, square, triangle, sawtooth, pwm, or pulse. 
	 * @memberOf Tone.OmniOscillator#
	 * @type {string}
	 * @name type
	 */
	Object.defineProperty(Tone.OmniOscillator.prototype, "type", {
		get : function(){
			return this._oscillator.type;
		}, 
		set : function(type){
			if (type.indexOf("sine") === 0 || type.indexOf("square") === 0 || 
				type.indexOf("triangle") === 0 || type.indexOf("sawtooth") === 0 || type === Tone.Oscillator.Type.Custom){
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
				throw new Error("Tone.OmniOscillator does not support type "+type);
			}
		}
	});

	/**
	 * The partials of the waveform. A partial represents 
	 * the amplitude at a harmonic. The first harmonic is the 
	 * fundamental frequency, the second is the octave and so on
	 * following the harmonic series. 
	 * Setting this value will automatically set the type to "custom". 
	 * The value is an empty array when the type is not "custom". 
	 * @memberOf Tone.OmniOscillator#
	 * @type {Array}
	 * @name partials
	 * @example
	 * osc.partials = [1, 0.2, 0.01];
	 */
	Object.defineProperty(Tone.OmniOscillator.prototype, "partials", {
		get : function(){
			return this._oscillator.partials;
		}, 
		set : function(partials){
			if (this._sourceType !== OmniOscType.Oscillator){
				this.type = Tone.Oscillator.Type.Custom;
			}
			this._oscillator.partials = partials;
		}
	});

	/**
	 *  connect the oscillator to the frequency and detune signals
	 *  @private
	 */
	Tone.OmniOscillator.prototype._createNewOscillator = function(OscillatorConstructor){
		//short delay to avoid clicks on the change
		var now = this.now() + this.blockTime;
		if (this._oscillator !== null){
			var oldOsc = this._oscillator;
			oldOsc.stop(now);
			//dispose the old one
			setTimeout(function(){
				oldOsc.dispose();
				oldOsc = null;
			}, this.blockTime * 1000);
		}
		this._oscillator = new OscillatorConstructor();
		this.frequency.connect(this._oscillator.frequency);
		this.detune.connect(this._oscillator.detune);
		this._oscillator.connect(this.output);
		if (this.state === Tone.State.Started){
			this._oscillator.start(now);
		}
	};

	/**
	 * The phase of the oscillator in degrees. 
	 * @memberOf Tone.OmniOscillator#
	 * @type {Degrees}
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
	 * @type {NormalRange}
	 * @signal
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
	 * @type {Frequency}
	 * @signal
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
	 *  Clean up.
	 *  @return {Tone.OmniOscillator} this
	 */
	Tone.OmniOscillator.prototype.dispose = function(){
		Tone.Source.prototype.dispose.call(this);
		this._writable(["frequency", "detune"]);
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