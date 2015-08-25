
define(["Tone/core/Tone", "Tone/source/Oscillator", "Tone/instrument/Instrument", 
	"Tone/component/AmplitudeEnvelope", "Tone/component/Filter", 
	"Tone/signal/Signal", "Tone/signal/Multiply", "Tone/signal/Scale",
	"Tone/source/PWMOscillator", "Tone/instrument/SimpleFM"],
function(Tone){

	"use strict";
	/**
	 *  @class  CymbalSynth is composed of 6 Tone.FMSynths, with their 
	 *  carrier set to a square wave, and the modulator set to a pulse 
	 *  wave. 
	 *  Inspiration from [Sound on Sound](http://www.soundonsound.com/sos/jul02/articles/synthsecrets0702.asp).
	 *
	 *  @constructor
	 *  @extends {Tone.Instrument}
	 *  @param {options} [options] the options availble for the synth
	 *                             see defaults below
	 *  @example
	 * var cymbal = new Tone.CymbalSynth().toMaster();
	 * cymbal.harmonicity.value = 10;
	 * cymbal.triggerAttack();
	 */
	Tone.CymbalSynth = function(options){

		options = this.defaultArg(options, Tone.CymbalSynth.defaults);
		Tone.Instrument.call(this, options);

		/**
		 * The initial strike component of the cymbal hit.
		 * @type {CymbalComponent}
		 */
		this.strike = new CymbalComponent({
			"volume" : options.strike.volume,
			"cutoff" : options.strike.cutoff,
			"frequencyScalar" : 1.886,
			"resonance" : options.strike.resonance,
			"resonanceScalar" : 0.533,
			"envelope" : {
				"attack": options.strike.envelope.attack, 
				"decay": options.strike.envelope.decay, 
			}
		}).connect(this.output);

		/**
		 * The body portion of the cymbal hit.
		 * @type {CymbalComponent}
		 */
		this.body = new CymbalComponent({
			"volume" : options.body.volume,
			"cutoff" : options.body.cutoff,
			"frequencyScalar" : 1.643,
			"resonance" : options.body.resonance,
			"resonanceScalar" : 0.333,
			"envelope" : {
				"attack": options.body.envelope.attack, 
				"decay": options.body.envelope.decay, 
			}
		}).connect(this.output);

		/**
		 *  [harmonicity description]
		 *  @type {Positive}
		 *  @signal
		 */
		this.harmonicity = new Tone.Signal(options.harmonicity);
		this.harmonicity.units = Tone.Type.Positive;

		/**
		 *  The base frequency for the series of oscillators. 
		 *  All oscillators scale in a harmonic or inharmonic pattern
		 *  depending on the value of the harmonicity.
		 *  @type {Frequency}
		 *  @signal
		 */
		this.frequency = new Tone.Signal(options.frequency, Tone.Type.Frequency);

		/**
		 *  Inharmonic ratio of frequencies based on the Roland TR-808
		 *  Taken from https://ccrma.stanford.edu/papers/tr-808-cymbal-physically-informed-circuit-bendable-digital-model
		 *  @private
		 *  @static
		 *  @type {Array}
		 */
		this.inharmRatios = [1.0, 1.483, 1.932, 2.546, 2.630, 3.897];

		/**
		 *  Harmonic ratio that produces a more pitched cymbal
		 *  @private
		 *  @static
		 *  @type {Array}
		 */
		this.harmRatios = [1.0, 1.5, 2.025, 2.975, 4.0, 6.0];

		/**
		 *  A series of FMSynths
		 *  @private
		 *  @type {Array}
		 */
		this._oscillators = [];

		/**
		 *  Tone.ScaledSignals used for interpolating between harmonic
		 *  and inharmonic ratios
		 *  @private
		 *  @type {Array}
		 */
		this._scaledSignals = [];

		/**
		 *  Tone.Multipliers for frequency multiplication of scaled signals
		 *  @private
		 *  @type {Array}
		 */
		this._freqMult  = [];

		//make all the FMSynths, connect the frequency signals
		for(var i = 0; i < 6; i++){
			this._scaledSignals[i] = new Tone.Scale(this.inharmRatios[i], this.harmRatios[i]);
			this._freqMult[i] = new Tone.Multiply();
			this._oscillators[i] = new Tone.SimpleFM({
				"harmonicity" : 1.5,
				"modulationIndex" : 10,
				"carrier" : {
					"oscillator" : {
						"type" : "square"
					}
				},
				"modulator" : {
					"oscillator" : {
						"type" : "pulse",
						"width" : 0.75
					}
				},
			});
			this.harmonicity.connect(this._scaledSignals[i]);
			this._scaledSignals[i].connect(this._freqMult[i], 0, 0);
			this.frequency.connect(this._freqMult[i], 0, 1);
			this._freqMult[i].connect(this._oscillators[i].frequency);
			this._oscillators[i].connect(this.strike);
			this._oscillators[i].connect(this.body);
			this._oscillators[i].triggerAttack(Tone.context.currentTime);
		}
	};

	Tone.extend(Tone.CymbalSynth, Tone.Instrument);

	/**
	 *  the default values
	 *  @static
	 *  @const
	 *  @type {Object}
	 */
	Tone.CymbalSynth.defaults = {
		"harmonicity" : 0,
		"frequency" : 200,
		"strike" : {
			"volume" : 0,
			"cutoff" : 3500, 
			"resonance" : 6,
			"envelope": { 
				"attack" : 0.01, 
				"decay" : 0.25
			}
		},
		"body" : {
			"volume" : 0,
			"cutoff" : 7000,
			"resonance" : 6,
			"envelope" : {
				"attack" : 0.01,
				"decay" : 1.5
			}


		},
	};

	/**
	 *  Trigger the cymbal at a given time
	 *  @param  {Time} [time=now]     the time, if not given is now
	 *  @param  {Number} [velocity = 1] velocity defaults to 1
	 *  @returns {Tone.Drumsynth} this
	 *  @example
	 *  cymbal.triggerAttack("0:1:1". 0.75);
	 */
	Tone.CymbalSynth.prototype.triggerAttack = function(time, velocity){
		time = this.toSeconds(time);
		this.body.envelope.triggerAttack(time, velocity);
		this.strike.envelope.triggerAttack(time, velocity);
		return this;
	};

	/**
	 *  Trigger the release of the cymbal.
	 *  Can be used to [choke](https://en.wikipedia.org/wiki/Cymbal_choke) 
	 *  the cymbal
	 *  @param  {Time} [time=now] the time the cymbal will release
	 *  @returns {Tone.CymbalSynth} this
	 *  @example
	 *  //set the release to a small amount for a realistic choke
	 *  cymbal.body.envelope.release = 0.2;
	 *  cymbal.triggerAttack("0:0:0");
	 *  cymbal.triggerRelease("0:0:0" + 0.4);
	 */
	Tone.CymbalSynth.prototype.triggerRelease = function(time){
		this.strike.envelope.triggerRelease(time);
		this.body.envelope.triggerRelease(time);
		return this;
	};

	/**
	 * Clean up.
	 * @return {Tone.CymbalSynth} this
	 */
	Tone.CymbalSynth.prototype.dispose = function(){};

	/**
	 * Cymbal part helper class
	 * @private
	 */
	var CymbalComponent = function(options){
		this.output = this.context.createGain();
		this.volume = new Tone.Signal({
			"param" : this.output.gain, 
			"units" : Tone.Type.Decibels,
			"value" : options.volume
		});
		this._readOnly(["volume"]);
		this._highPass = new Tone.Filter({"type" : "highpass"}).connect(this.output);
		this.envelope = new Tone.AmplitudeEnvelope({
			"attack" : options.envelope.attack,
			"decay" : options.envelope.decay,
			"sustain" : 0,
			"release": 0,
			"attackCurve" : "exponential"

		}).connect(this._highPass);
		this.input = new Tone.Filter({
			"type" : "bandpass",
			"Q" : options.Q
		}).connect(this.envelope);
		this.cutoff = new Tone.Signal(options.cutoff).connect(this.input.frequency);
		this._highPassFrequency = new Tone.Multiply(options.frequencyScalar).connect(this._highPass.frequency);
		this.cutoff.connect(this._highPassFrequency);
		this.resonance = new Tone.Signal(options.resonance).connect(this.input.Q);
		this._highPassResonance = new Tone.Multiply(options.resonanceScalar).connect(this._highPass.Q);
		this.resonance.connect(this._highPassResonance);

	};

	Tone.extend(CymbalComponent);

	return Tone.CymbalSynth;
});



