define(["Tone/core/Tone", "Tone/signal/Signal", "Tone/component/Filter", "Tone/core/AudioNode",
	"Tone/core/Param", "Tone/core/Gain", "Tone/core/Delay"], function(Tone){

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
		this.createInsOuts(1, 1);

		/**
		 *  the delay node
		 *  @type {DelayNode}
		 *  @private
		 */
		this._delay = this.input = new Tone.Delay(options.delayTime);

		/**
		 *  The delayTime of the comb filter.
		 *  @type {Time}
		 *  @signal
		 */
		this.delayTime = this._delay.delayTime;

		/**
		 *  the lowpass filter
		 *  @type  {BiquadFilterNode}
		 *  @private
		 */
		this._lowpass = this.output = this.context.createBiquadFilter();
		this._lowpass.Q.value = -3.0102999566398125;
		this._lowpass.type = "lowpass";

		/**
		 *  The dampening control of the feedback
		 *  @type {Frequency}
		 *  @signal
		 */
		this.dampening = new Tone.Param({
			"param" : this._lowpass.frequency,
			"units" : Tone.Type.Frequency,
			"value" : options.dampening
		});

		/**
		 *  the feedback gain
		 *  @type {Tone.Gain}
		 *  @private
		 */
		this._feedback = new Tone.Gain(options.resonance, Tone.Type.NormalRange);

		/**
		 *  The amount of feedback of the delayed signal.
		 *  @type {NormalRange}
		 *  @signal
		 */
		this.resonance = this._feedback.gain;

		//connections
		this._delay.chain(this._lowpass, this._feedback, this._delay);
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
		this.dampening.dispose();
		this.dampening = null;
		this.resonance.dispose();
		this.resonance = null;
		this._delay.dispose();
		this._delay = null;
		this.delayTime = null;
		this._lowpass.disconnect();
		this._lowpass = null;
		this._feedback.disconnect();
		this._feedback = null;
		return this;
	};

	return Tone.LowpassCombFilter;
});
