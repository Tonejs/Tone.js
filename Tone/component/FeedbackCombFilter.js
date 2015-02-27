define(["Tone/core/Tone", "Tone/signal/ScaleExp", "Tone/signal/Signal"], function(Tone){

	"use strict";

	/**
	 *  @class A comb filter with feedback.
	 *
	 *  @extends {Tone}
	 *  @constructor
	 *  @param {number} [minDelay=0.01] the minimum delay time which the filter can have
	 *  @param {number} [maxDelay=1] the maximum delay time which the filter can have
	 */
	Tone.FeedbackCombFilter = function(){

		Tone.call(this);
		var options = this.optionsObject(arguments, ["minDelay", "maxDelay"], Tone.FeedbackCombFilter.defaults);

		var minDelay = options.minDelay;
		var maxDelay = options.maxDelay;
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
		this._delayCount = delayCount;

		/**
		 *  @type {Array.<FilterDelay>}
		 *  @private
		 */
		this._delays = new Array(this._delayCount);

		/**
		 *  the resonance control
		 *  @type {Tone.Signal}
		 */
		this.resonance = new Tone.Signal(options.resonance, Tone.Signal.Units.Normal);

		/**
		 *  scale the resonance value to the normal range
		 *  @type {Tone.Scale}
		 *  @private
		 */
		this._resScale = new Tone.ScaleExp(0.01, 1 / this._delayCount - 0.001, 0.5);

		/**
		 *  internal flag for keeping track of when frequency
		 *  correction has been used
		 *  @type {boolean}
		 *  @private
		 */
		this._highFrequencies = false;

		/**
		 *  internal counter of delayTime
		 *  @type {Tone.TIme}
		 *  @private
		 */
		this._delayTime = options.delayTime;

		/**
		 *  the feedback node
		 *  @type {GainNode}
		 *  @private
		 */
		this._feedback = this.context.createGain();

		//make the filters
		for (var i = 0; i < this._delayCount; i++) {
			var delay = this.context.createDelay(maxDelay);
			delay.delayTime.value = minDelay;
			delay.connect(this._feedback);
			this._delays[i] = delay;
		}

		//connections
		this.connectSeries.apply(this, this._delays);
		this.input.connect(this._delays[0]);
		//set the delay to the min value initially
		this._feedback.connect(this._delays[0]);
		//resonance control
		this.resonance.chain(this._resScale, this._feedback.gain);
		this._feedback.connect(this.output);
		this.delayTime = options.delayTime;
	};

	Tone.extend(Tone.FeedbackCombFilter);

	/**
	 *  the default parameters
	 *  @static
	 *  @const
	 *  @type {Object}
	 */
	Tone.FeedbackCombFilter.defaults = {
		"resonance" : 0.5,
		"minDelay" : 0.1,
		"maxDelay" : 1,
		"delayTime" : 0.1
	};

	/**
	 * the delay time of the FeedbackCombFilter
	 * @memberOf Tone.FeedbackCombFilter#
	 * @type {Tone.Time}
	 * @name delayTime
	 */
	Object.defineProperty(Tone.FeedbackCombFilter.prototype, "delayTime", {
		get : function(){
			return this._delayTime;
		},
		set : function(delayAmount){
			this._delayTime = delayAmount;
			delayAmount = this.toSeconds(delayAmount);
			//the number of samples to delay by
			var sampleRate = this.context.sampleRate;
			var delaySamples = sampleRate * delayAmount;
			// delayTime corection when frequencies get high
			var now = this.now() + this.bufferTime;
			var cutoff = 100;
			if (delaySamples < cutoff){
				this._highFrequencies = true;
				var changeNumber = Math.round((delaySamples / cutoff) * this._delayCount);
				for (var i = 0; i < changeNumber; i++) {
					this._delays[i].delayTime.setValueAtTime(1 / sampleRate + delayAmount, now);
				}
				delayAmount = Math.floor(delaySamples) / sampleRate;
			} else if (this._highFrequencies){
				this._highFrequencies = false;
				for (var j = 0; j < this._delays.length; j++) {
					this._delays[j].delayTime.setValueAtTime(delayAmount, now);
				}
			}
		}
	});

	/**
	 *  clean up
	 *  @returns {Tone.FeedbackCombFilter} `this`
	 */
	Tone.FeedbackCombFilter.prototype.dispose = function(){
		Tone.prototype.dispose.call(this);
		//dispose the filter delays
		for (var i = 0; i < this._delays.length; i++) {
			this._delays[i].disconnect();
			this._delays[i] = null;
		}
		this._delays = null;
		this.resonance.dispose();
		this.resonance = null;
		this._resScale.dispose();
		this._resScale = null;
		this._feedback.disconnect();
		this._feedback = null;
		return this;
	};

	return Tone.FeedbackCombFilter;
});