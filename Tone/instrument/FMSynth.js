define(["Tone/core/Tone", "Tone/instrument/MonoSynth", "Tone/signal/Signal", "Tone/signal/Multiply"], 
	function(Tone){

	/**
	 *  @class  the FMSynth is composed of two MonoSynths where one MonoSynth is the 
	 *          carrier and the second is the modulator.
	 *
	 *  @constructor
	 *  @extends {Tone}
	 *  @param {Object} options the options available for the synth 
	 *                          see defaults below
	 */
	Tone.FMSynth = function(options){

		options = this.defaultArg(options, Tone.FMSynth.defaults);

		/**
		 *  the output
		 *  @type {GainNode}
		 */
		this.output = this.context.createGain();

		/**
		 *  the first voice
		 *  @type {Tone.MonoSynth}
		 */
		this.carrier = new Tone.MonoSynth(options.carrier);
		this.carrier.setVolume(-10);

		/**
		 *  the second voice
		 *  @type {Tone.MonoSynth}
		 */
		this.modulator = new Tone.MonoSynth(options.modulator);
		this.modulator.setVolume(-10);

		/**
		 *  scale the modulated frequency
		 */

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

		/**
		 *  which is in essence the depth or amount of the modulation. In other terms it is the 
		 *  ratio of the frequency of the modulating signal (mf) to the amplitude of the 
		 *  modulating signal (ma) -- as in ma/mf. 
		 *
		 *	@type {Tone.Multiply}
		 *	@private
		 */
		this._modulationIndex = new Tone.Multiply(options.modulationIndex);

		/**
		 *  the node where the modulation happens
		 *  @type {GainNode}
		 *  @private
		 */
		this._modulationNode = this.context.createGain();

		//control the two voices frequency
		this.frequency.connect(this.carrier.frequency);
		this.chain(this.frequency, this._harmonicity, this.modulator.frequency);
		this.chain(this.frequency, this._modulationIndex, this._modulationNode);
		this.modulator.connect(this._modulationNode.gain);
		this._modulationNode.gain.value = 0;
		this._modulationNode.connect(this.carrier.frequency);
		this.carrier.connect(this.output);
	};

	Tone.extend(Tone.FMSynth);

	/**
	 *  @static
	 *  @type {Object}
	 */
	Tone.FMSynth.defaults = {
		"portamento" : 0.0,
		"harmonicity" : 3,
		"modulationIndex" : 10,
		"carrier" : {
			"volume" : -10,
			"portamento" : 0,
			"oscType" : "sine",
			"envelope" : {
				"attack" : 0.01,
				"decay" : 0.0,
				"sustain" : 1,
				"release" : 0.5
			},
			"filterEnvelope" : {
				"attack" : 0.01,
				"decay" : 0.0,
				"sustain" : 1,
				"release" : 0.5,
				"min" : 20000,
				"max" : 20000
			}
		},
		"modulator" : {
			"volume" : -10,
			"portamento" : 0,
			"oscType" : "triangle",
			"envelope" : {
				"attack" : 0.01,
				"decay" : 0.0,
				"sustain" : 1,
				"release" : 0.5
			},
			"filterEnvelope" : {
				"attack" : 0.01,
				"decay" : 0.0,
				"sustain" : 1,
				"release" : 0.5,
				"min" : 20000,
				"max" : 20000
			}
		}
	};

	/**
	 *  trigger the attack portion of the note
	 *  
	 *  @param  {string|number} note the note frequency or note name
	 *  @param  {Tone.Time=} [time=now] the time the note will occur
	 */
	Tone.FMSynth.prototype.triggerAttack = function(note, time){
		//the envelopes
		this.carrier.envelope.triggerAttack(time);
		this.modulator.envelope.triggerAttack(time);
		this.carrier.filterEnvelope.triggerExponentialAttack(time);
		this.modulator.filterEnvelope.triggerExponentialAttack(time);
		//the port glide
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
	 *  trigger the release portion of the note
	 *  
	 *  @param  {string|number} note the note frequency or note name
	 *  @param  {Tone.Time=} [time=now] the time the note will release
	 */
	Tone.FMSynth.prototype.triggerRelease = function(time){
		this.carrier.triggerRelease(time);
		this.modulator.triggerRelease(time);
	};

	/**
	 *  set the ratio between the two carrier and the modulator
	 *  @param {number} ratio
	 */
	Tone.FMSynth.prototype.setHarmonicity = function(ratio){
		this._harmonicity.setValue(ratio);
	};

	/**
	 *  set the modulation index
	 *  @param {number} index
	 */
	Tone.FMSynth.prototype.setModulationIndex = function(index){
		this._modulationIndex.setValue(index);
	};

	/**
	 *  the glide time between frequencies
	 *  @param {Tone.Time} port
	 */
	Tone.FMSynth.prototype.setPortamento = function(port){
		this.portamento = this.toSeconds(port);
	};

	/**
	 *  set the volume of the instrument.
	 *  borrowed from {@link Tone.Source}
	 *  @function
	 */
	Tone.FMSynth.prototype.setVolume = Tone.Source.prototype.setVolume;

	/**
	 *  bulk setter
	 *  @param {Object} param 
	 */
	Tone.FMSynth.prototype.set = function(params){
		if (!this.isUndef(params.harmonicity)) this.setHarmonicity(params.harmonicity);
		if (!this.isUndef(params.modulationIndex)) this.setModulationIndex(params.modulationIndex);
		if (!this.isUndef(params.portamento)) this.setPortamento(params.portamento);
		if (!this.isUndef(params.carrier)) this.carrier.set(params.carrier);
		if (!this.isUndef(params.modulator)) this.modulator.set(params.modulator);
	};

	/**
	 *  clean up
	 */
	Tone.FMSynth.dispose = function(){
		this.carrier.dispose();
		this.modulator.dispose();
		this.frequency.dispose();
		this._modulationIndex.dispose();
		this._harmonicity.dispose();
		this._modulationNode.disconnect();
		this.carrier = null;
		this.modulator = null;
		this.frequency = null;
		this._modulationIndex = null;
		this._harmonicity = null;
		this._modulationNode = null;
	};

	return Tone.FMSynth;
});