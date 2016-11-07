define(["Tone/core/Tone", "Tone/source/Player", "Tone/component/AmplitudeEnvelope", "Tone/instrument/Instrument"], 
function(Tone){

	"use strict";

	/**
	 *  @class Sampler wraps Tone.Player in an AmplitudeEnvelope.
	 *
	 *  @constructor
	 *  @extends {Tone.Instrument}
	 *  @param {String} url the url of the audio file
	 *  @param {Function=} onload The callback to invoke when the sample is loaded.
	 *  @example
	 * var sampler = new Sampler("./audio/casio/A1.mp3", function(){
	 * 	//repitch the sample down a half step
	 * 	sampler.triggerAttack(-1);
	 * }).toMaster();
	 */
	Tone.Sampler = function(){

		var options = this.optionsObject(arguments, ["url", "onload"], Tone.Sampler.defaults);
		Tone.Instrument.call(this, options);

		/**
		 *  The sample player.
		 *  @type {Tone.Player}
		 */
		this.player = new Tone.Player(options.url, options.onload);
		this.player.retrigger = true;

		/**
		 *  The amplitude envelope. 
		 *  @type {Tone.AmplitudeEnvelope}
		 */
		this.envelope = new Tone.AmplitudeEnvelope(options.envelope);

		this.player.chain(this.envelope, this.output);
		this._readOnly(["player", "envelope"]);
		this.loop = options.loop;
		this.reverse = options.reverse;
	};

	Tone.extend(Tone.Sampler, Tone.Instrument);

	/**
	 *  the default parameters
	 *  @static
	 */
	Tone.Sampler.defaults = {
		"onload" : Tone.noOp,
		"loop" : false,
		"reverse" : false,
		"envelope" : {
			"attack" : 0.001,
			"decay" : 0,
			"sustain" : 1,
			"release" : 0.1
		}
	};

	/**
	 *  Trigger the start of the sample. 
	 *  @param {Interval} [pitch=0] The amount the sample should
	 *                              be repitched. 
	 *  @param {Time} [time=now] The time when the sample should start
	 *  @param {NormalRange} [velocity=1] The velocity of the note
	 *  @returns {Tone.Sampler} this
	 *  @example
	 * sampler.triggerAttack(0, "+0.1", 0.5);
	 */
	Tone.Sampler.prototype.triggerAttack = function(pitch, time, velocity){
		time = this.toSeconds(time);
		pitch = this.defaultArg(pitch, 0);
		this.player.playbackRate = this.intervalToFrequencyRatio(pitch);
		this.player.start(time);
		this.envelope.triggerAttack(time, velocity);
		return this;
	};

	/**
	 *  Start the release portion of the sample. Will stop the sample once the 
	 *  envelope has fully released. 
	 *  
	 *  @param {Time} [time=now] The time when the note should release
	 *  @returns {Tone.Sampler} this
	 *  @example
	 * sampler.triggerRelease();
	 */
	Tone.Sampler.prototype.triggerRelease = function(time){
		time = this.toSeconds(time);
		this.envelope.triggerRelease(time);
		this.player.stop(this.toSeconds(this.envelope.release) + time);
		return this;
	};

	/**
	 *  Trigger the attack and then the release after the duration. 
	 *  @param  {Interval} interval     The interval in half-steps that the
	 *                                  sample should be pitch shifted.
	 *  @param  {Time} duration How long the note should be held for before
	 *                          triggering the release.
	 *  @param {Time} [time=now]  When the note should be triggered.
	 *  @param  {NormalRange} [velocity=1] The velocity the note should be triggered at.
	 *  @returns {Tone.Sampler} this
	 *  @example
	 * //trigger the unpitched note for the duration of an 8th note
	 * synth.triggerAttackRelease(0, "8n");
	 *  @memberOf Tone.Sampler#
	 *  @name triggerAttackRelease
	 *  @method triggerAttackRelease
	 */

	/**
	 * If the output sample should loop or not.
	 * @memberOf Tone.Sampler#
	 * @type {number|string}
	 * @name loop
	 */
	Object.defineProperty(Tone.Sampler.prototype, "loop", {
		get : function(){
			return this.player.loop;
		},
		set : function(loop){
			this.player.loop = loop;
		}
	});

	/**
	 * The direction the buffer should play in
	 * @memberOf Tone.Sampler#
	 * @type {boolean}
	 * @name reverse
	 */
	Object.defineProperty(Tone.Sampler.prototype, "reverse", {
		get : function(){
			return this.player.reverse;
		}, 
		set : function(rev){
			this.player.reverse = rev;
		}
	});

	/**
	 * The buffer to play.
	 * @memberOf Tone.Sampler#
	 * @type {Tone.Buffer}
	 * @name buffer
	 */
	Object.defineProperty(Tone.Sampler.prototype, "buffer", {
		get : function(){
			return this.player.buffer;
		}, 
		set : function(buff){
			this.player.buffer = buff;
		}
	});

	/**
	 *  Clean up.
	 *  @returns {Tone.Sampler} this
	 */
	Tone.Sampler.prototype.dispose = function(){
		Tone.Instrument.prototype.dispose.call(this);
		this._writable(["player", "envelope"]);
		this.player.dispose();
		this.player = null;
		this.envelope.dispose();
		this.envelope = null;
		return this;
	};

	return Tone.Sampler;
});