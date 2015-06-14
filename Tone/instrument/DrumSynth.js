define(["Tone/core/Tone", "Tone/source/Oscillator", "Tone/instrument/Instrument", 
	"Tone/component/AmplitudeEnvelope"],
function(Tone){

	"use strict";

	/**
	 *  @class  Tone.DrumSynth makes kick and tom sounds using a single oscillator
	 *          with an amplitude envelope and frequency ramp.
	 *
	 *  @constructor
	 *  @extends {Tone.Instrument}
	 *  @param {Object} [options] the options available for the synth 
	 *                          see defaults below
	 *  @example
	 *  var synth = new Tone.DrumSynth();
	 */
	Tone.DrumSynth = function(options){

		options = this.defaultArg(options, Tone.DrumSynth.defaults);
		Tone.Instrument.call(this, options);

		/**
		 *  The oscillator.
		 *  @type {Tone.Oscillator}
		 */
		this.oscillator = new Tone.Oscillator(options.oscillator).start();

		/**
		 *  The envelope.
		 *  @type {Tone.AmplitudeEnvelope}
		 */
		this.envelope = new Tone.AmplitudeEnvelope(options.envelope);

		/**
		 *  The number of octaves the pitch envelope ramps.
		 *  @type {Positive}
		 */
		this.octaves = options.octaves;

		/**
		 *  The amount of time of the pitch decay.
		 *  @type {Time}
		 */
		this.pitchDecay = options.pitchDecay;

		this.oscillator.chain(this.envelope, this.output);
		this._readOnly(["oscillator", "envelope"]);
	};

	Tone.extend(Tone.DrumSynth, Tone.Instrument);

	/**
	 *  @static
	 *  @type {Object}
	 */
	Tone.DrumSynth.defaults = {
		"pitchDecay" : 0.05,
		"octaves" : 10,
		"oscillator" : {
			"type" : "sine",
		},
		"envelope" : {
			"attack" : 0.001,
			"decay" : 0.4,
			"sustain" : 0.01,
			"release" : 1.4,
			"attackCurve" : "exponential"
		}
	};

	/**
	 *  trigger the attack. start the note, at the time with the velocity
	 *  
	 *  @param  {string|string} note     the note
	 *  @param  {Time} [time=now]     the time, if not given is now
	 *  @param  {number} [velocity=1] velocity defaults to 1
	 *  @returns {Tone.DrumSynth} this
	 *  @example
	 *  kick.triggerAttack(60);
	 */
	Tone.DrumSynth.prototype.triggerAttack = function(note, time, velocity) {
		time = this.toSeconds(time);
		note = this.toFrequency(note);
		var maxNote = note * this.octaves;
		this.oscillator.frequency.setValueAtTime(maxNote, time);
		this.oscillator.frequency.exponentialRampToValueAtTime(note, time + this.toSeconds(this.pitchDecay));
		this.envelope.triggerAttack(time, velocity);
		return this;
	};

	/**
	 *  trigger the release portion of the note
	 *  
	 *  @param  {Time} [time=now] the time the note will release
	 *  @returns {Tone.DrumSynth} this
	 */
	Tone.DrumSynth.prototype.triggerRelease = function(time){
		this.envelope.triggerRelease(time);
		return this;
	};

	/**
	 *  clean up
	 *  @returns {Tone.DrumSynth} this
	 */
	Tone.DrumSynth.prototype.dispose = function(){
		Tone.Instrument.prototype.dispose.call(this);
		this._writable(["oscillator", "envelope"]);
		this.oscillator.dispose();
		this.oscillator = null;
		this.envelope.dispose();
		this.envelope = null;
		return this;
	};

	return Tone.DrumSynth;
});