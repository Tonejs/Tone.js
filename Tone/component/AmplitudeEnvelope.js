define(["../core/Tone", "../component/Envelope", "../core/Gain"], function(Tone){

	"use strict";

	/**
	 *  @class  Tone.AmplitudeEnvelope is a Tone.Envelope connected to a gain node.
	 *          Unlike Tone.Envelope, which outputs the envelope's value, Tone.AmplitudeEnvelope accepts
	 *          an audio signal as the input and will apply the envelope to the amplitude
	 *          of the signal. Read more about ADSR Envelopes on [Wikipedia](https://en.wikipedia.org/wiki/Synthesizer#ADSR_envelope).
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
	 * var ampEnv = new Tone.AmplitudeEnvelope({
	 * 	"attack": 0.1,
	 * 	"decay": 0.2,
	 * 	"sustain": 1.0,
	 * 	"release": 0.8
	 * }).toMaster();
	 * //create an oscillator and connect it
	 * var osc = new Tone.Oscillator().connect(ampEnv).start();
	 * //trigger the envelopes attack and release "8t" apart
	 * ampEnv.triggerAttackRelease("8t");
	 */
	Tone.AmplitudeEnvelope = function(){

		Tone.Envelope.apply(this, arguments);

		/**
		 *  the input node
		 *  @type {GainNode}
		 *  @private
		 */
		this.input = this.output = new Tone.Gain();

		this._sig.connect(this.output.gain);
	};

	Tone.extend(Tone.AmplitudeEnvelope, Tone.Envelope);

	/**
	 *  Clean up
	 *  @return  {Tone.AmplitudeEnvelope}  this
	 */
	Tone.AmplitudeEnvelope.prototype.dispose = function(){
		Tone.Envelope.prototype.dispose.call(this);
		return this;
	};

	return Tone.AmplitudeEnvelope;
});
