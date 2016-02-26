define(["Tone/core/Tone", "Tone/signal/Signal", "Tone/component/Filter", "Tone/core/Param"], function(Tone){

	"use strict";

	/**
	 *  @class Tone.Lowpass is a lowpass feedback comb filter. It is similar to 
	 *         Tone.FeedbackCombFilter, but includes a lowpass filter.
	 *
	 *  @extends {Tone}
	 *  @constructor
	 *  @param {Time|Object} [delayTime] The delay time of the comb filter
	 *  @param {NormalRange=} resonance The resonance (feedback) of the comb filter
	 *  @param {Frequency=} dampening The cutoff of the lowpass filter dampens the
	 *                                signal as it is fedback. 
	 */
	Tone.LowpassCombFilter = function(){

		Tone.call(this);

		var options = this.optionsObject(arguments, ["delayTime", "resonance", "dampening"], Tone.LowpassCombFilter.defaults);

		/**
		 *  the delay node
		 *  @type {DelayNode}
		 *  @private
		 */
		this._delay = this.input = this.context.createDelay(1);

		/**
		 *  The delayTime of the comb filter. 
		 *  @type {Time}
		 *  @signal
		 */
		this.delayTime = new Tone.Signal(options.delayTime, Tone.Type.Time);

		/**
		 *  the lowpass filter
		 *  @type  {BiquadFilterNode}
		 *  @private
		 */
		this._lowpass = this.output = this.context.createBiquadFilter();
		this._lowpass.Q.value = 0;
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
		 *  @type {GainNode}
		 *  @private
		 */
		this._feedback = this.context.createGain();

		/**
		 *  The amount of feedback of the delayed signal. 
		 *  @type {NormalRange}
		 *  @signal
		 */
		this.resonance = new Tone.Param({
			"param" : this._feedback.gain, 
			"units" : Tone.Type.NormalRange,
			"value" : options.resonance
		});

		//connections
		this._delay.chain(this._lowpass, this._feedback, this._delay);
		this.delayTime.connect(this._delay.delayTime);
		this._readOnly(["dampening", "resonance", "delayTime"]);
	};

	Tone.extend(Tone.LowpassCombFilter);

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
		Tone.prototype.dispose.call(this);
		this._writable(["dampening", "resonance", "delayTime"]);
		this.dampening.dispose();
		this.dampening = null;
		this.resonance.dispose();
		this.resonance = null;
		this._delay.disconnect();
		this._delay = null;
		this._lowpass.disconnect();
		this._lowpass = null;
		this._feedback.disconnect();
		this._feedback = null;
		this.delayTime.dispose();
		this.delayTime = null;
		return this;
	};

	return Tone.LowpassCombFilter;
});