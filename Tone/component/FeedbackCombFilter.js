define(["Tone/core/Tone", "Tone/signal/ScaleExp", "Tone/signal/Signal"], function(Tone){

	"use strict";

	/**
	 *  @class A comb filter with feedback.
	 *
	 *  @extends {Tone}
	 *  @constructor
	 *  @param {number} [delayTime=0.1] the minimum delay time which the filter can have
	 *  @param {number} [resonance=0.5] the maximum delay time which the filter can have
	 */
	Tone.FeedbackCombFilter = function(){

		Tone.call(this);
		var options = this.optionsObject(arguments, ["delayTime", "resonance"], Tone.FeedbackCombFilter.defaults);

		/**
		 *  the resonance control
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
		 *  the delayTime
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