define(["Tone/core/Tone", "Tone/instrument/SimpleSynth", "Tone/signal/Signal", "Tone/signal/Multiply", "Tone/instrument/Monophonic"], 
function(Tone){

	"use strict";

	/**
	 *  @class  SimpleFM is composed of two SimpleSynths where one SimpleSynth is the 
	 *          carrier and the second is the modulator.
	 *
	 *  @constructor
	 *  @extends {Tone.Monophonic}
	 *  @param {Object} [options] the options available for the synth 
	 *                          see defaults below
	 *  @example
	 *  var fmSynth = new Tone.SimpleFM();
	 */
	Tone.SimpleFM = function(options){

		options = this.defaultArg(options, Tone.SimpleFM.defaults);
		Tone.Monophonic.call(this, options);

		/**
		 *  The carrier voice. 
		 *  @type {Tone.SimpleSynth}
		 */
		this.carrier = new Tone.SimpleSynth(options.carrier);
		this.carrier.volume.value = -10;

		/**
		 *  The modulator voice. 
		 *  @type {Tone.SimpleSynth}
		 */
		this.modulator = new Tone.SimpleSynth(options.modulator);
		this.modulator.volume.value = -10;

		/**
		 *  the frequency control
		 *  @type {Frequency}
		 *  @signal
		 */
		this.frequency = new Tone.Signal(440, Tone.Type.Frequency);

		/**
		 *  The ratio between the two carrier and the modulator. 
		 *  @type {Positive}
		 *  @signal
		 */
		this.harmonicity = new Tone.Multiply(options.harmonicity);
		this.harmonicity.units = Tone.Type.Positive;

		/**
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
		this.frequency.chain(this.harmonicity, this.modulator.frequency);
		this.frequency.chain(this._modulationIndex, this._modulationNode);
		this.modulator.connect(this._modulationNode.gain);
		this._modulationNode.gain.value = 0;
		this._modulationNode.connect(this.carrier.frequency);
		this.carrier.connect(this.output);
		this._readOnly(["carrier", "modulator", "frequency"]);
	};

	Tone.extend(Tone.SimpleFM, Tone.Monophonic);

	/**
	 *  @static
	 *  @type {Object}
	 */
	Tone.SimpleFM.defaults = {
		"harmonicity" : 3,
		"modulationIndex" : 10,
		"carrier" : {
			"volume" : -10,
			"portamento" : 0,
			"oscillator" : {
				"type" : "sine"
			},
			"envelope" : {
				"attack" : 0.01,
				"decay" : 0.0,
				"sustain" : 1,
				"release" : 0.5
			}
		},
		"modulator" : {
			"volume" : -10,
			"portamento" : 0,
			"oscillator" : {
				"type" : "triangle"
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
	 *  @param  {Time} [time=now] the time the note will occur
	 *  @param {number} [velocity=1] the velocity of the note
	 *  @returns {Tone.SimpleFM} this
	 *  @private
	 */
	Tone.SimpleFM.prototype._triggerEnvelopeAttack = function(time, velocity){
		//the port glide
		time = this.toSeconds(time);
		//the envelopes
		this.carrier.envelope.triggerAttack(time, velocity);
		this.modulator.envelope.triggerAttack(time);
		return this;
	};

	/**
	 *  trigger the release portion of the note
	 *  
	 *  @param  {Time} [time=now] the time the note will release
	 *  @returns {Tone.SimpleFM} this
	 *  @private
	 */
	Tone.SimpleFM.prototype._triggerEnvelopeRelease = function(time){
		this.carrier.triggerRelease(time);
		this.modulator.triggerRelease(time);
		return this;
	};

	/**
	 * The modulation index which is in essence the depth or amount of the modulation. In other terms it is the 
	 *  ratio of the frequency of the modulating signal (mf) to the amplitude of the 
	 *  modulating signal (ma) -- as in ma/mf. 
	 * @memberOf Tone.SimpleFM#
	 * @type {number}
	 * @name modulationIndex
	 */
	Object.defineProperty(Tone.SimpleFM.prototype, "modulationIndex", {
		get : function(){
			return this._modulationIndex.value;
		},
		set : function(mod){
			this._modulationIndex.value = mod;
		}
	});

	/**
	 *  clean up
	 *  @returns {Tone.SimpleFM} this
	 */
	Tone.SimpleFM.prototype.dispose = function(){
		Tone.Monophonic.prototype.dispose.call(this);
		this._writable(["carrier", "modulator", "frequency"]);
		this.carrier.dispose();
		this.carrier = null;
		this.modulator.dispose();
		this.modulator = null;
		this.frequency.dispose();
		this.frequency = null;
		this._modulationIndex.dispose();
		this._modulationIndex = null;
		this.harmonicity.dispose();
		this.harmonicity = null;
		this._modulationNode.disconnect();
		this._modulationNode = null;
		return this;
	};

	return Tone.SimpleFM;
});