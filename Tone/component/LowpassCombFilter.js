define(["Tone/core/Tone", "Tone/signal/ScaleExp", "Tone/signal/Signal"], function(Tone){

	"use strict";

	/**
	 *  @class A lowpass feedback comb filter. 
	 *         DelayNode -> Lowpass Filter -> feedback
	 *
	 *  @extends {Tone}
	 *  @constructor
	 *  @param {number} [minDelay=0.1] the minimum delay time which the filter can have
	 */
	Tone.LowpassCombFilter = function(minDelay){

		Tone.call(this);

		minDelay = this.defaultArg(minDelay, 0.01);
		//the delay * samplerate = number of samples. 
		// buffersize / number of samples = number of delays needed per buffer frame
		var delayCount = Math.ceil(this.bufferSize / (minDelay * this.context.sampleRate));
		//set some ranges
		delayCount = Math.min(delayCount, 10);
		delayCount = Math.max(delayCount, 1);

		/**
		 *  the number of filter delays
		 *  @type {number}
		 *  @private
		 */
		this._filterDelayCount = delayCount;

		/**
		 *  @type {Array.<FilterDelay>}
		 *  @private
		 */
		this._filterDelays = new Array(this._filterDelayCount);

		/**
		 *  the delayTime control
		 *  @type {Tone.Signal}
		 *  @private
		 */
		this._delayTime = new Tone.Signal(1);

		/**
		 *  the dampening control
		 *  @type {Tone.Signal}
		 */
		this.dampening = new Tone.Signal(3000);

		/**
		 *  the resonance control
		 *  @type {Tone.Signal}
		 */
		this.resonance = new Tone.Signal(0.5);

		/**
		 *  scale the resonance value to the normal range
		 *  @type {Tone.Scale}
		 *  @private
		 */
		this._resScale = new Tone.ScaleExp(0, 1, 0.01, 1 / this._filterDelayCount - 0.001, 0.5);

		/**
		 *  internal flag for keeping track of when frequency
		 *  correction has been used
		 *  @type {boolean}
		 *  @private
		 */
		this._highFrequencies = false;

		/**
		 *  the feedback node
		 *  @type {GainNode}
		 *  @private
		 */
		this._feedback = this.context.createGain();

		//make the filters
		for (var i = 0; i < this._filterDelayCount; i++) {
			var filterDelay = new FilterDelay(this._delayTime, this.dampening);
			filterDelay.connect(this._feedback);
			this._filterDelays[i] = filterDelay;
		}

		//connections
		this.input.connect(this._filterDelays[0]);
		this._feedback.connect(this._filterDelays[0]);
		this.chain.apply(this, this._filterDelays);
		//resonance control
		this.chain(this.resonance, this._resScale, this._feedback.gain);
		this._feedback.connect(this.output);
		//set the delay to the min value initially
		this.setDelayTime(minDelay);
	};

	Tone.extend(Tone.LowpassCombFilter);

	/**
	 *  set the delay time of the comb filter
	 *  auto corrects for sample offsets for small delay amounts
	 *  	
	 *  @param {number} delayAmount the delay amount
	 *  @param {Tone.Time=} time        when the change should occur
	 */
	Tone.LowpassCombFilter.prototype.setDelayTime = function(delayAmount, time) {
		time = this.toSeconds(time);
		//the number of samples to delay by
		var sampleRate = this.context.sampleRate;
		var delaySamples = sampleRate * delayAmount;
		// delayTime corection when frequencies get high
		time = this.toSeconds(time);
		var cutoff = 100;
		if (delaySamples < cutoff){
			this._highFrequencies = true;
			var changeNumber = Math.round((delaySamples / cutoff) * this._filterDelayCount);
			for (var i = 0; i < changeNumber; i++) {
				this._filterDelays[i].setDelay(1 / sampleRate, time);
			}
			delayAmount = Math.floor(delaySamples) / sampleRate;
		} else if (this._highFrequencies){
			this._highFrequencies = false;
			for (var j = 0; j < this._filterDelays.length; j++) {
				this._filterDelays[j].setDelay(0, time);
			}
		}
		this._delayTime.setValueAtTime(delayAmount, time);
	};

	/**
	 *  clean up
	 */
	Tone.LowpassCombFilter.prototype.dispose = function(){
		Tone.prototype.dispose.call(this);
		//dispose the filter delays
		for (var i = 0; i < this._filterDelays.length; i++) {
			this._filterDelays[i].dispose();
			this._filterDelays[i] = null;
		}
		this._delayTime.dispose();
		this.dampening.dispose();
		this.resonance.dispose();
		this._resScale.dispose();
		this._feedback.disconnect();
		this._filterDelays = null;
		this.dampening = null;
		this.resonance = null;
		this._resScale = null;
		this._feedback = null;
		this._delayTime = null;
	};

	// BEGIN HELPER CLASS //

	/**
	 *  FilterDelay
	 *  @internal
	 *  @constructor
	 *  @extends {Tone}
	 */
	var FilterDelay = function(delayTime, filterFreq){
		this.delay = this.input = this.context.createDelay();
		delayTime.connect(this.delay.delayTime);

		this.filter = this.output = this.context.createBiquadFilter();
		filterFreq.connect(this.filter.frequency);

		this.filter.type = "lowpass";
		this.filter.Q.value = 0;

		this.delay.connect(this.filter);
	};

	Tone.extend(FilterDelay);

	FilterDelay.prototype.setDelay = function(amount, time) {
		this.delay.delayTime.setValueAtTime(amount, time);
	};

	/**
	 *  clean up
	 */
	FilterDelay.prototype.dispose = function(){
		this.delay.disconnect();
		this.filter.disconnect();
		this.delay = null;
		this.filter = null;
	};

	// END HELPER CLASS //

	return Tone.LowpassCombFilter;
});