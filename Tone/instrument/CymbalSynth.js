define(["Tone/core/Tone", "Tone/source/Oscillator", "Tone/instrument/Instrument", 
	"Tone/component/AmplitudeEnvelope", "Tone/component/Filter"],
function(Tone){

	"use strict";

	Tone.CymbalSynth = function(options){
		//sources
		//http://www.soundonsound.com/sos/jul02/articles/synthsecrets0702.asp


		//add "tone" control mixer - "All three bands then pass through high-pass filters 
		//to remove more yet low-frequency components, 
		//before a user-controlled mixer recombines them into a single signal 
		//(the TR808 tone control affects this mix of low, mid and high bands)."

		//can we PWM or allow phase control on the oscillators?

		//for styling, look at the JCReverb
		//set values for components in arrays

		//make things private 

		options = this.defaultArg(options, Tone.CymbalSynth.defaults);
		Tone.Instrument.call(this, options);

		var highPassFreq = [6600, 11500, 10500];
		var highPassQ = [3.2, 2, 6];

		this._highPass0 = new Tone.Filter({
			"type" : "highpass",
			//"frequency" : highPassFreq[0],
			//"Q" : highPassQ[0]
		}).connect(this.output);

		this._highPass1 = new Tone.Filter({
			"type" : "highpass",
			//"frequency" : highPassFreq[1],
			//"Q" : highPassQ[1]
		}).connect(this.output);

		this._highPass2 = new Tone.Filter({
			"type" : "highpass",
			//"frequency" : highPassFreq[2],
			//"Q" : highPassQ[2]
		}).connect(this.output);

		//cymbal helper class? yotam wants better name!

		//this allows to have discrete components
		//
		//ratio of inharmonicity - 0 is most harminous and 1 least?

		this.impactEnvelope = new Tone.AmplitudeEnvelope(options.impactEnvelope).connect(this._highPass0);
		this.bodyEnvelope = new Tone.AmplitudeEnvelope(options.bodyEnvelope).connect(this._highPass1);
		this.bodyEnvelope.connect(this._highPass2);

		this._bandPass0 = new Tone.Filter({
			"type" : "bandpass",
			//"frequency" : 3500,
			"rolloff" : -12,
			//"Q" : 6,
			"gain" : 23
		}).connect(this.impactEnvelope);
		this._bandPass1 = new Tone.Filter({
			"type" : "bandpass",
			//"frequency" : 7000,
			"rolloff" : -12,
			//"Q" : 6,
			"gain" : 24
		}).connect(this.bodyEnvelope);

		//impact cutoff -> bandpass0 ->*x -> highpass0
		this.impactCutoff = new Tone.Signal(options.impactCutoff).connect(this._bandPass0.frequency);
		this._impactHighpassCutoff = new Tone.Multiply(1.886).connect(this._highPass0.frequency);

		this.impactCutoff.connect(this._impactHighpassCutoff);

		this._impactHighpassRes = new Tone.Multiply(1.875);
		this._impactHighpassRes.connect(this._bandPass0.Q);
		this.impactResonance = new Tone.Signal(options.impactResonance).connect(this._impactHighpassRes);
		this.impactResonance.connect(this._highPass0.Q);

		this.bodyCutoff = new Tone.Signal(options.bodyCutoff).connect(this._bandPass1.frequency);
		this._bodyHighpass1Cutoff = new Tone.Multiply(1.643).connect(this._highPass2.frequency);
		this._bodyHighpass2Cutoff = new Tone.Multiply(1.5).connect(this._highPass1.frequency);
		this.bodyCutoff.connect(this._bodyHighpass1Cutoff);
		this.bodyCutoff.connect(this._bodyHighpass2Cutoff);

		this.bodyResonance = new Tone.Signal(options.bodyResonance).connect(this._bandPass1.Q);
		this.bodyResonance.connect(this._highPass2.Q);
		this._bodyHighpassResonance = new Tone.Multiply(0.333).connect(this._highPass1.Q);
		this.bodyResonance.connect(this._bodyHighpassResonance);

		//frequencies from https://ccrma.stanford.edu/papers/tr-808-cymbal-physically-informed-circuit-bendable-digital-model
		//var freqArray = [205.3, 304.4, 396.6, 522.7, 540, 800];
		
		this.harmonicity = new Tone.Signal(options.harmonicity);
		this.harmonicity.units = Tone.Type.Positive;

		//the 808 base frequency
		this.frequency = new Tone.Signal(options.frequency, Tone.Type.Frequency);

		//frequency ratio for the 808
		this.inharmRatios = [1.0, 1.483, 1.932, 2.546, 2.630, 3.897];

		//harmonic frequency ratio
		this.harmRatios = [1.0, 1.5, 2.025, 2.975, 4.0, 6.0];

		this._oscillators = [];
		this._freqMult  = [];

		this.scaledSignals = [];

		//originally: this.frequency*(this.harmRatio[i]*this.harmonicity + this.inharmRatio[i]*(1 - this.harmonicity))
		//simplified formula : frequency(harmonicity * (harmRatio - inharmRatio) +inharmRatio)

		//simplified formula : frequency(harmonicity * harmMinus +inharmRatio)

		for(var i = 0; i < 6; i++){

			this.scaledSignals[i] = new Tone.Scale(this.inharmRatios[i], this.harmRatios[i]);

			this.harmonicity.connect(this.scaledSignals[i]);

			this._freqMult[i] = new Tone.Multiply();
			this.scaledSignals[i].connect(this._freqMult[i], 0, 0);
			this.frequency.connect(this._freqMult[i], 0, 1);

			// this._oscillators[i] = new Tone.Oscillator({
			// 	"type" : "square"
			// });

			this._oscillators[i] = new Tone.PWMOscillator();
			this._oscillators[i].modulationFrequency.value = 10;

			this._freqMult[i].connect(this._oscillators[i].frequency);

			this._oscillators[i].connect(this._bandPass0);
			this._oscillators[i].connect(this._bandPass1);
			this._oscillators[i].start();
		}

	};

	Tone.extend(Tone.CymbalSynth, Tone.Instrument);

	Tone.CymbalSynth.defaults = {
		"harmonicity" : 0,
		"frequency" : 205.3,
		// "body" : {
		// 	"resonance" : asdf,
		// 	"cuttoff" : asdf,
		// 	"envelope" : {

		// 	}
		// }
		"bodyResonance" : 6,
		"bodyCutoff" : 7000,
		"impactCutoff" : 3500,
		"impactResonance" : 3.2,
		"impactEnvelope" : {
			"attack" : 0.01,
			"decay" : 0.25,
			"sustain" : 0.0,
			"release" : 0.0,
			"attackCurve" : "exponential"
		},
		"bodyEnvelope" : {
			"attack" : 0.01,
			"decay" : 3.0,
			"sustain" : 0.0,
			"release" : 0.0,
			"attackCurve" : "exponential"
		}
	};

	//
	//git checkout on envelope since there were some changes
	//and retry with a smaller number

	Tone.CymbalSynth.prototype.triggerAttack = function(time, velocity){
		time = this.toSeconds(time);

		this.impactEnvelope.triggerAttack(time);
		this.bodyEnvelope.triggerAttack(time);

		return this;
	};

	Tone.CymbalSynth.prototype.triggerRelease = function(time){
		this.impactEnvelope.triggerRelease(time);
		this.bodyEnvelope.triggerRelease(time);
		//this.envelope2.triggerRelease(time);
		return this;
	};

	Tone.CymbalSynth.prototype.dispose = function(){};

	/**
	 * Cymbal part helper class
	 * @private
	 */
	var CymbalComponent = function(){
		//envelope (input)


		//create your filter (output)

		//envelope->filter

	}

//	Tone.extend(CymbalComponent);

	return Tone.CymbalSynth;
});



