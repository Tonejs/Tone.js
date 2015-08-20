define(["Tone/core/Tone", "Tone/source/Oscillator", "Tone/instrument/Instrument", 
	"Tone/component/AmplitudeEnvelope", "Tone/component/Filter"],
function(Tone){

	"use strict";

	Tone.CymbalSynth = function(options){

		//for styling, look at the JCReverb
		//set values for components in arrays
		
		//signal rate for controls
		//look at Tone.Multiply
		//
		//make things private 

		options = this.defaultArg(options, Tone.CymbalSynth.defaults);
		Tone.Instrument.call(this, options);

		//,
		// "highPass0" : {
		// 	"type" : "highpass",
		// 	"frequency" : 6600,
		// 	"rolloff" : -12,
		// 	"Q" : 3.2,
		// 	"gain" : 1.17
		// },
		// "highPass1" : {
		// 	"type" : "highpass",
		// 	"frequency" : 11500,
		// 	"rolloff" : -12,
		// 	"Q" : 2,
		// 	"gain" : 8
		// },
		// "highPass2" : {
		// 	"type" : "highpass",
		// 	"frequency" : 10500,
		// 	"rolloff" : -12,
		// 	"Q" : 6,
		// 	"gain" : 21
		// }
		
		var highPassFreq = [6600, 11500, 10500];
		var highPassQ = [3.2, 2, 6];

		this.highPass0 = new Tone.Filter(highPassFreq[0], "highpass", -12).connect(this.output);
		this.highPass1 = new Tone.Filter(highPassFreq[1], "highpass", -12).connect(this.output);
		this.highPass2 = new Tone.Filter(highPassFreq[2], "highpass", -12).connect(this.output);
		this.highPass0.Q = highPassQ[0];
		this.highPass1.Q = highPassQ[1];
		this.highPass1.Q = highPassQ[2];
		//cymbal helper class? yotam wants better name!

		//this allows to have discrete components
		//
		//ratio of inharmonicity - 0 is most harminous and 1 least?

		this.strikeEnvelope = new Tone.AmplitudeEnvelope(options.strikeEnvelope).connect(this.highPass0);
		this.bodyEnvelope = new Tone.AmplitudeEnvelope(options.bodyEnvelope).connect(this.highPass1);
		this.bodyEnvelope.connect(this.highPass2);

		this.bandPass0 = new Tone.Filter(options.bandPass0).connect(this.strikeEnvelope);
		this.bandPass1 = new Tone.Filter(options.bandPass1).connect(this.bodyEnvelope);


		//frequencies from https://ccrma.stanford.edu/papers/tr-808-cymbal-physically-informed-circuit-bendable-digital-model
		var freqArray = [205.3, 304.4, 396.6, 522.7, 540, 800];
		
		this.harmonicity = new Tone.Signal(options.harmonicity);
		this.harmonicity.units = Tone.Type.Positive;

		//the 808 base frequency
		//yotam - change to frequency
		this.frequency = new Tone.Signal(options.frequency, Tone.Type.Frequency);

		//frequency ration for the 808
		this.inharmRatios = [1.0, 1.483, 1.932, 2.546, 2.630, 3.897];

		//harmonic frequency ratio
		this.harmRatios = [1.0, 1.5, 2.025, 2.975, 4.0, 6.0];

		this.inharmRatioSignal = [];
		this.harmMinusSignal = [];
		this._oscillators = [];
		this.freqMult  = [];

		//originally: this.frequency*(this.harmRatio[i]*this.harmonicity + this.inharmRatio[i]*(1 - this.harmonicity))
		//simplified formula : frequency(harmonicity * (harmRatio - inharmRatio) +inharmRatio)

		//simplified formula : frequency(harmonicity * harmMinus +inharmRatio)

		for(var i = 0; i < 6; i++){
			//rebuild these with Tone.scaled

			this.inharmRatioSignal[i] = new Tone.Add(this.inharmRatios[i]);
			this.harmMinusSignal[i] = new Tone.Multiply(this.harmRatios[i] - this.inharmRatios[i]).connect(this.inharmRatioSignal[i]);

			this.harmonicity.connect(this.harmMinusSignal[i]);

			var freqMult = new Tone.Multiply()
			this.inharmRatioSignal[i].connect(freqMult, 0, 0);
			this.frequency.connect(freqMult, 0, 1);

			this._oscillators[i] = new Tone.Oscillator({
				"type" : "square"
			});

			freqMult.connect(this._oscillators[i].frequency)
			this._oscillators[i].connect(this.bandPass0);
			this._oscillators[i].connect(this.bandPass1);
			this._oscillators[i].start();
		}

	};

	Tone.extend(Tone.CymbalSynth, Tone.Instrument);

	Tone.CymbalSynth.defaults = {
		"harmonicity" : 0,
		"frequency" : 205.3,
		// "attack" : {
		// 	"attack" : ,
		// 	"decay" : ,
		// 	//bandpass freq window
		// 	"bandpass" : ,
		// 	//highpass frequency
		// 	"highpass" : ,
		// 	//combined q values
		// 	"resonance" : 
		// }
		// "bodyEnvelope" : {
		// 	"attack" : ,
		// 	"decay" : ,
		// 	"bandpass" : ,
		// 	"highpass" : ,
		// 	"resonance" :
		// },
		//"choke" : true;
		"bandPass0": {
			"type" : "bandpass",
			"frequency" : 3500,
			"rolloff" : -12,
			"Q" : 6,
			"gain" : 23
		},
		"bandPass1" : {
			"type" : "bandpass",
			"frequency" : 7000,
			"rolloff" : -12,
			"Q" : 6,
			"gain" : 24
		},
		"strikeEnvelope" : {
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

		this.strikeEnvelope.triggerAttack(time);
		this.bodyEnvelope.triggerAttack(time);

		return this;
	};

	//no attackrelease
	//look at plucksynth is the same
	//add to docs
	//look at current ADSR envelope and structure
	//yotam wants to make an AR envelope maybe?

	Tone.CymbalSynth.prototype.triggerRelease = function(time){
		this.strikeEnvelope.triggerRelease(time);
		this.bodyEnvelope.triggerRelease(time);
		//this.envelope2.triggerRelease(time);
		return this;
	};

	Tone.CymbalSynth.prototype.dispose = function(){};

	return Tone.CymbalSynth;
});



