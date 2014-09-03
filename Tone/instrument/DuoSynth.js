define(["Tone/core/Tone", "Tone/instrument/MonoSynth", "Tone/component/LFO", "Tone/signal/Signal", "Tone/signal/Multiply"], 
	function(Tone){

	/**
	 *  @class  the DuoSynth is a monophonic synth composed of two 
	 *          MonoSynths run in parallel with control over the 
	 *          frequency ratio between the two voices and vibrato effect.
	 *
	 *  @constructor
	 *  @extends {Tone}
	 *  @param {Object} options the options available for the synth 
	 *                          see defaults below
	 */
	Tone.DuoSynth = function(options){

		options = this.defaultArg(options, Tone.DuoSynth.defaults);

		/**
		 *  the output
		 *  @type {GainNode}
		 */
		this.output = this.context.createGain();

		/**
		 *  the first voice
		 *  @type {Tone.MonoSynth}
		 */
		this.voice0 = new Tone.MonoSynth(options.voice0);
		this.voice0.setVolume(-10);

		/**
		 *  the second voice
		 *  @type {Tone.MonoSynth}
		 */
		this.voice1 = new Tone.MonoSynth(options.voice1);
		this.voice1.setVolume(-10);

		/**
		 *  the vibrato lfo
		 *  @type {Tone.LFO}
		 */
		this._vibrato = new Tone.LFO(options.vibratoRate, -50, 50);
		this._vibrato.start();

		/**
		 *  the vibrato gain
		 *  @type {GainNode}
		 *  @private
		 */
		this._vibratoGain = this.context.createGain();
		this._vibratoGain.gain.value = options.vibratoAmount;

		/**
		 *  the delay before the vibrato starts
		 *  @type {number}
		 */
		this._vibratoDelay = this.toSeconds(options.vibratoDelay);

		/**
		 *  the amount before the vibrato starts
		 *  @type {number}
		 */
		this._vibratoAmount = options.vibratoAmount;

		/**
		 *  the glide time between notes
		 *  @type {number}
		 */
		this.portamento = this.toSeconds(options.portamento);

		/**
		 *  the frequency control
		 *  @type {Tone.Signal}
		 */
		this.frequency = new Tone.Signal(440);

		/**
		 *  the ratio between the two voices
		 *  @type {Tone.Multiply}
		 *  @private
		 */
		this._harmonicity = new Tone.Multiply(options.harmonicity);

		//control the two voices frequency
		this.frequency.connect(this.voice0.frequency);
		this.chain(this.frequency, this._harmonicity, this.voice1.frequency);
		this._vibrato.connect(this._vibratoGain);
		this.fan(this._vibratoGain, this.voice0.detune, this.voice1.detune);
		this.voice0.connect(this.output);
		this.voice1.connect(this.output);
	};

	Tone.extend(Tone.DuoSynth);

	/**
	 *  @static
	 *  @type {Object}
	 */
	Tone.DuoSynth.defaults = {
		"vibratoAmount" : 0.5,
		"vibratoRate" : 5,
		"vibratoDelay" : 1,
		"portamento" : 0.05,
		"harmonicity" : 1.5,
		"voice0" : {
			"volume" : -10,
			"portamento" : 0,
			"oscType" : "sine",
			"filterEnvelope" : {
				"attack" : 0.01,
				"decay" : 0.0,
				"sustain" : 1,
				"release" : 0.5
			},
			"envelope" : {
				"attack" : 0.01,
				"decay" : 0.0,
				"sustain" : 1,
				"release" : 0.5
			}
		},
		"voice1" : {
			"volume" : -10,
			"portamento" : 0,
			"oscType" : "sine",
			"filterEnvelope" : {
				"attack" : 0.01,
				"decay" : 0.0,
				"sustain" : 1,
				"release" : 0.5
			},
			"envelope" : {
				"attack" : 0.01,
				"decay" : 0.0,
				"sustain" : 1,
				"release" : 0.5
			}
		}
	};

	/**
	 *  trigger the attack portion of the note
	 *  
	 *  @param  {string|number} note the note frequency or note name
	 *  @param  {Tone.Time=} [time=now] the time the note will occur
	 *  @param {Tone.Time=} duration if provided, a release will trigger
	 *                               after the duration. 
	 */
	Tone.DuoSynth.prototype.triggerAttack = function(note, time, duration){
		//the envelopes
		this.voice0.envelope.triggerAttack(time);
		this.voice1.envelope.triggerAttack(time);
		this.voice0.filterEnvelope.triggerAttack(time);
		this.voice1.filterEnvelope.triggerAttack(time);
		//the port glide
		time = this.toSeconds(time);
		if (this.portamento > 0){
			var currentNote = this.frequency.getValue();
			this.frequency.setValueAtTime(currentNote, time);
			this.frequency.exponentialRampToValueAtTime(note, time + this.portamento);
		} else {
			this.frequency.setValueAtTime(note, time);
		}
		//the vibrato
		if (this._vibratoDelay > 0 && this._vibratoAmount > 0){
			this._vibratoGain.gain.setValueAtTime(0, time);
			//50 ms ramp to full vibrato
			this._vibratoGain.gain.setValueAtTime(0, time + this._vibratoDelay - 0.05);
			this._vibratoGain.gain.linearRampToValueAtTime(this._vibratoAmount, time + this._vibratoDelay);
		}
		if (!this.isUndef(duration)){
			this.triggerRelease(this.toSeconds(time) + this.toSeconds(duration));
		}
	};

	/**
	 *  trigger the release portion of the note
	 *  
	 *  @param  {string|number} note the note frequency or note name
	 *  @param  {Tone.Time=} [time=now] the time the note will release
	 */
	Tone.DuoSynth.prototype.triggerRelease = function(time){
		this.voice0.triggerRelease(time);
		this.voice1.triggerRelease(time);
	};

	/**
	 *  set the ratio between the two oscillator
	 *  @param {number} ratio
	 */
	Tone.DuoSynth.prototype.setHarmonicity = function(ratio){
		this._harmonicity.setValue(ratio);
	};

	/**
	 *  the glide time between frequencies
	 *  @param {Tone.Time} port
	 */
	Tone.DuoSynth.prototype.setPortamento = function(port){
		this.portamento = this.toSeconds(port);
	};

	/**
	 *  the delay before the vibrato kicks in
	 *  @param {Tone.Time} delay
	 */
	Tone.DuoSynth.prototype.setVibratoDelay = function(delay){
		this._vibratoDelay = this.toSeconds(delay);
	};

	/**
	 *  the vibrato amount. 1 is full vib. 0 is none.
	 *  @param {number} amount an amount between 0-1
	 */
	Tone.DuoSynth.prototype.setVibratoAmount = function(amount){
		this._vibratoAmount = amount;
		this._vibratoGain.gain.setValueAtTime(amount, this.now());
	};

	/**
	 *  the rate of the vibrato
	 *  @param {number} rate
	 */
	Tone.DuoSynth.prototype.setVibratoRate = function(rate){
		this._vibrato.setFrequency(rate);
	};

	/**
	 *  set the volume of the instrument.
	 *  borrowed from {@link Tone.Source}
	 *  @function
	 */
	Tone.DuoSynth.prototype.setVolume = Tone.Source.prototype.setVolume;

	/**
	 *  bulk setter
	 *  @param {Object} param 
	 */
	Tone.DuoSynth.prototype.set = function(params){
		if (!this.isUndef(params.harmonicity)) this.setHarmonicity(params.harmonicity);
		if (!this.isUndef(params.vibratoRate)) this.setVibratoRate(params.vibratoRate);
		if (!this.isUndef(params.vibratoAmount)) this.setVibratoAmount(params.vibratoAmount);
		if (!this.isUndef(params.vibratoDelay)) this.setVibratoDelay(params.vibratoDelay);
		if (!this.isUndef(params.portamento)) this.setPortamento(params.portamento);
		if (!this.isUndef(params.voice0)) this.voice0.set(params.voice0);
		if (!this.isUndef(params.voice1)) this.voice1.set(params.voice1);
	};

	/**
	 *  clean up
	 */
	Tone.DuoSynth.dispose = function(){
		this.voice0.dispose();
		this.voice1.dispose();
		this.frequency.dispose();
		this._vibrato.dispose();
		this._vibratoGain.disconnect();
		this._harmonicity.dispose();
		this.voice0 = null;
		this.voice1 = null;
		this.frequency = null;
		this._vibrato = null;
		this._vibratoGain = null;
		this._harmonicity = null;
	};

	return Tone.DuoSynth;
});