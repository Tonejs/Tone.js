define(["../core/Tone", "../instrument/Instrument", "../signal/Signal"], function(Tone){

	"use strict";

	/**
	 *  @class  This is an abstract base class for other monophonic instruments to 
	 *          extend. IMPORTANT: It does not make any sound on its own and
	 *          shouldn't be directly instantiated.
	 *
	 *  @constructor
	 *  @abstract
	 *  @extends {Tone.Instrument}
	 */
	Tone.Monophonic = function(options){

		//get the defaults
		options = Tone.defaultArg(options, Tone.Monophonic.defaults);
		Tone.Instrument.call(this, options);

		/**
		 *  The glide time between notes. 
		 *  @type {Time}
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
	 *  Trigger the attack of the note optionally with a given velocity. 
	 *  
	 *  
	 *  @param  {Frequency} note     The note to trigger.
	 *  @param  {Time} [time=now]     When the note should start.
	 *  @param  {number} [velocity=1] velocity The velocity scaler 
	 *                                determines how "loud" the note 
	 *                                will be triggered.
	 *  @returns {Tone.Monophonic} this
	 *  @example
	 * synth.triggerAttack("C4");
	 *  @example
	 * //trigger the note a half second from now at half velocity
	 * synth.triggerAttack("C4", "+0.5", 0.5);
	 */
	Tone.Monophonic.prototype.triggerAttack = function(note, time, velocity){
		this.log("triggerAttack", note, time, velocity);
		time = this.toSeconds(time);
		this._triggerEnvelopeAttack(time, velocity);
		this.setNote(note, time);
		return this;
	};

	/**
	 *  Trigger the release portion of the envelope
	 *  @param  {Time} [time=now] If no time is given, the release happens immediatly
	 *  @returns {Tone.Monophonic} this
	 *  @example
	 * synth.triggerRelease();
	 */
	Tone.Monophonic.prototype.triggerRelease = function(time){
		this.log("triggerRelease", time);
		time = this.toSeconds(time);
		this._triggerEnvelopeRelease(time);
		return this;
	};

	/**
	 *  override this method with the actual method
	 *  @abstract
	 *  @private
	 */	
	Tone.Monophonic.prototype._triggerEnvelopeAttack = function(){};

	/**
	 *  override this method with the actual method
	 *  @abstract
	 *  @private
	 */	
	Tone.Monophonic.prototype._triggerEnvelopeRelease = function(){};

	/**
	 *  Get the level of the output at the given time. Measures
	 *  the envelope(s) value at the time. 
	 *  @param {Time} time The time to query the envelope value
	 *  @return {NormalRange} The output level between 0-1
	 */
	Tone.Monophonic.prototype.getLevelAtTime = function(time){
		time = this.toSeconds(time);
		return this.envelope.getValueAtTime(time);
	};

	/**
	 *  Set the note at the given time. If no time is given, the note
	 *  will set immediately. 
	 *  @param {Frequency} note The note to change to.
	 *  @param  {Time} [time=now] The time when the note should be set. 
	 *  @returns {Tone.Monophonic} this
	 * @example
	 * //change to F#6 in one quarter note from now.
	 * synth.setNote("F#6", "+4n");
	 * @example
	 * //change to Bb4 right now
	 * synth.setNote("Bb4");
	 */
	Tone.Monophonic.prototype.setNote = function(note, time){
		time = this.toSeconds(time);
		if (this.portamento > 0 && this.getLevelAtTime(time) > 0.05){
			var portTime = this.toSeconds(this.portamento);
			this.frequency.exponentialRampTo(note, portTime, time);
		} else {
			this.frequency.setValueAtTime(note, time);
		}
		return this;
	};

	return Tone.Monophonic;
});
