define(["Tone/core/Tone", "Tone/component/Envelope"], function(Tone){

	"use strict";

	/**
	 *  @class  An Envelope connected to a gain node which can be used as an amplitude envelope.
	 *  
	 *  @constructor
	 *  @extends {Tone.Envelope}
	 *  @param {Tone.Time|Object} [attack=0.01]	the attack time in seconds
	 *  @param {Tone.Time} [decay=0.1]	the decay time in seconds
	 *  @param {number} [sustain=0.5] 	a percentage (0-1) of the full amplitude
	 *  @param {Tone.Time} [release=1]	the release time in seconds
	 *  @example
	 *  
	 *  var ampEnv = new Tone.AmplitudeEnvelope(0.1, 0.2, 1, 0.8);
	 *  var osc = new Tone.Oscillator();
	 *  //or with an object
	 *  osc.chain(ampEnv, Tone.Master);
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