define(["Tone/core/Tone", "Tone/source/Source", "Tone/source/Oscillator", "Tone/signal/Signal", "Tone/signal/Threshold"],
function(Tone){

	"use strict";

	/**
	 *  
	 *  @static 
	 *  @private
	 *  @type {Float32Array}
	 */
	var pulseCurve = new Float32Array(256);
	for(var i=0; i < 128; i++) {
		pulseCurve[i] = -1;
		pulseCurve[i+128] = 1;
	}

	/**
	 *  @class Pulse Oscillator with control over width
	 *
	 *  @constructor
	 *  @extends {Tone.Oscillator}
	 *  @param {number=} frequency the frequency of the oscillator
	 *  @param {number} [width = 0.5] the width of the pulse
	 */
	Tone.PulseOscillator = function(){

		Tone.Source.call(this);
		var options = this.optionsObject(arguments, ["frequency", "width"], Tone.Oscillator.defaults);

		/**
		 *  the width of the pulse
		 *  @type {Tone.Signal}
		 */
		this.width = new Tone.Signal(options.width);

		/**
		 *  the sawtooth oscillator
		 *  @type {Tone.Oscillator}
		 *  @private
		 */
		this._sawtooth = new Tone.Oscillator({
			frequency : options.frequency,
			detune : options.detune,
			type : "sawtooth",
			phase : options.phase
		});

		/**
		 *  the oscillators frequency
		 *  @type {Tone.Signal}
		 */
		this.frequency = this._sawtooth.frequency;

		/**
		 *  the oscillators detune
		 *  @type {Tone.Signal}
		 */
		this.detune = this._sawtooth.detune;

		/**
		 *  callback which is invoked when the oscillator is stoped
		 *  @type {function()}
		 */
		this.onended = options.onended;

		/**
		 *  threshold the signal to turn it into a square
		 *  
		 *  @type {WaveShaperNode}
		 *  @private
		 */
		this._thresh = this.context.createWaveShaper();
		this._thresh.curve = pulseCurve;

		//connections
		this.chain(this._sawtooth, this._thresh, this.output);
		this.width.connect(this._thresh);
		this._sawtooth.onended = this._onended.bind(this);
	};

	Tone.extend(Tone.PulseOscillator, Tone.Oscillator);

	/**
	 *  the default parameters
	 *
	 *  @static
	 *  @const
	 *  @type {Object}
	 */
	Tone.PulseOscillator.defaults = {
		"frequency" : 440,
		"detune" : 0,
		"phase" : 0,
		"width" : 0.2,
		"onended" : function(){},
	};

	/**
	 *  set the width of the oscillators
	 *  @param {number} width
	 */
	Tone.PulseOscillator.prototype.setWidth = function(width){
		this.width.setValue(width);
	};

	/**
	 *  set the phase of the oscillator
	 *  @param {number} phase
	 */
	Tone.PulseOscillator.prototype.setPhase = function(phase){
		this._sawtooth.setPhase(phase);
	};

	/**
	 *  bulk setter
	 *  @param {Object} params 
	 */
	Tone.PulseOscillator.prototype.set = function(params){
		if (!this.isUndef(params.width)) this.setWidth(params.width);
		this._sawtooth.set({
			"phase" : params.phase,
			"frequency" : params.frequency,
			"detune" : params.detune,
			"onended" : params.onended
		});
		Tone.Source.prototype.set.call(this, params);		
	};

	/**
	 *  start the oscillator
	 *  
	 *  @param  {Tone.Time} time 
	 */
	Tone.PulseOscillator.prototype.start = function(time){
		if (this.state === Tone.Source.State.STOPPED){
			this.state = Tone.Source.State.STARTED;
			time = this.toSeconds(time);
			this._sawtooth.start(time);
			this.width.output.gain.setValueAtTime(1, time);
		}
	};

	/**
	 *  stop the oscillator
	 *  
	 *  @param  {Tone.Time} time 
	 */
	Tone.PulseOscillator.prototype.stop = function(time){
		if (this.state === Tone.Source.State.STARTED){
			this.state = Tone.Source.State.STOPPED;
			time = this.toSeconds(time);
			this._sawtooth.stop(time);
			//the width is still connected to the output. 
			//that needs to be stopped also
			this.width.output.gain.setValueAtTime(0, time);
		}
	};

	/**
	 *  internal onended callback
	 *  @private
	 */
	Tone.PulseOscillator.prototype._onended = function(){
		this.onended();
	};

	/**
	 *  clean up method
	 */
	Tone.PulseOscillator.prototype.dispose = function(){
		Tone.Source.prototype.dispose.call(this);
		this._sawtooth.dispose();
		this.width.dispose();
		this._thresh.disconnect();
		this._sawtooth = null;
		this.frequency = null;
		this.detune = null;
		this.width = null;
		this._thresh = null;
	};

	return Tone.PulseOscillator;
});