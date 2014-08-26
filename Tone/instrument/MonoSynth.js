define(["Tone/core/Tone", "Tone/component/Envelope", "Tone/source/Oscillator", 
	"Tone/signal/Signal", "Tone/component/Filter", "Tone/signal/Add"], 
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
		 *  the frequency control signal
		 *  @type {Tone.Signal}
		 */
		this.frequency = new Tone.Signal(440);

		/**
		 *  the detune control signal
		 *  @type {Tone.Signal}
		 */
		this.detune = new Tone.Signal(0);

		/**
		 *  the unison difference between the two oscillators
		 *  @type {Tone.Add}
		 *  @private
		 */
		this._unison = new Tone.Add(options.unison);

		/**
		 *  the first oscillator
		 *  @type {Tone.Oscillator}
		 *  @private
		 */
		this._osc0 = new Tone.Oscillator(0, options.osc0Type);

		/**
		 *  the second oscillator
		 *  @type {Tone.Oscillator}
		 *  @private
		 */
		this._osc1 = new Tone.Oscillator(0, options.osc1Type);

		/**
		 *  the filter
		 *  @type {Tone.Filter}
		 *  @private
		 */
		this._filter = new Tone.Filter(options.filter);

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

		//sync the oscillator frequecies to the master frequency
		this.fan(this.frequency, this._osc0.frequency, this._osc1.frequency);
		//connect the oscillators to the output
		this._osc0.connect(this._filter);
		this._osc1.connect(this._filter);
		this._filter.connect(this.output);
		//start the oscillators
		this._osc0.start();
		this._osc1.start();
		//connect the envelopes
		this.filterEnvelope.connect(this._filter.frequency);
		this.envelope.connect(this.output.gain);
		this.detune.connect(this._osc0.detune);
		this.chain(this.detune, this._unison, this._osc1.detune);
	};

	Tone.extend(Tone.MonoSynth);

	/**
	 *  @static
	 */
	Tone.MonoSynth.defaults = {
		/** @type {Tone.Time} the glide time between notes */
		"portamento" : 0.05,
		/** @type {string} the type of the first oscillator */
		"osc0Type" : "square",
		/** @type {string} the type of the first oscillator */
		"osc1Type" : "sawtooth",
		/** @type {number} the detune between the unison oscillators */
		"unison" : 0,
		/** @type {Object} the filter properties */
		"filter" : {
			"Q" : 6,
			"frequency" : 4000,
			"type" : "lowpass"
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
	 *  @param {number=} oscNumber which oscillator to set.
	 *                             no argument will set both
	 */
	Tone.MonoSynth.prototype.setOscType = function(type, oscNumber){
		if (this.isUndef(oscNumber)){
			this._osc0.setType(type);
			this._osc1.setType(type);
		} else if (oscNumber === 0){
			this._osc0.setType(type);
		} else {
			this._osc1.setType(type);
		}
	};

	/**
	 *  set the detune between the oscillators
	 *  @param {number} unisonDetune detune value in cents
	 */
	Tone.MonoSynth.prototype.setUnison = function(unisonDetune){
		this._unison.setValue(unisonDetune);
	};

	/**
	 *  set the glide time between notes
	 *  @param {Tone.Time} port glide time
	 */
	Tone.MonoSynth.prototype.setPortamento = function(port){
		this.portamento = this.toSeconds(port);
	};

	/**
	 *  set the members at once
	 *  @param {Object} params all of the parameters as an object.
	 *                         params for envelope and filterEnvelope 
	 *                         should be nested objects. 
	 */
	Tone.MonoSynth.prototype.set = function(params){
		if (!this.isUndef(params.unison)) this.setUnison(params.unison);
		if (!this.isUndef(params.portamento)) this.setPortamento(params.portamento);
		if (!this.isUndef(params.osc0Type)) this.setOscType(params.osc0Type, 0);
		if (!this.isUndef(params.osc1Type)) this.setOscType(params.osc1Type, 1);
		if (!this.isUndef(params.filterEnvelope)) this.filterEnvelope.set(params.filterEnvelope);
		if (!this.isUndef(params.envelope)) this.envelope.set(params.envelope);
		if (!this.isUndef(params.filter)) this._filter.set(params.filter);
	};

	/**
	 *  clean up
	 */
	Tone.MonoSynth.prototype.dispose = function(){
		Tone.prototype.dispose.call(this);
		this._osc0.dispose();
		this._osc1.dispose();
		this.envelope.dispose();
		this.filterEnvelope.dispose();
		this.frequency.dispose();
		this._filter.dispose();
		this.detune.dispose();
		this._unison.dispose();
		this._osc0 = null;
		this._osc1 = null;
		this.frequency = null;
		this.filterEnvelope = null;
		this.envelope = null;
		this._filter = null;
		this.detune = null;
		this._unison = null;
	};

	return Tone.MonoSynth;
});