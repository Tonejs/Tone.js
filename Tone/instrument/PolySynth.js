define(["Tone/core/Tone", "Tone/instrument/MonoSynth"], 
function(Tone){

	/**
	 *  @class  Creates a polyphonic synthesizer out of 
	 *          the monophonic voice which is passed in. 
	 *
	 *  @constructor
	 *  @extends {Tone}
	 *  @param {number|Object} [polyphony=6] the number of voices to create
	 *  @param {function=} [voice=Tone.MonoSynth] the constructor of the voices
	 *                                            uses Tone.MonoSynth by default
	 *  @param {Object} voiceOptions the options to pass to the voice                                          
	 */
	Tone.PolySynth = function(){

		var options = this.optionsObject(arguments, ["polyphony", "voice", "voiceOptions"], Tone.PolySynth.defaults);

		/**
		 *  the output
		 *  @type {GainNode}
		 */
		this.output = this.context.createGain();

		/**
		 *  the array of voices
		 *  @private
		 *  @type {Array}
		 */
		this._voices = new Array(options.polyphony);

		/**
		 *  the queue of free voices
		 *  @private
		 *  @type {Array}
		 */
		this._freeVoices = [];

		/**
		 *  keeps track of which notes are down
		 *  @private
		 *  @type {Object}
		 */
		this._activeVoices = {};

		//create the voices
		for (var i = 0; i < options.polyphony; i++){
			var v = new options.voice(options.voiceOptions);
			this._voices[i] = v;
			v.connect(this.output);
		}

		//make a copy of the voices
		this._freeVoices = this._voices.slice(0);
	};

	Tone.extend(Tone.PolySynth);

	/**
	 *  the defaults
	 *  @const
	 *  @static
	 *  @type {Object}
	 */
	Tone.PolySynth.defaults = {
		"polyphony" : 4,
		"voice" : Tone.MonoSynth,
		"voiceOptions" : {
			"portamento" : 0
		}
	};

	/**
	 *  trigger the attack
	 *  @param  {string|number|Object} value the value of the note to start
	 *  @param  {Tone.Time=} [time=now]  the start time of the note
	 *  @param {Tone.Time=} duration if provided, a release will trigger
	 *                               after the duration. 
	 */
	Tone.PolySynth.prototype.triggerAttack = function(value, time, duration){
		var stringified = JSON.stringify(value);
		if (this._activeVoices[stringified]){
			this._activeVoices[stringified].triggerAttack(value, time);
		} else if (this._freeVoices.length > 0){
			var voice = this._freeVoices.shift();
			voice.triggerAttack(value, time);
			this._activeVoices[stringified] = voice;
		}
		if (!this.isUndef(duration)){
			this.triggerRelease(value, this.toSeconds(time) + this.toSeconds(duration));
		}
	};

	/**
	 *  trigger the release of a note
	 *  @param  {string|number|Object} value the value of the note to release
	 *  @param  {Tone.Time=} [time=now]  the release time of the note
	 */
	Tone.PolySynth.prototype.triggerRelease = function(value, time){
		//get the voice
		var stringified = JSON.stringify(value);
		var voice = this._activeVoices[stringified];
		if (voice){
			voice.triggerRelease(time);
			this._freeVoices.push(voice);
			this._activeVoices[stringified] = null;
		}
	};

	/**
	 *  set the options on all of the voices
	 *  @param {Object} params 
	 */
	Tone.PolySynth.prototype.set = function(params){
		for (var i = 0; i < this._voices.length; i++){
			this._voices[i].set(params);
		}
	};

	/**
	 *  clean up
	 */
	Tone.PolySynth.prototype.dispose = function(){
		Tone.prototype.dispose.call(this);
		for (var i = 0; i < this._voices.length; i++){
			this._voices[i].dispose();
			this._voices[i] = null;
		}
		this._voices = null;
		this._activeVoices = null;
		this._freeVoices = null;
	};

	return Tone.PolySynth;
});