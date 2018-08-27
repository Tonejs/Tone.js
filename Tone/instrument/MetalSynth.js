define(["../core/Tone", "../instrument/Instrument", "../source/FMOscillator", "../component/Filter",
	"../component/FrequencyEnvelope", "../component/AmplitudeEnvelope", "../core/Gain",
	"../signal/Scale", "../signal/Multiply"], function(Tone){

	/**
	 *  Inharmonic ratio of frequencies based on the Roland TR-808
	 *  Taken from https://ccrma.stanford.edu/papers/tr-808-cymbal-physically-informed-circuit-bendable-digital-model
	 *  @private
	 *  @static
	 *  @type {Array}
	 */
	var inharmRatios = [1.0, 1.483, 1.932, 2.546, 2.630, 3.897];

	/**
	 *  @class  A highly inharmonic and spectrally complex source with a highpass filter
	 *          and amplitude envelope which is good for making metalophone sounds. Based
	 *          on CymbalSynth by [@polyrhythmatic](https://github.com/polyrhythmatic).
	 *          Inspiration from [Sound on Sound](https://web.archive.org/web/20160610143924/https://www.soundonsound.com/sos/jul02/articles/synthsecrets0702.asp).
	 *
	 *  @constructor
	 *  @extends {Tone.Instrument}
	 *  @param {Object} [options] The options availble for the synth
	 *                             see defaults below
	 */
	Tone.MetalSynth = function(options){

		options = Tone.defaultArg(options, Tone.MetalSynth.defaults);
		Tone.Instrument.call(this, options);

		/**
		 *  The frequency of the cymbal
		 *  @type  {Frequency}
		 *  @signal
		 */
		this.frequency = new Tone.Signal(options.frequency, Tone.Type.Frequency);

		/**
		 *  The array of FMOscillators
		 *  @type  {Array}
		 *  @private
		 */
		this._oscillators = [];

		/**
		 *  The frequency multipliers
		 *  @type {Array}
		 *  @private
		 */
		this._freqMultipliers = [];

		/**
		 *  The amplitude for the body
		 *  @type {Tone.Gain}
		 *  @private
		 */
		this._amplitue = new Tone.Gain(0).connect(this.output);

		/**
		 *  highpass the output
		 *  @type {Tone.Filter}
		 *  @private
		 */
		this._highpass = new Tone.Filter({
			"type" : "highpass",
			"Q" : -3.0102999566398125
		}).connect(this._amplitue);

		/**
		 *  The number of octaves the highpass
		 *  filter frequency ramps
		 *  @type {Number}
		 *  @private
		 */
		this._octaves = options.octaves;

		/**
		 *  Scale the body envelope
		 *  for the bandpass
		 *  @type {Tone.Scale}
		 *  @private
		 */
		this._filterFreqScaler = new Tone.Scale(options.resonance, 7000);

		/**
		 *  The envelope which is connected both to the
		 *  amplitude and highpass filter's cutoff frequency
		 *  @type  {Tone.Envelope}
		 */
		this.envelope = new Tone.Envelope({
			"attack" : options.envelope.attack,
			"attackCurve" : "linear",
			"decay" : options.envelope.decay,
			"sustain" : 0,
			"release" : options.envelope.release,
		}).chain(this._filterFreqScaler, this._highpass.frequency);
		this.envelope.connect(this._amplitue.gain);

		for (var i = 0; i < inharmRatios.length; i++){
			var osc = new Tone.FMOscillator({
				"type" : "square",
				"modulationType" : "square",
				"harmonicity" : options.harmonicity,
				"modulationIndex" : options.modulationIndex
			});
			osc.connect(this._highpass);
			this._oscillators[i] = osc;

			var mult = new Tone.Multiply(inharmRatios[i]);
			this._freqMultipliers[i] = mult;
			this.frequency.chain(mult, osc.frequency);
		}

		//set the octaves
		this.octaves = options.octaves;

	};

	Tone.extend(Tone.MetalSynth, Tone.Instrument);

	/**
	 *  default values
	 *  @static
	 *  @const
	 *  @type {Object}
	 */
	Tone.MetalSynth.defaults = {
		"frequency" : 200,
		"envelope" : {
			"attack" : 0.001,
			"decay" : 1.4,
			"release" : 0.2
		},
		"harmonicity" : 5.1,
		"modulationIndex" : 32,
		"resonance" : 4000,
		"octaves" : 1.5
	};

	/**
	 *  Trigger the attack.
	 *  @param  {Time}  time      When the attack should be triggered.
	 *  @param  {NormalRange}  [velocity=1]  The velocity that the envelope should be triggered at.
	 *  @return  {Tone.MetalSynth}  this
	 */
	Tone.MetalSynth.prototype.triggerAttack = function(time, vel){
		time = this.toSeconds(time);
		vel = Tone.defaultArg(vel, 1);
		this.envelope.triggerAttack(time, vel);
		this._oscillators.forEach(function(osc){
			osc.start(time);
		});
		//if the sustain is 0, stop the oscillator as well
		if (this.envelope.sustain === 0){
			this._oscillators.forEach(function(osc){
				osc.stop(time + this.envelope.attack + this.envelope.decay);
			}.bind(this));
		}
		return this;
	};

	/**
	 *  Trigger the release of the envelope.
	 *  @param  {Time}  time      When the release should be triggered.
	 *  @return  {Tone.MetalSynth}  this
	 */
	Tone.MetalSynth.prototype.triggerRelease = function(time){
		time = this.toSeconds(time);
		this.envelope.triggerRelease(time);
		this._oscillators.forEach(function(osc){
			osc.stop(time + this.envelope.release);
		}.bind(this));
		return this;
	};

	/**
	 * Sync the instrument to the Transport. All subsequent calls of
	 * [triggerAttack](#triggerattack) and [triggerRelease](#triggerrelease)
	 * will be scheduled along the transport.
	 * @example
	 * synth.sync()
	 * //schedule 3 notes when the transport first starts
	 * synth.triggerAttackRelease('8n', 0)
	 * synth.triggerAttackRelease('8n', '8n')
	 * synth.triggerAttackRelease('8n', '4n')
	 * //start the transport to hear the notes
	 * Transport.start()
	 * @returns {Tone.Instrument} this
	 */
	Tone.MetalSynth.prototype.sync = function(){
		this._syncMethod("triggerAttack", 0);
		this._syncMethod("triggerRelease", 0);
		return this;
	};

	/**
	 *  Trigger the attack and release of the envelope after the given
	 *  duration.
	 *  @param  {Time}  duration  The duration before triggering the release
	 *  @param  {Time}  time      When the attack should be triggered.
	 *  @param  {NormalRange}  [velocity=1]  The velocity that the envelope should be triggered at.
	 *  @return  {Tone.MetalSynth}  this
	 */
	Tone.MetalSynth.prototype.triggerAttackRelease = function(duration, time, velocity){
		time = this.toSeconds(time);
		duration = this.toSeconds(duration);
		this.triggerAttack(time, velocity);
		this.triggerRelease(time + duration);
		return this;
	};

	/**
	 *  The modulationIndex of the oscillators which make up the source.
	 *  see Tone.FMOscillator.modulationIndex
	 *  @memberOf Tone.MetalSynth#
	 *  @type {Positive}
	 *  @name  modulationIndex
	 */
	Object.defineProperty(Tone.MetalSynth.prototype, "modulationIndex", {
		get : function(){
			return this._oscillators[0].modulationIndex.value;
		},
		set : function(val){
			for (var i = 0; i < this._oscillators.length; i++){
				this._oscillators[i].modulationIndex.value = val;
			}
		}
	});

	/**
	 *  The harmonicity of the oscillators which make up the source.
	 *  see Tone.FMOscillator.harmonicity
	 *  @memberOf Tone.MetalSynth#
	 *  @type {Positive}
	 *  @name  harmonicity
	 */
	Object.defineProperty(Tone.MetalSynth.prototype, "harmonicity", {
		get : function(){
			return this._oscillators[0].harmonicity.value;
		},
		set : function(val){
			for (var i = 0; i < this._oscillators.length; i++){
				this._oscillators[i].harmonicity.value = val;
			}
		}
	});

	/**
	 *  The frequency of the highpass filter attached to the envelope
	 *  @memberOf Tone.MetalSynth#
	 *  @type {Frequency}
	 *  @name  resonance
	 */
	Object.defineProperty(Tone.MetalSynth.prototype, "resonance", {
		get : function(){
			return this._filterFreqScaler.min;
		},
		set : function(val){
			this._filterFreqScaler.min = val;
			this.octaves = this._octaves;
		}
	});

	/**
	 *  The number of octaves above the "resonance" frequency
	 *  that the filter ramps during the attack/decay envelope
	 *  @memberOf Tone.MetalSynth#
	 *  @type {Number}
	 *  @name  octaves
	 */
	Object.defineProperty(Tone.MetalSynth.prototype, "octaves", {
		get : function(){
			return this._octaves;
		},
		set : function(octs){
			this._octaves = octs;
			this._filterFreqScaler.max = this._filterFreqScaler.min * Math.pow(2, octs);
		}
	});

	/**
	 *  Clean up
	 *  @returns {Tone.MetalSynth} this
	 */
	Tone.MetalSynth.prototype.dispose = function(){
		Tone.Instrument.prototype.dispose.call(this);
		for (var i = 0; i < this._oscillators.length; i++){
			this._oscillators[i].dispose();
			this._freqMultipliers[i].dispose();
		}
		this._oscillators = null;
		this._freqMultipliers = null;
		this.frequency.dispose();
		this.frequency = null;
		this._filterFreqScaler.dispose();
		this._filterFreqScaler = null;
		this._amplitue.dispose();
		this._amplitue = null;
		this.envelope.dispose();
		this.envelope = null;
		this._highpass.dispose();
		this._highpass = null;
	};

	return Tone.MetalSynth;
});
