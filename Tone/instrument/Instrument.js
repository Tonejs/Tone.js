define(["../core/Tone", "../type/Type", "../core/Master"], function(Tone){

	"use strict";

	/**
	 *  @class  Base-class for all instruments
	 *
	 *  @constructor
	 *  @extends {Tone.AudioNode}
	 */
	Tone.Instrument = function(options){

		//get the defaults
		options = Tone.defaultArg(options, Tone.Instrument.defaults);
		Tone.AudioNode.call(this);

		/**
		 *  The output and volume triming node
		 *  @type  {Tone.Volume}
		 *  @private
		 */
		this._volume = this.output = new Tone.Volume(options.volume);

		/**
		 * The volume of the output in decibels.
		 * @type {Decibels}
		 * @signal
		 * @example
		 * source.volume.value = -6;
		 */
		this.volume = this._volume.volume;
		this._readOnly("volume");

		/**
		 * Keep track of all events scheduled to the transport
		 * when the instrument is 'synced'
		 * @type {Array<Number>}
		 * @private
		 */
		this._scheduledEvents = [];
	};

	Tone.extend(Tone.Instrument, Tone.AudioNode);

	/**
	 *  the default attributes
	 *  @type {object}
	 */
	Tone.Instrument.defaults = {
		/** the volume of the output in decibels */
		"volume" : 0
	};

	/**
	 *  @abstract
	 *  @param {string|number} note the note to trigger
	 *  @param {Time} [time=now] the time to trigger the ntoe
	 *  @param {number} [velocity=1] the velocity to trigger the note
	 */
	Tone.Instrument.prototype.triggerAttack = Tone.noOp;

	/**
	 *  @abstract
	 *  @param {Time} [time=now] when to trigger the release
	 */
	Tone.Instrument.prototype.triggerRelease = Tone.noOp;

	/**
	 * Sync the instrument to the Transport. All subsequent calls of
	 * [triggerAttack](#triggerattack) and [triggerRelease](#triggerrelease)
	 * will be scheduled along the transport.
	 * @example
	 * instrument.sync()
	 * //schedule 3 notes when the transport first starts
	 * instrument.triggerAttackRelease('C4', '8n', 0)
	 * instrument.triggerAttackRelease('E4', '8n', '8n')
	 * instrument.triggerAttackRelease('G4', '8n', '4n')
	 * //start the transport to hear the notes
	 * Transport.start()
	 * @returns {Tone.Instrument} this
	 */
	Tone.Instrument.prototype.sync = function(){
		this._syncMethod("triggerAttack", 1);
		this._syncMethod("triggerRelease", 0);
		return this;
	};

	/**
	 * Wrap the given method so that it can be synchronized
	 * @param {String} method Which method to wrap and sync
	 * @param  {Number} timePosition What position the time argument appears in
	 * @private
	 */
	Tone.Instrument.prototype._syncMethod = function(method, timePosition){
		var originalMethod = this["_original_"+method] = this[method];
		this[method] = function(){
			var args = Array.prototype.slice.call(arguments);
			var time = args[timePosition];
			var id = Tone.Transport.schedule(function(t){
				args[timePosition] = t;
				originalMethod.apply(this, args);
			}.bind(this), time);
			this._scheduledEvents.push(id);
		}.bind(this);
	};

	/**
	 * Unsync the instrument from the Transport
	 * @returns {Tone.Instrument} this
	 */
	Tone.Instrument.prototype.unsync = function(){
		this._scheduledEvents.forEach(function(id){
			Tone.Transport.clear(id);
		});
		this._scheduledEvents = [];
		if (this._original_triggerAttack){
			this.triggerAttack = this._original_triggerAttack;
			this.triggerRelease = this._original_triggerRelease;
		}
		return this;
	};

	/**
	 *  Trigger the attack and then the release after the duration.
	 *  @param  {Frequency} note     The note to trigger.
	 *  @param  {Time} duration How long the note should be held for before
	 *                          triggering the release. This value must be greater than 0.
	 *  @param {Time} [time=now]  When the note should be triggered.
	 *  @param  {NormalRange} [velocity=1] The velocity the note should be triggered at.
	 *  @returns {Tone.Instrument} this
	 *  @example
	 * //trigger "C4" for the duration of an 8th note
	 * synth.triggerAttackRelease("C4", "8n");
	 */
	Tone.Instrument.prototype.triggerAttackRelease = function(note, duration, time, velocity){
		time = this.toSeconds(time);
		duration = this.toSeconds(duration);
		this.triggerAttack(note, time, velocity);
		this.triggerRelease(time + duration);
		return this;
	};

	/**
	 *  clean up
	 *  @returns {Tone.Instrument} this
	 */
	Tone.Instrument.prototype.dispose = function(){
		Tone.AudioNode.prototype.dispose.call(this);
		this._volume.dispose();
		this._volume = null;
		this._writable(["volume"]);
		this.volume = null;
		this.unsync();
		this._scheduledEvents = null;
		return this;
	};

	return Tone.Instrument;
});
