define(["Tone/core/Tone", "Tone/component/Envelope", "Tone/source/Oscillator", 
	"Tone/signal/Signal", "Tone/component/Filter", "Tone/signal/Add", "Tone/source/Source"], 
function(Tone){

	"use strict";

	/**
	 *  @class  the MonoSynth is a single oscillator, monophonic synthesizer
	 *          with vibrato, portamento, and a detuned unison
	 *
	 *  @constructor
	 *  @extends {Tone}
	 *  @param {Object} options the options available for the synth 
	 *                          see defaults below
	 */
	Tone.MonoSynth = function(options){

		//get the defaults
		options = this.defaultArg(options, Tone.MonoSynth.defaults);

		/**
		 *  the output
		 *  @type {GainNode}
		 */
		this.output = this.context.createGain();

		/**
		 *  the portamento (glide) time between notes in seconds
		 *  @type {number}
		 */
		this.portamento = this.toSeconds(options.portamento);

		/**
		 *  the first oscillator
		 *  @type {Tone.Oscillator}
		 *  @private
		 */
		this.oscillator = new Tone.Oscillator(0, options.oscType);

		/**
		 *  the frequency control signal
		 *  @type {Tone.Signal}
		 */
		this.frequency = this.oscillator.frequency;

		/**
		 *  the detune control signal
		 *  @type {Tone.Signal}
		 */
		this.detune = this.oscillator.detune;

		/**
		 *  the filter
		 *  @type {Tone.Filter}
		 *  @private
		 */
		this.filter = new Tone.Filter(options.filter);

		/**
		 *  the filter envelope
		 *  @type {Tone.Envelope}
		 */
		this.filterEnvelope = new Tone.Envelope(options.filterEnvelope);

		/**
		 *  the amplitude envelope
		 *  @type {Tone.Envelope}
		 */
		this.envelope = new Tone.Envelope(options.envelope);

		/**
		 *  the amplitude
		 *  @type {GainNode}
		 */
		this._amplitude = this.context.createGain();

		//connect the oscillators to the output
		this.oscillator.connect(this.filter);
		this.filter.connect(this._amplitude);
		//start the oscillators
		this.oscillator.start();
		//connect the envelopes
		this.filterEnvelope.connect(this.filter.frequency);
		this.envelope.connect(this._amplitude.gain);
		this._amplitude.connect(this.output);
	};

	Tone.extend(Tone.MonoSynth);

	/**
	 *  @static
	 */
	Tone.MonoSynth.defaults = {
		/** @type {Tone.Time} the glide time between notes */
		"portamento" : 0.05,
		/** @type {string} the type of the first oscillator */
		"oscType" : "square",
		/** @type {Object} the filter properties */
		"filter" : {
			"Q" : 6,
			"frequency" : 4000,
			"type" : "lowpass",
			"rolloff" : -24
		},
		/** @type {Object} the envelope properties */
		"envelope" : {
			"attack" : 0.005,
			"decay" : 0.1,
			"sustain" : 0.9,
			"release" : 1
		},
		/** @type {Object} the filter envelope properties */
		"filterEnvelope" : {
			"attack" : 0.06,
			"decay" : 0.2,
			"sustain" : 0.5,
			"release" : 2,
			"min" : 10,
			"max" : 4000
		}
	};

	/**
	 *  start the attack portion of the envelope
	 *  @param {string|number} note if a string, either a note name
	 *                              (i.e. C4, A#3) or a number in hertz
	 *  @param {Tone.Time=} [time=now] the time the attack should start
	 */
	Tone.MonoSynth.prototype.triggerAttack = function(note, time){
		//the envelopes
		this.envelope.triggerAttack(time);
		this.filterEnvelope.triggerExponentialAttack(time);
		//the port glide
		if (this.portamento > 0){
			var currentNote = this.frequency.getValue();
			time = this.toSeconds(time);
			this.frequency.setValueAtTime(currentNote, time);
			this.frequency.exponentialRampToValueAtTime(note, time + this.portamento);
		} else {
			this.frequency.setValueAtTime(note, time);
		}
	};

	/**
	 *  start the release portion of the envelope
	 *  @param {Tone.Time=} [time=now] the time the release should start
	 */
	Tone.MonoSynth.prototype.triggerRelease = function(time){
		this.envelope.triggerRelease(time);
		this.filterEnvelope.triggerExponentialRelease(time);
	};

	/**
	 *  set the oscillator type
	 *  @param {string} oscType the type of oscillator
	 */
	Tone.MonoSynth.prototype.setOscType = function(type){
		this.oscillator.setType(type);
	};

	/**
	 *  set the glide time between notes
	 *  @param {Tone.Time} port glide time
	 */
	Tone.MonoSynth.prototype.setPortamento = function(port){
		this.portamento = this.toSeconds(port);
	};

	/**
	 *  set the volume of the instrument.
	 *  borrowed from {@link Tone.Source}
	 *  @function
	 */
	Tone.MonoSynth.prototype.setVolume = Tone.Source.prototype.setVolume;

	/**
	 *  set the members at once
	 *  @param {Object} params all of the parameters as an object.
	 *                         params for envelope and filterEnvelope 
	 *                         should be nested objects. 
	 */
	Tone.MonoSynth.prototype.set = function(params){
		if (!this.isUndef(params.detune)) this.detune.setValue(params.detune);
		if (!this.isUndef(params.volume)) this.setVolume(params.volume);
		if (!this.isUndef(params.portamento)) this.setPortamento(params.portamento);
		if (!this.isUndef(params.oscType)) this.setOscType(params.oscType);
		if (!this.isUndef(params.filterEnvelope)) this.filterEnvelope.set(params.filterEnvelope);
		if (!this.isUndef(params.envelope)) this.envelope.set(params.envelope);
		if (!this.isUndef(params.filter)) this.filter.set(params.filter);
	};

	/**
	 *  clean up
	 */
	Tone.MonoSynth.prototype.dispose = function(){
		Tone.prototype.dispose.call(this);
		this.oscillator.dispose();
		this.envelope.dispose();
		this.filterEnvelope.dispose();
		this.frequency.dispose();
		this.filter.dispose();
		this.detune.dispose();
		this._unison.dispose();
		this.oscillator = null;
		this.frequency = null;
		this.filterEnvelope = null;
		this.envelope = null;
		this.filter = null;
		this.detune = null;
		this._unison = null;
	};

	return Tone.MonoSynth;
});