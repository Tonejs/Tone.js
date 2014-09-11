define(["Tone/core/Tone", "Tone/source/Source", "Tone/signal/Signal", "Tone/core/Note"], function(Tone){

	"use strict";

	/**
	 *  @class  this is a base class for monophonic instruments. 
	 *          it defines their interfaces
	 *
	 *  @constructor
	 *  @abstract
	 *  @extends {Tone}
	 */
	Tone.Monophonic = function(options){

		//get the defaults
		options = this.defaultArg(options, Tone.Monophonic.defaults);

		/**
		 *  the instrument's output
		 *  @type {GainNode}
		 */
		this.output = this.context.createGain();

		/**
		 *  the portamento time
		 *  @type {number}
		 */
		this.portamento = options.portamento;
	};

	Tone.extend(Tone.Monophonic);

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
	 *  @param  {Tone.Time=} [time=now]     the time, if not given is now
	 *  @param  {number=} [velocity=1] velocity defaults to 1
	 */
	Tone.Monophonic.prototype.triggerAttack = function(note, time, velocity) {
		time = this.toSeconds(time);
		this.triggerEnvelopeAttack(time, velocity);
		this.setNote(note, time);
	};

	/**
	 *  trigger the attack and release after the specified duration
	 *  
	 *  @param  {number|string} note     the note as a number or a string note name
	 *  @param  {Tone.Time} duration the duration of the note
	 *  @param  {Tone.Time=} time     if no time is given, defaults to now
	 *  @param  {number=} velocity the velocity of the attack (0-1)
	 */
	Tone.Monophonic.prototype.triggerAttackRelease = function(note, duration, time, velocity) {
		time = this.toSeconds(time);
		this.triggerAttack(note, time, velocity);
		this.triggerRelease(time + this.toSeconds(duration));
	};

	/**
	 *  trigger the release portion of the envelope
	 *  @param  {Tone.Time=} [time=now] if no time is given, the release happens immediatly
	 */
	Tone.Monophonic.prototype.triggerRelease = function(time){
		this.triggerEnvelopeRelease(time);
	};

	/**
	 *  override this method with the actual method
	 *  @abstract
	 *  @param {Tone.Time=} [time=now] the time the attack should happen
	 *  @param {number=} [velocity=1] the velocity of the envelope
	 */	
	Tone.Monophonic.prototype.triggerEnvelopeAttack = function() {};

	/**
	 *  override this method with the actual method
	 *  @abstract
	 *  @param {Tone.Time=} [time=now] the time the attack should happen
	 *  @param {number=} [velocity=1] the velocity of the envelope
	 */	
	Tone.Monophonic.prototype.triggerEnvelopeRelease = function() {};

	/**
	 *  set the note to happen at a specific time
	 *  @param {number|string} note if the note is a string, it will be 
	 *                              parsed as (NoteName)(Octave) i.e. A4, C#3, etc
	 *                              otherwise it will be considered as the frequency
	 */
	Tone.Monophonic.prototype.setNote = function(note, time){
		if (typeof note === "string"){
			note = this.noteToFrequency(note);
		}
		time = this.toSeconds(time);
		if (this.portamento > 0){
			var currentNote = this.frequency.getValue();
			this.frequency.setValueAtTime(currentNote, time);
			this.frequency.exponentialRampToValueAtTime(note, time + this.portamento);
		} else {
			this.frequency.setValueAtTime(note, time);
		}
	};

	/**
	 *  set the glide time between notes
	 *  @param {Tone.Time} port glide time
	 */
	Tone.Monophonic.prototype.setPortamento = function(port){
		this.portamento = this.toSeconds(port);
	};

	/**
	 *  set volume method borrowed form {@link Tone.Source}
	 *  @function
	 */
	Tone.Monophonic.prototype.setVolume = Tone.Source.prototype.setVolume;

	/**
	 *  bulk setter
	 *  @param {Object} params the params
	 */
	Tone.Monophonic.prototype.set = function(params) {
		if (!this.isUndef(params.volume)) this.setVolume(params.volume);
		if (!this.isUndef(params.portamento)) this.setPortamento(params.portamento);
	};

	/**
	 *  set the preset if it exists
	 *  @param {string} presetName the name of the preset
	 */
	Tone.Monophonic.prototype.setPreset = function(presetName){
		if (!this.isUndef(this.preset) && this.preset.hasOwnProperty(presetName)){
			this.set(this.preset[presetName]);
		}
	};

	/**
	 *  clean up
	 */
	Tone.Monophonic.prototype.dispose = function(){
		Tone.prototype.dispose.call(this);
	};

	return Tone.Monophonic;
});