define(["Tone/core/Tone", "Tone/instrument/Instrument", "Tone/source/Noise", "Tone/signal/ScaleExp"], function(Tone){

	"use strict";

	/**
	 *  @class Karplus-String string synthesis. 
	 *  
	 *  @constructor
	 *  @extends {Tone.Instrument}
	 */
	Tone.PluckSynth = function(){
		Tone.Instrument.call(this);

		/**
		 *  @type {Tone.Noise}
		 *  @private
		 */
		this._noise = new Tone.Noise("pink");

		/**
		 *  the number of filter delay
		 *  @type {number}
		 *  @private
		 */
		this._filterDelayCount = 8;

		/**
		 *  @type {Array.<BiquadFilterNode>}
		 *  @private
		 */
		this._filterDelays = new Array(this._filterDelayCount);

		/**
		 *  the frequency control
		 *  @type {Tone.Signal}
		 */
		this.frequency = new Tone.Signal(1);

		/**
		 *  the dampening control
		 *  @type {Tone.Signal}
		 */
		this.dampening = new Tone.Signal(3000);

		/**
		 *  the dampening control
		 *  @type {Tone.Signal}
		 */
		this.resonance = new Tone.Signal(0.5);

		/**
		 *  scale the resonance value to the normal range
		 *  @type {Tone.Scale}
		 *  @private
		 */
		this._resScale = new Tone.ScaleExp(0, 1, 0.01, 1 / this._filterDelayCount - 0.001, 0.5);

		/**
		 *  the amount of noise at the attack. 
		 *  nominal range of [0.1, 20]
		 *  @type {number}
		 */
		this.attackNoise = 1;

		/**
		 *  internal flag for keeping track of when frequency
		 *  correction has been used
		 *  @type {boolean}
		 *  @private
		 */
		this._highFrequencies = false;

		/**
		 *  the feedback node
		 *  @type {GainNode}
		 *  @private
		 */
		this._feedback = this.context.createGain();

		//make the filters
		for (var i = 0; i < this._filterDelayCount; i++) {
			var filterDelay = new FilterDelay(this.frequency, this.dampening);
			filterDelay.connect(this._feedback);
			this._filterDelays[i] = filterDelay;
		}

		//connections
		this._noise.connect(this._filterDelays[0]);
		this._feedback.connect(this._filterDelays[0]);
		this.chain.apply(this, this._filterDelays);
		//resonance control
		this.chain(this.resonance, this._resScale, this._feedback.gain);
		this._feedback.connect(this.output);
	};

	Tone.extend(Tone.PluckSynth, Tone.Instrument);


	/**
	 *  trigger the attack portion
	 */
	Tone.PluckSynth.prototype.triggerAttack = function(note, time) {
		if (typeof note === "string"){
			note = this.noteToFrequency(note);
		}
		time = this.toSeconds(time);
		var sampleRate = this.context.sampleRate;
		var delayAmount = 1 / note;
		var delaySamples = sampleRate * delayAmount;
		// frequency corection when frequencies get high
		time = this.toSeconds(time);
		var cutoff = 100;
		if (delaySamples < cutoff){
			this._highFrequencies = true;
			var changeNumber = Math.round((delaySamples / cutoff) * this._filterDelayCount);
			for (var i = 0; i < changeNumber; i++) {
				this._filterDelays[i].setDelay(1 / sampleRate, time);
			}
			delayAmount = Math.floor(delaySamples) / sampleRate;
		} else if (this._highFrequencies){
			this._highFrequencies = false;
			for (var j = 0; j < this._filterDelays.length; j++) {
				this._filterDelays[j].setDelay(0, time);
			}
		}
		this.frequency.setValueAtTime(delayAmount, time);
		this._noise.start(time);
		this._noise.stop(time + delayAmount * this.attackNoise);
	};

	/**
	 *  set the dampening 
	 */

	/**
	 *  clean up
	 */
	Tone.PluckSynth.prototype.dispose = function(){

	};

	// BEGIN HELPER CLASS //

	/**
	 *  FilterDelay
	 *  @internal
	 *  @constructor
	 *  @extends {Tone}
	 */
	var FilterDelay = function(delayTime, filterFreq){
		this.delay = this.input = this.context.createDelay();
		delayTime.connect(this.delay.delayTime);

		this.filter = this.output = this.context.createBiquadFilter();
		filterFreq.connect(this.filter.frequency);

		this.filter.type = "lowpass";
		this.filter.Q.value = 0;

		this.delay.connect(this.filter);
	};

	Tone.extend(FilterDelay);

	FilterDelay.prototype.setDelay = function(amount, time) {
		this.delay.delayTime.setValueAtTime(amount, time);
	};

	// END HELPER CLASS //

	return Tone.PluckSynth;
});