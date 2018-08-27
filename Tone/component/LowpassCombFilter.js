define(["../core/Tone", "../signal/Signal", "../component/Filter", "../core/AudioNode", "../component/FeedbackCombFilter"], function(Tone){

	"use strict";

	/**
	 *  @class Tone.Lowpass is a lowpass feedback comb filter. It is similar to
	 *         Tone.FeedbackCombFilter, but includes a lowpass filter.
	 *
	 *  @extends {Tone.AudioNode}
	 *  @constructor
	 *  @param {Time|Object} [delayTime] The delay time of the comb filter
	 *  @param {NormalRange=} resonance The resonance (feedback) of the comb filter
	 *  @param {Frequency=} dampening The cutoff of the lowpass filter dampens the
	 *                                signal as it is fedback.
	 */
	Tone.LowpassCombFilter = function(){

		var options = Tone.defaults(arguments, ["delayTime", "resonance", "dampening"], Tone.LowpassCombFilter);
		Tone.AudioNode.call(this);

		/**
		 *  the delay node
		 *  @type {DelayNode}
		 *  @private
		 */
		this._combFilter = this.output = new Tone.FeedbackCombFilter(options.delayTime, options.resonance);

		/**
		 *  The delayTime of the comb filter.
		 *  @type {Time}
		 *  @signal
		 */
		this.delayTime = this._combFilter.delayTime;

		/**
		 *  the lowpass filter
		 *  @type  {BiquadFilterNode}
		 *  @private
		 */
		this._lowpass = this.input = new Tone.Filter({
			"frequency" : options.dampening,
			"type" : "lowpass",
			"Q" : 0,
			"rolloff" : -12
		});

		/**
		 *  The dampening control of the feedback
		 *  @type {Frequency}
		 *  @signal
		 */
		this.dampening = this._lowpass.frequency;
		
		/**
		 *  The amount of feedback of the delayed signal.
		 *  @type {NormalRange}
		 *  @signal
		 */
		this.resonance = this._combFilter.resonance;

		//connections
		this._lowpass.connect(this._combFilter);
		this._readOnly(["dampening", "resonance", "delayTime"]);
	};

	Tone.extend(Tone.LowpassCombFilter, Tone.AudioNode);

	/**
	 *  the default parameters
	 *  @static
	 *  @const
	 *  @type {Object}
	 */
	Tone.LowpassCombFilter.defaults = {
		"delayTime" : 0.1,
		"resonance" : 0.5,
		"dampening" : 3000
	};

	/**
	 *  Clean up.
	 *  @returns {Tone.LowpassCombFilter} this
	 */
	Tone.LowpassCombFilter.prototype.dispose = function(){
		Tone.AudioNode.prototype.dispose.call(this);
		this._writable(["dampening", "resonance", "delayTime"]);
		this._combFilter.dispose();
		this._combFilter = null;
		this.resonance = null;
		this.delayTime = null;
		this._lowpass.dispose();
		this._lowpass = null;
		this.dampening = null;
		return this;
	};

	return Tone.LowpassCombFilter;
});
