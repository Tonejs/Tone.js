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
		
		this.highPass0 = new Tone.Filter(options.highPass0).connect(this.output);
		this.highPass1 = new Tone.Filter(options.highPass1).connect(this.output);
		this.highPass2 = new Tone.Filter(options.highPass2).connect(this.output);

		this.envelope0 = new Tone.AmplitudeEnvelope(options.envelope0).connect(this.highPass0);
		this.envelope1 = new Tone.AmplitudeEnvelope(options.envelope1).connect(this.highPass1);
		this.envelope1.connect(this.highPass2);

		this.bandPass0 = new Tone.Filter(options.bandPass0).connect(this.envelope0);
		this.bandPass1 = new Tone.Filter(options.bandPass1).connect(this.envelope1);


		//frequencies from https://ccrma.stanford.edu/papers/tr-808-cymbal-physically-informed-circuit-bendable-digital-model
		var freqArray = [205.3, 304.4, 396.6, 522.7, 540, 800];
		this.oscArray = [];

		//look at different oscillators 

		for(var i = 0; i < 6; i++){
			this.oscArray[i] = new Tone.Oscillator(freqArray[i], "square");
			this.oscArray[i].connect(this.bandPass0);
			this.oscArray[i].connect(this.bandPass1);
			this.oscArray[i].start();
		}


	};

	Tone.extend(Tone.CymbalSynth, Tone.Instrument);

	//harmonicity between oscillators?
	//use existing freqs for ratios
	//try spreading ratios

	Tone.CymbalSynth.defaults = {
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
		"envelope0" : {
			"attack" : 0.01,
			"decay" : 0.25,
			"sustain" : 0.0,
			"release" : 0.0,
			"attackCurve" : "exponential"
		},
		"envelope1" : {
			"attack" : 0.01,
			"decay" : 3.0,
			"sustain" : 0.0,
			"release" : 0.0,
			"attackCurve" : "exponential"
		},
		"envelope2" : {
			"attack" : 0.01,
			"decay" : 3.0,
			"sustain" : 0.0,
			"release" : 0.0,
			"attackCurve" : "exponential"
		},
		"highPass0" : {
			"type" : "highpass",
			"frequency" : 6600,
			"rolloff" : -12,
			"Q" : 3.2,
			"gain" : 1.17
		},
		"highPass1" : {
			"type" : "highpass",
			"frequency" : 11500,
			"rolloff" : -12,
			"Q" : 2,
			"gain" : 8
		},
		"highPass2" : {
			"type" : "highpass",
			"frequency" : 10500,
			"rolloff" : -12,
			"Q" : 6,
			"gain" : 21
		}
	};

	//we will use trigger release to do choking
	//think about how to do choke channels?
	//
	//git checkout on envelope since there were some changes
	//and retry with a smaller number

	Tone.CymbalSynth.prototype.triggerAttack = function(time, velocity){
		time = this.toSeconds(time);

		this.envelope0.triggerAttack(time);
		this.envelope1.triggerAttack(time);
		//this.envelope2.triggerAttack(time);

		//this.envelope0.triggerRelease(time + 0.01);
		//this.envelope1.triggerRelease(time + 0.01);
		//this.envelope2.triggerRelease(time + 0.01);
		return this;
	};

	//no attackrelease
	//look at plucksynth is the same
	//add to docs
	//look at current ADSR envelope and structure
	//yotam wants to make an AR envelope maybe?

	Tone.CymbalSynth.prototype.triggerRelease = function(time){
		this.envelope0.triggerRelease(time);
		this.envelope1.triggerRelease(time);
		//this.envelope2.triggerRelease(time);
		return this;
	};

	Tone.CymbalSynth.prototype.dispose = function(){};

	return Tone.CymbalSynth;
});



