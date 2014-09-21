define(["Tone/core/Tone", "Tone/component/FeedbackCombFilter", "Tone/effect/StereoEffect", "Tone/signal/Scale"], 
function(Tone){

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
	 *  @class a simple Schroeder Reverberators tuned by John Chowning in 1970
	 *         made up of 3 allpass filters and 4 feedback comb filters. 
	 *         https://ccrma.stanford.edu/~jos/pasp/Schroeder_Reverberators.html
	 *
	 *  @extends {Tone.Effect}
	 *  @constructor
	 */
	Tone.JCReverb = function(){
		Tone.StereoEffect.call(this);

		/**
		 *  room size control values between [0,1]
		 *  @type {Tone.Signal}
		 */
		this.roomSize = new Tone.Signal(0.5);

		/**
		 *  scale the room size
		 *  @type {Tone.Scale}
		 *  @private
		 */
		this._scaleRoomSize = new Tone.Scale(0, 1, -0.733, 0.197);

		/**
		 *  a series of allpass filters
		 *  @type {Array.<BiquadFilterNode>}
		 *  @private
		 */
		this._allpassFilters = [];

		/**
		 *  parallel feedback comb filters
		 *  @type {Array.<Tone.FeedbackCombFilter>}
		 *  @private
		 */
		this._feedbackCombFilters = [];

		//make the allpass filters
		for (var af = 0; af < allpassFilterFreqs.length; af++) {
			var allpass = this.context.createBiquadFilter();
			allpass.type = "allpass";
			allpass.frequency.value = allpassFilterFreqs[af];
			this._allpassFilters.push(allpass);
		}

		//and the comb filters
		for (var cf = 0; cf < combFilterDelayTimes.length; cf++) {
			var fbcf = new Tone.FeedbackCombFilter(combFilterDelayTimes[cf]);
			this._scaleRoomSize.connect(fbcf.resonance);
			fbcf.resonance.setValue(combFilterResonances[cf]);
			this._allpassFilters[this._allpassFilters.length - 1].connect(fbcf);
			if (cf < combFilterDelayTimes.length / 2){
				fbcf.connect(this.effectReturnL);
			} else {
				fbcf.connect(this.effectReturnR);
			}
			this._feedbackCombFilters.push(fbcf);
		}

		//chain the allpass filters together
		this.roomSize.connect(this._scaleRoomSize);
		this.chain.apply(this, this._allpassFilters);
		this.effectSendL.connect(this._allpassFilters[0]);
		this.effectSendR.connect(this._allpassFilters[0]);
	};

	Tone.extend(Tone.JCReverb, Tone.StereoEffect);

	/**
	 *  set the room size
	 *  @param {number} roomsize roomsize value between 0-1
	 */
	Tone.JCReverb.prototype.setRoomSize = function(roomsize) {
		this.roomSize.setValue(roomsize);
	};

	/**
	 *  set multiple parameters at once with an object
	 *  @param {Object} params the parameters as an object
	 */
	Tone.JCReverb.prototype.set = function(params){
		if (!this.isUndef(params.roomSize)) this.setRoomSize(params.roomSize);
		Tone.StereoEffect.prototype.set.call(this, params);
	};

	/**
	 *  clean up
	 */
	Tone.JCReverb.prototype.dispose = function(){
		Tone.StereoEffect.prototype.dispose.call(this);
		for (var apf = 0; apf < this._allpassFilters.length; apf++) {
			this._allpassFilters[apf].disconnect();
			this._allpassFilters[apf] = null;
		}
		this._allpassFilters = null;
		for (var fbcf = 0; fbcf < this._feedbackCombFilters.length; fbcf++) {
			this._feedbackCombFilters[fbcf].dispose();
			this._feedbackCombFilters[fbcf] = null;
		}
		this._feedbackCombFilters = null;
		this.roomSize.dispose();
		this._scaleRoomSize.dispose();
		this.roomSize = null;
		this._scaleRoomSize = null;
	};

	return Tone.JCReverb;
});