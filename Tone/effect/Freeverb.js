define(["Tone/core/Tone", "Tone/component/LowpassCombFilter", "Tone/effect/StereoEffect", "Tone/signal/Signal", "Tone/component/Split", "Tone/component/Merge"], 
function(Tone){

	"use strict";

	/**
	 *  an array of comb filter delay values from Freeverb implementation
	 *  @static
	 *  @private
	 *  @type {Array}
	 */
	var combFilterTunings = [1557 / 44100, 1617 / 44100, 1491 / 44100, 1422 / 44100, 1277 / 44100, 1356 / 44100, 1188 / 44100, 1116 / 44100];

	/**
	 *  an array of allpass filter frequency values from Freeverb implementation
	 *  @private
	 *  @static
	 *  @type {Array}
	 */
	var allpassFilterFrequencies = [225, 556, 441, 341];

	/**
	 *  @class Reverb based on the Freeverb
	 *
	 *  @extends {Tone.Effect}
	 *  @constructor
	 *  @param {number} [roomSize=0.7] correlated to the decay time. 
	 *                                 value between (0,1)
	 *  @param {number} [dampening=0.5] filtering which is applied to the reverb. 
	 *                                  value between [0,1]
	 */
	Tone.Freeverb = function(){

		var options = this.optionsObject(arguments, ["roomSize", "dampening"], Tone.Freeverb.defaults);
		Tone.StereoEffect.call(this, options);

		/**
		 *  the roomSize value between (0,1)
		 *  @type {Tone.Signal}
		 */
		this.roomSize = new Tone.Signal(options.roomSize);

		/**
		 *  the amount of dampening
		 *  value between [0,1]
		 *  @type {Tone.Signal}
		 */
		this.dampening = new Tone.Signal(options.dampening);

		/**
		 *  scale the dampening
		 *  @type {Tone.ScaleExp}
		 *  @private
		 */
		this._dampeningScale = new Tone.ScaleExp(0, 1, 100, 8000, 0.5);

		/**
		 *  the comb filters
		 *  @type {Array.<Tone.LowpassCombFilter>}
		 *  @private
		 */
		this._combFilters = [];

		/**
		 *  the allpass filters on the left
		 *  @type {Array.<BiqaudFilterNode>}
		 *  @private
		 */
		this._allpassFiltersL = [];

		/**
		 *  the allpass filters on the right
		 *  @type {Array.<BiqaudFilterNode>}
		 *  @private
		 */
		this._allpassFiltersR = [];

		//make the allpass filters on teh right
		for (var l = 0; l < allpassFilterFrequencies.length; l++){
			var allpassL = this.context.createBiquadFilter();
			allpassL.type = "allpass";
			allpassL.frequency.value = allpassFilterFrequencies[l];
			this._allpassFiltersL.push(allpassL);
		}

		//make the allpass filters on the left
		for (var r = 0; r < allpassFilterFrequencies.length; r++){
			var allpassR = this.context.createBiquadFilter();
			allpassR.type = "allpass";
			allpassR.frequency.value = allpassFilterFrequencies[r];
			this._allpassFiltersR.push(allpassR);
		}

		//make the comb filters
		for (var c = 0; c < combFilterTunings.length; c++){
			var lfpf = new Tone.LowpassCombFilter(combFilterTunings[c]);
			if (c < combFilterTunings.length / 2){
				this.chain(this.effectSendL, lfpf, this._allpassFiltersL[0]);
			} else {
				this.chain(this.effectSendR, lfpf, this._allpassFiltersR[0]);
			}
			this.roomSize.connect(lfpf.resonance);
			this._dampeningScale.connect(lfpf.dampening);
			this._combFilters.push(lfpf);
		}

		//chain the allpass filters togetehr
		this.chain.apply(this, this._allpassFiltersL);
		this.chain.apply(this, this._allpassFiltersR);
		this._allpassFiltersL[this._allpassFiltersL.length - 1].connect(this.effectReturnL);
		this._allpassFiltersR[this._allpassFiltersR.length - 1].connect(this.effectReturnR);
		this.dampening.connect(this._dampeningScale);
	};

	Tone.extend(Tone.Freeverb, Tone.StereoEffect);

	/**
	 *  @static
	 *  @type {Object}
	 */
	Tone.Freeverb.defaults = {
		"roomSize" : 0.7, 
		"dampening" : 0.5
	};

	/**
	 *  set the room size
	 *  @param {number} roomsize roomsize value between 0-1
	 */
	Tone.Freeverb.prototype.setRoomSize = function(roomsize) {
		this.roomSize.setValue(roomsize);
	};

	/**
	 *  set the dampening
	 *  @param {number} dampening dampening between 0-1
	 */
	Tone.Freeverb.prototype.setDampening = function(dampening) {
		this.dampening.setValue(dampening);
	};

	/**
	 *  set multiple parameters at once with an object
	 *  @param {Object} params the parameters as an object
	 */
	Tone.Freeverb.prototype.set = function(params){
		if (!this.isUndef(params.dampening)) this.setDampening(params.dampening);
		if (!this.isUndef(params.roomSize)) this.setRoomSize(params.roomSize);
		Tone.StereoEffect.prototype.set.call(this, params);
	};

	/**
	 *  clean up
	 */
	Tone.Freeverb.prototype.dispose = function(){
		Tone.StereoEffect.prototype.dispose.call(this);
		for (var al = 0; al < this._allpassFiltersL.length; al++) {
			this._allpassFiltersL[al].disconnect();
			this._allpassFiltersL[al] = null;
		}
		this._allpassFiltersL = null;
		for (var ar = 0; ar < this._allpassFiltersR.length; ar++) {
			this._allpassFiltersR[ar].disconnect();
			this._allpassFiltersR[ar] = null;
		}
		this._allpassFiltersR = null;
		for (var cf = 0; cf < this._combFilters.length; cf++) {
			this._combFilters[cf].dispose();
			this._combFilters[cf] = null;
		}
		this._combFilters = null;
		this.roomSize.dispose();
		this.dampening.dispose();
		this._dampeningScale.dispose();
		this.roomSize = null;
		this.dampening = null;
		this._dampeningScale = null;
	};

	return Tone.Freeverb;
});