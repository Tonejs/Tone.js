define(["Tone/core/Tone", "Tone/component/LFO", "Tone/effect/StereoXFeedbackEffect"],
function(Tone){

	"use strict";

	/**
	 *  @class Tone.Chorus is a stereo chorus effect with feedback composed of 
	 *         a left and right delay with a Tone.LFO applied to the delayTime of each channel. 
	 *         Inspiration from [Tuna.js](https://github.com/Dinahmoe/tuna/blob/master/tuna.js).
	 *         Read more on the chorus effect on [SoundOnSound](http://www.soundonsound.com/sos/jun04/articles/synthsecrets.htm).
	 *
	 *	@constructor
	 *	@extends {Tone.StereoXFeedbackEffect}
	 *	@param {Frequency|Object} [frequency] The frequency of the LFO.
	 *	@param {Milliseconds} [delayTime] The delay of the chorus effect in ms. 
	 *	@param {NormalRange} [depth] The depth of the chorus.
	 *	@example
	 * var chorus = new Tone.Chorus(4, 2.5, 0.5);
	 * var synth = new Tone.PolySynth(4, Tone.MonoSynth).connect(chorus);
	 * synth.triggerAttackRelease(["C3","E3","G3"], "8n");
	 */
	Tone.Chorus = function(){

		var options = this.optionsObject(arguments, ["frequency", "delayTime", "depth"], Tone.Chorus.defaults);
		Tone.StereoXFeedbackEffect.call(this, options);

		/**
		 *  the depth of the chorus
		 *  @type {number}
		 *  @private
		 */
		this._depth = options.depth;

		/**
		 *  the delayTime
		 *  @type {number}
		 *  @private
		 */
		this._delayTime = options.delayTime / 1000;

		/**
		 *  the lfo which controls the delayTime
		 *  @type {Tone.LFO}
		 *  @private
		 */
		this._lfoL = new Tone.LFO({
			"frequency" : options.frequency,
			"min" : 0, 
			"max" : 1,
		});

		/**
		 *  another LFO for the right side with a 180 degree phase diff
		 *  @type {Tone.LFO}
		 *  @private
		 */
		this._lfoR = new Tone.LFO({
			"frequency" : options.frequency,
			"min" : 0, 
			"max" : 1,
			"phase" : 180
		});

		/**
		 *  delay for left
		 *  @type {DelayNode}
		 *  @private
		 */
		this._delayNodeL = this.context.createDelay();

		/**
		 *  delay for right
		 *  @type {DelayNode}
		 *  @private
		 */
		this._delayNodeR = this.context.createDelay();

		/**
		 * The frequency of the LFO which modulates the delayTime. 
		 * @type {Frequency}
		 * @signal
		 */
		this.frequency = this._lfoL.frequency;

		//connections
		this.effectSendL.chain(this._delayNodeL, this.effectReturnL);
		this.effectSendR.chain(this._delayNodeR, this.effectReturnR);
		//and pass through to make the detune apparent
		this.effectSendL.connect(this.effectReturnL);
		this.effectSendR.connect(this.effectReturnR);
		//lfo setup
		this._lfoL.connect(this._delayNodeL.delayTime);
		this._lfoR.connect(this._delayNodeR.delayTime);
		//start the lfo
		this._lfoL.start();
		this._lfoR.start();
		//have one LFO frequency control the other
		this._lfoL.frequency.connect(this._lfoR.frequency);
		//set the initial values
		this.depth = this._depth;
		this.frequency.value = options.frequency;
		this.type = options.type;
		this._readOnly(["frequency"]);
		this.spread = options.spread;
	};

	Tone.extend(Tone.Chorus, Tone.StereoXFeedbackEffect);

	/**
	 *  @static
	 *  @type {Object}
	 */
	Tone.Chorus.defaults = {
		"frequency" : 1.5,
		"delayTime" : 3.5,
		"depth" : 0.7,
		"feedback" : 0.1,
		"type" : "sine",
		"spread" : 180
	};

	/**
	 * The depth of the effect. A depth of 1 makes the delayTime
	 * modulate between 0 and 2*delayTime (centered around the delayTime). 
	 * @memberOf Tone.Chorus#
	 * @type {NormalRange}
	 * @name depth
	 */
	Object.defineProperty(Tone.Chorus.prototype, "depth", {
		get : function(){
			return this._depth;
		},
		set : function(depth){
			this._depth = depth;
			var deviation = this._delayTime * depth;
			this._lfoL.min = Math.max(this._delayTime - deviation, 0);
			this._lfoL.max = this._delayTime + deviation;
			this._lfoR.min = Math.max(this._delayTime - deviation, 0);
			this._lfoR.max = this._delayTime + deviation;
		}
	});

	/**
	 * The delayTime in milliseconds of the chorus. A larger delayTime
	 * will give a more pronounced effect. Nominal range a delayTime
	 * is between 2 and 20ms. 
	 * @memberOf Tone.Chorus#
	 * @type {Milliseconds}
	 * @name delayTime
	 */
	Object.defineProperty(Tone.Chorus.prototype, "delayTime", {
		get : function(){
			return this._delayTime * 1000;
		},
		set : function(delayTime){
			this._delayTime = delayTime / 1000;
			this.depth = this._depth;
		}
	});

	/**
	 * The oscillator type of the LFO. 
	 * @memberOf Tone.Chorus#
	 * @type {string}
	 * @name type
	 */
	Object.defineProperty(Tone.Chorus.prototype, "type", {
		get : function(){
			return this._lfoL.type;
		},
		set : function(type){
			this._lfoL.type = type;
			this._lfoR.type = type;
		}
	});

	/** 
	 * Amount of stereo spread. When set to 0, both LFO's will be panned centrally.
	 * When set to 180, LFO's will be panned hard left and right respectively.
	 * @memberOf Tone.Chorus#
	 * @type {Degrees}
	 * @name spread
	 */
	Object.defineProperty(Tone.Chorus.prototype, "spread", {
		get : function(){
			return this._lfoR.phase - this._lfoL.phase; //180
		},
		set : function(spread){
			this._lfoL.phase = 90 - (spread/2);
			this._lfoR.phase = (spread/2) + 90;
		}
	});

	/**
	 *  Clean up. 
	 *  @returns {Tone.Chorus} this
	 */
	Tone.Chorus.prototype.dispose = function(){
		Tone.StereoXFeedbackEffect.prototype.dispose.call(this);
		this._lfoL.dispose();
		this._lfoL = null;
		this._lfoR.dispose();
		this._lfoR = null;
		this._delayNodeL.disconnect();
		this._delayNodeL = null;
		this._delayNodeR.disconnect();
		this._delayNodeR = null;
		this._writable("frequency");
		this.frequency = null;
		return this;
	};

	return Tone.Chorus;
});