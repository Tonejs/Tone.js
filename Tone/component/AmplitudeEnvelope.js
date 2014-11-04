define(["Tone/core/Tone", "Tone/component/Envelope"], function(Tone){

	"use strict";

	/**
	 *  @class  An Envelope connected to a gain node which can be used as an amplitude envelope.
	 *  
	 *  @constructor
	 *  @extends {Tone.Envelope}
	 *  @param {Tone.Time|Object=} attack  the attack time or an options object will all of the parameters
	 *  @param {Tone.Time=} decay   the decay time
	 *  @param {number=} sustain the sustain amount
	 *  @param {Tone.Time=} release the release time
	 */
	Tone.AmplitudeEnvelope = function(){

		Tone.Envelope.apply(this, arguments);

		/**
		 *  the input node
		 *  @type {GainNode}
		 */
		this.input = this.output = this.context.createGain();

		this._sig.connect(this.output.gain);
	};

	Tone.extend(Tone.AmplitudeEnvelope, Tone.Envelope);

	/**
	 *  clean up
	 */
	Tone.AmplitudeEnvelope.prototype.dispose = function(){
		Tone.Envelope.prototype.dispose.call(this);
	};

	return Tone.AmplitudeEnvelope;
});