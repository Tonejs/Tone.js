define(["Tone/core/Tone", "Tone/component/Envelope"], function(Tone){

	"use strict";

	/**
	 *  @class  An Envelope connected to a gain node which can be used as an amplitude envelope.
	 *  
	 *  @constructor
	 *  @extends {Tone.Envelope}
	 *  @param {Time|Object} [attack] The amount of time it takes for the envelope to go from 
	 *                               0 to it's maximum value. 
	 *  @param {Time} [decay]	The period of time after the attack that it takes for the envelope
	 *                       	to fall to the sustain value. 
	 *  @param {NormalRange} [sustain]	The percent of the maximum value that the envelope rests at until
	 *                                	the release is triggered. 
	 *  @param {Time} [release]	The amount of time after the release is triggered it takes to reach 0. 
	 *  @example
	 * var ampEnv = new Tone.AmplitudeEnvelope(0.1, 0.2, 1, 0.8);
	 * var osc = new Tone.Oscillator();
	 * //or with an object
	 * osc.chain(ampEnv, Tone.Master);
	 */
	Tone.AmplitudeEnvelope = function(){

		Tone.Envelope.apply(this, arguments);

		/**
		 *  the input node
		 *  @type {GainNode}
		 *  @private
		 */
		this.input = this.output = this.context.createGain();

		this._sig.connect(this.output.gain);
	};

	Tone.extend(Tone.AmplitudeEnvelope, Tone.Envelope);

	return Tone.AmplitudeEnvelope;
});