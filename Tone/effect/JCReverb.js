define(["../core/Tone", "../component/FeedbackCombFilter", "../effect/StereoEffect", "../signal/Scale"], function(Tone){

	"use strict";

	/**
	 *  an array of the comb filter delay time values
	 *  @private
	 *  @static
	 *  @type {Array}
	 */
	var combFilterDelayTimes = [1687 / 25000, 1601 / 25000, 2053 / 25000, 2251 / 25000];

	/**
	 *  the resonances of each of the comb filters
	 *  @private
	 *  @static
	 *  @type {Array}
	 */
	var combFilterResonances = [0.773, 0.802, 0.753, 0.733];

	/**
	 *  the allpass filter frequencies
	 *  @private
	 *  @static
	 *  @type {Array}
	 */
	var allpassFilterFreqs = [347, 113, 37];

	/**
	 *  @class Tone.JCReverb is a simple [Schroeder Reverberator](https://ccrma.stanford.edu/~jos/pasp/Schroeder_Reverberators.html)
	 *         tuned by John Chowning in 1970.
	 *         It is made up of three allpass filters and four Tone.FeedbackCombFilter.
	 *
	 *
	 *  @extends {Tone.Effect}
	 *  @constructor
	 *  @param {NormalRange|Object} [roomSize] Coorelates to the decay time.
	 *  @example
	 * var reverb = new Tone.JCReverb(0.4).connect(Tone.Master);
	 * var delay = new Tone.FeedbackDelay(0.5);
	 * //connecting the synth to reverb through delay
	 * var synth = Tone.chain(new Tone.DuoSynth(), delay, reverb);
	 * synth.triggerAttackRelease("A4","8n");
	 */
	Tone.JCReverb = function(){

		var options = Tone.defaults(arguments, ["roomSize"], Tone.JCReverb);
		Tone.StereoEffect.call(this, options);

		/**
		 *  room size control values between [0,1]
		 *  @type {NormalRange}
		 *  @signal
		 */
		this.roomSize = new Tone.Signal(options.roomSize, Tone.Type.NormalRange);

		/**
		 *  scale the room size
		 *  @type {Tone.Scale}
		 *  @private
		 */
		this._scaleRoomSize = new Tone.Scale(-0.733, 0.197);

		/**
		 *  a series of allpass filters
		 *  @type {Array}
		 *  @private
		 */
		this._allpassFilters = [];

		/**
		 *  parallel feedback comb filters
		 *  @type {Array}
		 *  @private
		 */
		this._feedbackCombFilters = [];

		//make the allpass filters
		for (var af = 0; af < allpassFilterFreqs.length; af++){
			var allpass = this.context.createBiquadFilter();
			allpass.type = "allpass";
			allpass.frequency.value = allpassFilterFreqs[af];
			this._allpassFilters.push(allpass);
		}

		//and the comb filters
		for (var cf = 0; cf < combFilterDelayTimes.length; cf++){
			var fbcf = new Tone.FeedbackCombFilter(combFilterDelayTimes[cf], 0.1);
			Tone.connect(this._scaleRoomSize, fbcf.resonance);
			fbcf.resonance.value = combFilterResonances[cf];
			Tone.connect(this._allpassFilters[this._allpassFilters.length - 1], fbcf);
			if (cf < combFilterDelayTimes.length / 2){
				Tone.connect(fbcf, this.effectReturnL);
			} else {
				Tone.connect(fbcf, this.effectReturnR);
			}
			this._feedbackCombFilters.push(fbcf);
		}

		//chain the allpass filters together
		Tone.connect(this.roomSize, this._scaleRoomSize);
		Tone.connectSeries.apply(Tone, this._allpassFilters);
		Tone.connect(this.effectSendL, this._allpassFilters[0]);
		Tone.connect(this.effectSendR, this._allpassFilters[0]);
		this._readOnly(["roomSize"]);
	};

	Tone.extend(Tone.JCReverb, Tone.StereoEffect);

	/**
	 *  the default values
	 *  @static
	 *  @const
	 *  @type {Object}
	 */
	Tone.JCReverb.defaults = {
		"roomSize" : 0.5
	};

	/**
	 *  Clean up.
	 *  @returns {Tone.JCReverb} this
	 */
	Tone.JCReverb.prototype.dispose = function(){
		Tone.StereoEffect.prototype.dispose.call(this);
		for (var apf = 0; apf < this._allpassFilters.length; apf++){
			this._allpassFilters[apf].disconnect();
			this._allpassFilters[apf] = null;
		}
		this._allpassFilters = null;
		for (var fbcf = 0; fbcf < this._feedbackCombFilters.length; fbcf++){
			this._feedbackCombFilters[fbcf].dispose();
			this._feedbackCombFilters[fbcf] = null;
		}
		this._feedbackCombFilters = null;
		this._writable(["roomSize"]);
		this.roomSize.dispose();
		this.roomSize = null;
		this._scaleRoomSize.dispose();
		this._scaleRoomSize = null;
		return this;
	};

	return Tone.JCReverb;
});
