define(["Tone/core/Tone", "Tone/signal/ScaleExp", "Tone/signal/Signal",
	"Tone/core/Param", "Tone/core/Delay", "Tone/core/Gain", "Tone/core/AudioNode"], function(Tone){

	"use strict";

	/**
	 *  @class Comb filters are basic building blocks for physical modeling. Read more
	 *         about comb filters on [CCRMA's website](https://ccrma.stanford.edu/~jos/pasp/Feedback_Comb_Filters.html).
	 *
	 *  @extends {Tone.AudioNode}
	 *  @constructor
	 *  @param {Time|Object} [delayTime] The delay time of the filter.
	 *  @param {NormalRange=} resonance The amount of feedback the filter has.
	 */
	Tone.FeedbackCombFilter = function(){

		var options = Tone.defaults(arguments, ["delayTime", "resonance"], Tone.FeedbackCombFilter);
		Tone.AudioNode.call(this);

		/**
		 *  the delay node
		 *  @type {DelayNode}
		 *  @private
		 */
		this._delay = this.input = this.output = new Tone.Delay(options.delayTime);

		/**
		 *  The amount of delay of the comb filter.
		 *  @type {Time}
		 *  @signal
		 */
		this.delayTime = this._delay.delayTime;

		/**
		 *  the feedback node
		 *  @type {GainNode}
		 *  @private
		 */
		this._feedback = new Tone.Gain(options.resonance, Tone.Type.NormalRange);

		/**
		 *  The amount of feedback of the delayed signal.
		 *  @type {NormalRange}
		 *  @signal
		 */
		this.resonance = this._feedback.gain;

		this._delay.chain(this._feedback, this._delay);
		this._readOnly(["resonance", "delayTime"]);
	};

	Tone.extend(Tone.FeedbackCombFilter, Tone.AudioNode);

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
		Tone.AudioNode.prototype.dispose.call(this);
		this._writable(["resonance", "delayTime"]);
		this._delay.dispose();
		this._delay = null;
		this.delayTime = null;
		this._feedback.dispose();
		this._feedback = null;
		this.resonance = null;
		return this;
	};

	return Tone.FeedbackCombFilter;
});
