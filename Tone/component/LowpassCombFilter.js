define(["Tone/core/Tone", "Tone/signal/ScaleExp", "Tone/signal/Signal"], function(Tone){

	"use strict";

	/**
	 *  @class A lowpass feedback comb filter. 
	 *         DelayNode -> Lowpass Filter -> feedback
	 *
	 *  @extends {Tone}
	 *  @constructor
	 *  @param {number} [minDelay=0.1] the minimum delay time which the filter can have
	 *  @param {number} [maxDelay=1] the maximum delay time which the filter can have
	 */
	Tone.LowpassCombFilter = function(minDelay, maxDelay){

		Tone.call(this);

		minDelay = this.defaultArg(minDelay, 0.01);
		maxDelay = this.defaultArg(maxDelay, 1);
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
		this._resScale = new Tone.ScaleExp(0.01, 1 / this._filterDelayCount - 0.001, 0.5);

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
			var filterDelay = new FilterDelay(minDelay, this.dampening);
			filterDelay.connect(this._feedback);
			this._filterDelays[i] = filterDelay;
		}

		//connections
		this.input.connect(this._filterDelays[0]);
		this._feedback.connect(this._filterDelays[0]);
		this.connectSeries.apply(this, this._filterDelays);
		//resonance control
		this.resonance.chain(this._resScale, this._feedback.gain);
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
	 *  @param {Tone.Time} [time=now]        when the change should occur
	 *  @returns {Tone.LowpassCombFilter} `this`
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
				this._filterDelays[i].setDelay(1 / sampleRate + delayAmount, time);
			}
			delayAmount = Math.floor(delaySamples) / sampleRate;
		} else if (this._highFrequencies){
			this._highFrequencies = false;
			for (var j = 0; j < this._filterDelays.length; j++) {
				this._filterDelays[j].setDelay(delayAmount, time);
			}
		}
		return this;
	};

	/**
	 *  clean up
	 *  @returns {Tone.LowpassCombFilter} `this`
	 */
	Tone.LowpassCombFilter.prototype.dispose = function(){
		Tone.prototype.dispose.call(this);
		//dispose the filter delays
		for (var i = 0; i < this._filterDelays.length; i++) {
			this._filterDelays[i].dispose();
			this._filterDelays[i] = null;
		}
		this._filterDelays = null;
		this.dampening.dispose();
		this.dampening = null;
		this.resonance.dispose();
		this.resonance = null;
		this._resScale.dispose();
		this._resScale = null;
		this._feedback.disconnect();
		this._feedback = null;
		return this;
	};

	// BEGIN HELPER CLASS //

	/**
	 *  FilterDelay
	 *  @internal
	 *  @constructor
	 *  @extends {Tone}
	 */
	var FilterDelay = function(maxDelay, filterFreq){
		this.delay = this.input = this.context.createDelay(maxDelay);
		this.delay.delayTime.value = maxDelay;

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
		this.delay = null;
		this.filter.disconnect();
		this.filter = null;
	};

	// END HELPER CLASS //

	return Tone.LowpassCombFilter;
});