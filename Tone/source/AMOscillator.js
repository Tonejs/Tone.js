define(["../core/Tone", "../source/Source", "../source/Oscillator", "../signal/Multiply",
	"../core/Gain", "../signal/AudioToGain"], function(Tone){

	"use strict";

	/**
	 *  @class Tone.AMOscillator
	 *
	 *  @extends {Tone.Oscillator}
	 *  @constructor
	 *  @param {Frequency} frequency The starting frequency of the oscillator.
	 *  @param {String} type The type of the carrier oscillator.
	 *  @param {String} modulationType The type of the modulator oscillator.
	 *  @example
	 * //a sine oscillator frequency-modulated by a square wave
	 * var fmOsc = new Tone.AMOscillator("Ab3", "sine", "square").toMaster().start();
	 */
	Tone.AMOscillator = function(){

		var options = Tone.defaults(arguments, ["frequency", "type", "modulationType"], Tone.AMOscillator);
		Tone.Source.call(this, options);

		/**
		 *  The carrier oscillator
		 *  @type {Tone.Oscillator}
		 *  @private
		 */
		this._carrier = new Tone.Oscillator(options.frequency, options.type);

		/**
		 *  The oscillator's frequency
		 *  @type {Frequency}
		 *  @signal
		 */
		this.frequency = this._carrier.frequency;

		/**
		 *  The detune control signal.
		 *  @type {Cents}
		 *  @signal
		 */
		this.detune = this._carrier.detune;
		this.detune.value = options.detune;

		/**
		 *  The modulating oscillator
		 *  @type  {Tone.Oscillator}
		 *  @private
		 */
		this._modulator = new Tone.Oscillator(options.frequency, options.modulationType);

		/**
		 *  convert the -1,1 output to 0,1
		 *  @type {Tone.AudioToGain}
		 *  @private
		 */
		this._modulationScale = new Tone.AudioToGain();

		/**
		 *  Harmonicity is the frequency ratio between the carrier and the modulator oscillators.
		 *  A harmonicity of 1 gives both oscillators the same frequency.
		 *  Harmonicity = 2 means a change of an octave.
		 *  @type {Positive}
		 *  @signal
		 *  @example
		 * //pitch the modulator an octave below carrier
		 * synth.harmonicity.value = 0.5;
		 */
		this.harmonicity = new Tone.Multiply(options.harmonicity);
		this.harmonicity.units = Tone.Type.Positive;

		/**
		 *  the node where the modulation happens
		 *  @type {Tone.Gain}
		 *  @private
		 */
		this._modulationNode = new Tone.Gain(0);

		//connections
		this.frequency.chain(this.harmonicity, this._modulator.frequency);
		this.detune.connect(this._modulator.detune);
		this._modulator.chain(this._modulationScale, this._modulationNode.gain);
		this._carrier.chain(this._modulationNode, this.output);

		this.phase = options.phase;

		this._readOnly(["frequency", "detune", "harmonicity"]);
	};

	Tone.extend(Tone.AMOscillator, Tone.Oscillator);

	/**
	 *  default values
	 *  @static
	 *  @type {Object}
	 *  @const
	 */
	Tone.AMOscillator.defaults = {
		"frequency" : 440,
		"detune" : 0,
		"phase" : 0,
		"type" : "sine",
		"modulationType" : "square",
		"harmonicity" : 1
	};

	/**
	 *  start the oscillator
	 *  @param  {Time} [time=now]
	 *  @private
	 */
	Tone.AMOscillator.prototype._start = function(time){
		this._modulator.start(time);
		this._carrier.start(time);
	};

	/**
	 *  stop the oscillator
	 *  @param  {Time} time (optional) timing parameter
	 *  @private
	 */
	Tone.AMOscillator.prototype._stop = function(time){
		this._modulator.stop(time);
		this._carrier.stop(time);
	};

	/**
	 *  restart the oscillator
	 *  @param  {Time} time (optional) timing parameter
	 *  @private
	 */
	Tone.AMOscillator.prototype.restart = function(time){
		this._modulator.restart(time);
		this._carrier.restart(time);
	};

	/**
	 * The type of the carrier oscillator
	 * @memberOf Tone.AMOscillator#
	 * @type {string}
	 * @name type
	 */
	Object.defineProperty(Tone.AMOscillator.prototype, "type", {
		get : function(){
			return this._carrier.type;
		},
		set : function(type){
			this._carrier.type = type;
		}
	});

	/**
	 * The oscillator type without the partialsCount appended to the end
	 * @memberOf Tone.AMOscillator#
	 * @type {string}
	 * @name baseType
	 * @example
	 * osc.type = 'sine2'
	 * osc.baseType //'sine'
	 * osc.partialCount = 2
	 */
	Object.defineProperty(Tone.AMOscillator.prototype, "baseType", {
		get : function(){
			return this._carrier.baseType;
		},
		set : function(baseType){
			this._carrier.baseType = baseType;
		}
	});

	/**
	 * 'partialCount' offers an alternative way to set the number of used partials. 
	 * When partialCount is 0, the maximum number of partials are used when representing
	 * the waveform using the periodicWave. When 'partials' is set, this value is 
	 * not settable, but equals the length of the partials array.
	 * @memberOf Tone.AMOscillator#
	 * @type {Number}
	 * @name partialCount
	 */
	Object.defineProperty(Tone.AMOscillator.prototype, "partialCount", {
		get : function(){
			return this._carrier.partialCount;
		},
		set : function(partialCount){
			this._carrier.partialCount = partialCount;
		}
	});

	/**
	 * The type of the modulator oscillator
	 * @memberOf Tone.AMOscillator#
	 * @type {string}
	 * @name modulationType
	 */
	Object.defineProperty(Tone.AMOscillator.prototype, "modulationType", {
		get : function(){
			return this._modulator.type;
		},
		set : function(type){
			this._modulator.type = type;
		}
	});

	/**
	 * The phase of the oscillator in degrees.
	 * @memberOf Tone.AMOscillator#
	 * @type {number}
	 * @name phase
	 */
	Object.defineProperty(Tone.AMOscillator.prototype, "phase", {
		get : function(){
			return this._carrier.phase;
		},
		set : function(phase){
			this._carrier.phase = phase;
			this._modulator.phase = phase;
		}
	});

	/**
	 * The partials of the carrier waveform. A partial represents
	 * the amplitude at a harmonic. The first harmonic is the
	 * fundamental frequency, the second is the octave and so on
	 * following the harmonic series.
	 * Setting this value will automatically set the type to "custom".
	 * The value is an empty array when the type is not "custom".
	 * @memberOf Tone.AMOscillator#
	 * @type {Array}
	 * @name partials
	 * @example
	 * osc.partials = [1, 0.2, 0.01];
	 */
	Object.defineProperty(Tone.AMOscillator.prototype, "partials", {
		get : function(){
			return this._carrier.partials;
		},
		set : function(partials){
			this._carrier.partials = partials;
		}
	});

	/**
	 *  Clean up.
	 *  @return {Tone.AMOscillator} this
	 */
	Tone.AMOscillator.prototype.dispose = function(){
		Tone.Source.prototype.dispose.call(this);
		this._writable(["frequency", "detune", "harmonicity"]);
		this.frequency = null;
		this.detune = null;
		this.harmonicity.dispose();
		this.harmonicity = null;
		this._carrier.dispose();
		this._carrier = null;
		this._modulator.dispose();
		this._modulator = null;
		this._modulationNode.dispose();
		this._modulationNode = null;
		this._modulationScale.dispose();
		this._modulationScale = null;
		return this;
	};

	return Tone.AMOscillator;
});
