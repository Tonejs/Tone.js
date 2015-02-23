define(["Tone/core/Tone", "Tone/instrument/Instrument", "Tone/signal/Signal"], function(Tone){

	"use strict";

	/**
	 *  @class  this is a base class for monophonic instruments. 
	 *          it defines their interfaces
	 *
	 *  @constructor
	 *  @abstract
	 *  @extends {Tone.Instrument}
	 */
	Tone.Monophonic = function(options){

		Tone.Instrument.call(this);

		//get the defaults
		options = this.defaultArg(options, Tone.Monophonic.defaults);

		/**
		 *  The glide time between notes. 
		 *  @type {Tone.Time}
		 */
		this.portamento = options.portamento;
	};

	Tone.extend(Tone.Monophonic, Tone.Instrument);

	/**
	 *  @static
	 *  @const
	 *  @type {Object}
	 */
	Tone.Monophonic.defaults = {
		"portamento" : 0
	};

	/**
	 *  trigger the attack. start the note, at the time with the velocity
	 *  
	 *  @param  {string|string} note     the note
	 *  @param  {Tone.Time} [time=now]     the time, if not given is now
	 *  @param  {number} [velocity=1] velocity defaults to 1
	 *  @returns {Tone.Monophonic} `this`
	 */
	Tone.Monophonic.prototype.triggerAttack = function(note, time, velocity) {
		time = this.toSeconds(time);
		this.triggerEnvelopeAttack(time, velocity);
		this.setNote(note, time);
		return this;
	};

	/**
	 *  trigger the release portion of the envelope
	 *  @param  {Tone.Time} [time=now] if no time is given, the release happens immediatly
	 *  @returns {Tone.Monophonic} `this`
	 */
	Tone.Monophonic.prototype.triggerRelease = function(time){
		this.triggerEnvelopeRelease(time);
		return this;
	};

	/**
	 *  override this method with the actual method
	 *  @abstract
	 *  @param {Tone.Time} [time=now] the time the attack should happen
	 *  @param {number} [velocity=1] the velocity of the envelope
	 *  @returns {Tone.Monophonic} `this`
	 */	
	Tone.Monophonic.prototype.triggerEnvelopeAttack = function() {};

	/**
	 *  override this method with the actual method
	 *  @abstract
	 *  @param {Tone.Time} [time=now] the time the attack should happen
	 *  @param {number} [velocity=1] the velocity of the envelope
	 *  @returns {Tone.Monophonic} `this`
	 */	
	Tone.Monophonic.prototype.triggerEnvelopeRelease = function() {};

	/**
	 *  set the note to happen at a specific time
	 *  @param {number|string} note if the note is a string, it will be 
	 *                              parsed as (NoteName)(Octave) i.e. A4, C#3, etc
	 *                              otherwise it will be considered as the frequency
	 *  @returns {Tone.Monophonic} `this`
	 */
	Tone.Monophonic.prototype.setNote = function(note, time){
		time = this.toSeconds(time);
		if (this.portamento > 0){
			var currentNote = this.frequency.value;
			this.frequency.setValueAtTime(currentNote, time);
			var portTime = this.toSeconds(this.portamento);
			this.frequency.exponentialRampToValueAtTime(note, time + portTime);
		} else {
			this.frequency.setValueAtTime(note, time);
		}
		return this;
	};

	return Tone.Monophonic;
});