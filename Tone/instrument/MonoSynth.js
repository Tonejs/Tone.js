define(["Tone/core/Tone", "Tone/component/Envelope", "Tone/source/Oscillator", "Tone/signal/Signal"], 
	function(Tone){

	/**
	 *  @class  the MonoSynth is a single oscillator, monophonic synthesizer
	 *          with vibrato, portamento, and a detuned unison
	 *
	 *  @constructor
	 *  @extends {Tone}
	 *  @param {Object} options the options available for the synth 
	 *                          see _defaults below
	 */
	Tone.MonoSynth = function(options){

		//get the defaults
		options = this.defaultArg(options, this._defaults);

		console.log(options, this._defaults);

		/**
		 *  the output
		 *  @type {GainNode}
		 */
		this.output = this.context.createGain();

		/**
		 *  the portamento (glide) time between notes in seconds
		 *  @type {Tone.Time}
		 */
		this.portamento = options.portamento;

		/**
		 *  the frequency control signal
		 *  @type {Tone.Signal}
		 */
		this.frequency = new Tone.Signal(440);

		/**
		 *  the first oscillator
		 *  @type {Tone.Oscillator}
		 */
		this.osc0 = new Tone.Oscillator(0, options.oscType);

		/**
		 *  the second oscillator
		 *  @type {Tone.Oscillator}
		 */
		this.osc1 = new Tone.Oscillator(0, options.oscType);
		this.osc1.detune.setValue(options.unison);

		/**
		 *  the filter
		 *  @type {BiquadFilterNode}
		 */
		this.filter = this.context.createBiquadFilter();
		this.filter.Q.value = options.filterQ;

		/**
		 *  the filter envelope
		 *  @type {Tone.Envelope}
		 */
		this.filterEnvelope = new Tone.Envelope(options.filterAttack, options.filterDecay,
			options.filterSustain, options.filterRelease, 10, options.filterFrequency);

		/**
		 *  the amplitude envelope
		 *  @type {Tone.Envelope}
		 */
		this.envelope = new Tone.Envelope(options.ampAttack, options.ampDecay, 
			options.ampSustain, options.ampRelease);

		//sync the oscillator frequecies to the master frequency
		this.osc0.frequency.sync(this.frequency, 1);
		this.osc1.frequency.sync(this.frequency, 1);
		//connect the oscillators to the output
		this.osc0.connect(this.filter);
		this.osc1.connect(this.filter);
		this.filter.connect(this.output);
		//start the oscillators
		this.osc0.start();
		this.osc1.start();
		//connect the envelopes
		this.filterEnvelope.connect(this.filter.frequency);
		this.envelope.connect(this.output.gain);
	};

	Tone.extend(Tone.MonoSynth);

	/**
	 *  @static
	 *  @private
	 */
	Tone.MonoSynth.prototype._defaults = {
		/** @type {Tone.Time} the glide time between notes */
		"portamento" : 0.05,
		/** @type {string} the type of oscillator */
		"oscType" : "square",
		/** @type {number} the detune between the unison oscillators */
		"unison" : 20,
		/** @type {Tone.Time} the ampAttack time */ 
		"ampAttack" : 0.005,
		/** @type {Tone.Time} the ampDecay time */ 
		"ampDecay" : 2,
		/** @type {number} the ampSustain amount (0-1) */
		"ampSustain" : 0,
		/** @type {Tone.Time} the ampRelease time */ 
		"ampRelease" : 0.2, 
		/** @type {string} the cutoff freq of the lowpass filter */
		"filterFrequency" : 4000,
		/** @type {string} the resonance of the filter */
		"filterQ" : 6,
		/** @type {Tone.Time} the filter attack time */ 
		"filterAttack" : 0.06,
		/** @type {Tone.Time} the filter decay time */ 
		"filterDecay" : 0.2,
		/** @type {number} the filter sustain amount (0-1) */
		"filterSustain" : 0.5,
		/** @type {Tone.Time} the filter release time */ 
		"filterRelease" : 0.1, 
	};

	/**
	 *  start the attack portion of the envelope
	 *  @param {string|number} note if a string, either a note name
	 *                              (i.e. C4, A#3) or a number in hertz
	 *  @param {Tone.Time=} [time=now] the time the attack should start
	 */
	Tone.MonoSynth.prototype.triggerAttack = function(note, time){
		//get the note value
		if (typeof note === "string"){
			note = this.noteToFrequency(note);
		} 
		//the envelopes
		this.envelope.triggerAttack(time);
		this.filterEnvelope.triggerExponentialAttack(time);
		//the port glide
		if (this.portamento > 0){
			var currentNote = this.frequency.getValue();
			time = this.toSeconds(time);
			this.frequency.setValueAtTime(currentNote, time);
			this.frequency.exponentialRampToValueAtTime(note, time + this.portamento);
		} else {
			this.frequency.setValueAtTime(note, time);
		}
	};

	/**
	 *  start the release portion of the envelope
	 *  @param {Tone.Time=} [time=now] the time the release should start
	 */
	Tone.MonoSynth.prototype.triggerRelease = function(time){
		this.envelope.triggerRelease(time);
		this.filterEnvelope.triggerExponentialRelease(time);
	};

	/**
	 *  clean up
	 */
	Tone.MonoSynth.prototype.dispose = function(){
		this.osc0.dispose();
		this.osc1.dispose();
		this.envelope.dispose();
		this.filterEnvelope.dispose();
		this.frequency.dispose();
		this.output.disconnect();
		this.filter.disconnect();
		this.osc0 = null;
		this.osc1 = null;
		this.frequency = null;
		this.output = null;
		this.filterEnvelope = null;
		this.envelope = null;
		this.filter = null;
	};

	return Tone.MonoSynth;
});