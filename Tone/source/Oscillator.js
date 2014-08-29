define(["Tone/core/Tone", "Tone/signal/Signal", "Tone/source/Source"], 
function(Tone){

	"use strict";

	/**
	 *  @class Oscilator with start, pause, stop and sync to Transport methods
	 *
	 *  @constructor
	 *  @extends {Tone.Source}
	 *  @param {number|string=} frequency starting frequency
	 *  @param {string=} type type of oscillator (sine|square|triangle|sawtooth)
	 */
	Tone.Oscillator = function(){
		
		Tone.Source.call(this);
		var options = this.optionsObject(arguments, ["frequency", "type"], Tone.Oscillator.defaults);

		/**
		 *  the main oscillator
		 *  @type {OscillatorNode}
		 */
		this.oscillator = this.context.createOscillator();
		
		/**
		 *  the frequency control signal
		 *  @type {Tone.Signal}
		 */
		this.frequency = new Tone.Signal(options.frequency);

		/**
		 *  the detune control signal
		 *  @type {Tone.Signal}
		 */
		this.detune = new Tone.Signal(options.detune);

		/**
		 *  callback which is invoked when the oscillator is stoped
		 *  @type {function()}
		 */
		this.onended = options.onended;

		//connections
		this.oscillator.connect(this.output);
		//setup
		this.oscillator.type = options.type;
	};

	Tone.extend(Tone.Oscillator, Tone.Source);

	/**
	 *  the default parameters
	 *
	 *  @static
	 *  @type {Object}
	 */
	Tone.Oscillator.defaults = {
		"type" : "sine",
		"frequency" : 440,
		"onended" : function(){},
		"detune" : 0
	};

	/**
	 *  start the oscillator
	 *  
	 *  @param  {Tone.Time} time 
	 */
	Tone.Oscillator.prototype.start = function(time){
		if (this.state === Tone.Source.State.STOPPED){
			this.state = Tone.Source.State.STARTED;
			//get previous values
			var type = this.oscillator.type;
			//new oscillator with previous values
			this.oscillator = this.context.createOscillator();
			this.oscillator.type = type;
			//connect the control signal to the oscillator frequency & detune
			this.oscillator.connect(this.output);
			this.frequency.connect(this.oscillator.frequency);
			this.detune.connect(this.oscillator.detune);
			//start the oscillator
			this.oscillator.start(this.toSeconds(time));
			this.oscillator.onended = this._onended.bind(this);
		}
	};

	/**
	 *  stop the oscillator
	 *  @param  {Tone.Time=} time (optional) timing parameter
	 */
	Tone.Oscillator.prototype.stop = function(time){
		if (this.state === Tone.Source.State.STARTED){
			if (!time){
				this.state = Tone.Source.State.STOPPED;
			}
			this.oscillator.stop(this.toSeconds(time));
		}
	};

	/**
	 *  exponentially ramp the frequency of the oscillator over the rampTime
	 *  
	 *  @param {Tone.Time}	val
	 *  @param {Tone.Time=} rampTime when the oscillator will arrive at the frequency
	 */
	Tone.Oscillator.prototype.setFrequency = function(val, rampTime){
		if (rampTime){
			this.frequency.exponentialRampToValueAtTime(this.toFrequency(val), this.toSeconds(rampTime));
		} else {
			this.frequency.setValue(this.toFrequency(val));
		}
	};

	/**
	 *  set the oscillator type
	 *  
	 *  @param {string} type (sine|square|triangle|sawtooth)
	 */
	Tone.Oscillator.prototype.setType = function(type){
		this.oscillator.type = type;
	};

	/**
	 *  set the parameters at once
	 *  @param {Object} params
	 */
	Tone.Filter.prototype.set = function(params){
		if (!this.isUndef(params.type)) this.setType(params.type);
		if (!this.isUndef(params.frequency)) this.frequency.setValue(params.frequency);
		if (!this.isUndef(params.onended)) this.onended = params.onended;
		if (!this.isUndef(params.detune)) this.detune.setValue(params.detune);
	};

	/**
	 *  internal on end call
	 *  @private
	 */
	Tone.Oscillator.prototype._onended = function(){
		this.state = Tone.Source.State.STOPPED;
		this.onended();
	};

	/**
	 *  dispose and disconnect
	 */
	Tone.Oscillator.prototype.dispose = function(){
		Tone.Source.prototype.dispose.call(this);
		this.stop();
		if (this.oscillator !== null){
			this.oscillator.disconnect();
			this.oscillator = null;
		}
		this.frequency.dispose();
		this.detune.dispose();
		this.detune = null;
		this.frequency = null;
	};

	return Tone.Oscillator;
});