define(["Tone/core/Tone", "Tone/source/OmniOscillator", "Tone/instrument/Instrument",
	"Tone/component/AmplitudeEnvelope"], function(Tone){

	"use strict";

	/**
	 *  @class  Tone.MembraneSynth makes kick and tom sounds using a single oscillator
	 *          with an amplitude envelope and frequency ramp. A Tone.OmniOscillator
	 *          is routed through a Tone.AmplitudeEnvelope to the output. The drum
	 *          quality of the sound comes from the frequency envelope applied
	 *          during Tone.MembraneSynth.triggerAttack(note). The frequency envelope
	 *          starts at <code>note * .octaves</code> and ramps to <code>note</code>
	 *          over the duration of <code>.pitchDecay</code>.
	 *
	 *  @constructor
	 *  @extends {Tone.Instrument}
	 *  @param {Object} [options] the options available for the synth
	 *                          see defaults below
	 *  @example
	 * var synth = new Tone.MembraneSynth().toMaster();
	 * synth.triggerAttackRelease("C2", "8n");
	 */
	Tone.MembraneSynth = function(options){

		options = Tone.defaultArg(options, Tone.MembraneSynth.defaults);
		Tone.Instrument.call(this, options);

		/**
		 *  The oscillator.
		 *  @type {Tone.OmniOscillator}
		 */
		this.oscillator = new Tone.OmniOscillator(options.oscillator);

		/**
		 *  The amplitude envelope.
		 *  @type {Tone.AmplitudeEnvelope}
		 */
		this.envelope = new Tone.AmplitudeEnvelope(options.envelope);

		/**
		 *  The number of octaves the pitch envelope ramps.
		 *  @type {Positive}
		 */
		this.octaves = options.octaves;

		/**
		 *  The amount of time the frequency envelope takes.
		 *  @type {Time}
		 */
		this.pitchDecay = options.pitchDecay;

		this.oscillator.chain(this.envelope, this.output);
		this._readOnly(["oscillator", "envelope"]);
	};

	Tone.extend(Tone.MembraneSynth, Tone.Instrument);

	/**
	 *  @static
	 *  @type {Object}
	 */
	Tone.MembraneSynth.defaults = {
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
	 *  Trigger the note at the given time with the given velocity.
	 *
	 *  @param  {Frequency} note     the note
	 *  @param  {Time} [time=now]     the time, if not given is now
	 *  @param  {number} [velocity=1] velocity defaults to 1
	 *  @returns {Tone.MembraneSynth} this
	 *  @example
	 *  kick.triggerAttack(60);
	 */
	Tone.MembraneSynth.prototype.triggerAttack = function(note, time, velocity){
		time = this.toSeconds(time);
		note = this.toFrequency(note);
		var maxNote = note * this.octaves;
		this.oscillator.frequency.setValueAtTime(maxNote, time);
		this.oscillator.frequency.exponentialRampToValueAtTime(note, time + this.toSeconds(this.pitchDecay));
		this.envelope.triggerAttack(time, velocity);
		this.oscillator.start(time);
		return this;
	};

	/**
	 *  Trigger the release portion of the note.
	 *
	 *  @param  {Time} [time=now] the time the note will release
	 *  @returns {Tone.MembraneSynth} this
	 */
	Tone.MembraneSynth.prototype.triggerRelease = function(time){
		time = this.toSeconds(time);
		this.envelope.triggerRelease(time);
		this.oscillator.stop(time + this.envelope.release);
		return this;
	};

	/**
	 *  Clean up.
	 *  @returns {Tone.MembraneSynth} this
	 */
	Tone.MembraneSynth.prototype.dispose = function(){
		Tone.Instrument.prototype.dispose.call(this);
		this._writable(["oscillator", "envelope"]);
		this.oscillator.dispose();
		this.oscillator = null;
		this.envelope.dispose();
		this.envelope = null;
		return this;
	};

	return Tone.MembraneSynth;
});
