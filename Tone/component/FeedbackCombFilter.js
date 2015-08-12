define(["Tone/core/Tone", "Tone/signal/ScaleExp", "Tone/signal/Signal"], function(Tone){

	"use strict";

	/**
	 *  @class Comb filters are basic building blocks for physical modeling. Read more
	 *         about comb filters on [CCRMA's website](https://ccrma.stanford.edu/~jos/pasp/Feedback_Comb_Filters.html).
	 *
	 *  @extends {Tone}
	 *  @constructor
	 *  @param {Time|Object} [delayTime] The delay time of the filter. 
	 *  @param {NormalRange=} resonance The amount of feedback the filter has. 
	 */
	Tone.FeedbackCombFilter = function(){

		Tone.call(this);
		var options = this.optionsObject(arguments, ["delayTime", "resonance"], Tone.FeedbackCombFilter.defaults);

		/**
		 *  The amount of feedback of the delayed signal. 
		 *  @type {NormalRange}
		 *  @signal
		 */
		this.resonance = new Tone.Signal(options.resonance, Tone.Type.NormalRange);

		/**
		 *  the delay node
		 *  @type {DelayNode}
		 *  @private
		 */
		this._delay = this.input = this.output = this.context.createDelay(1);

		/**
		 *  The amount of delay of the comb filter. 
		 *  @type {Time}
		 *  @signal
		 */
		this.delayTime = new Tone.Signal(options.delayTime, Tone.Type.Time);

		/**
		 *  the feedback node
		 *  @type {GainNode}
		 *  @private
		 */
		this._feedback = this.context.createGain();

		this._delay.chain(this._feedback, this._delay);
		this.resonance.connect(this._feedback.gain);
		this.delayTime.connect(this._delay.delayTime);
		this._readOnly(["resonance", "delayTime"]);
	};

	Tone.extend(Tone.FeedbackCombFilter);

	/**
	 *  the default parameters
	 *  @static
	 *  @const
	 *  @type {Object}
	 */
	Tone.FeedbackCombFilter.defaults = {
		"delayTime" : 0.1,
		"resonance" : 0.5
	};

	/**
	 *  clean up
	 *  @returns {Tone.FeedbackCombFilter} this
	 */
	Tone.FeedbackCombFilter.prototype.dispose = function(){
		Tone.prototype.dispose.call(this);
		this._writable(["resonance", "delayTime"]);
		this._delay.disconnect();
		this._delay = null;
		this.delayTime.dispose();
		this.delayTime = null;
		this.resonance.dispose();
		this.resonance = null;
		this._feedback.disconnect();
		this._feedback = null;
		return this;
	};

	return Tone.FeedbackCombFilter;
});