define(["Tone/core/Tone", "Tone/component/LFO", "Tone/effect/StereoXFeedbackEffect"], 
function(Tone){

	"use strict";

	/**
	 *  @class A Chorus effect with feedback. inspiration from https://github.com/Dinahmoe/tuna/blob/master/tuna.js
	 *
	 *	@constructor
	 *	@extends {Tone.StereoXFeedbackEffect}
	 *	@param {number|Object} [frequency=2] the frequency of the effect
	 *	@param {number} [delayTime=3.5] the delay of the chorus effect in ms
	 *	@param {number} [depth=0.7] the depth of the chorus
	 *	@example
	 * 	var chorus = new Tone.Chorus(4, 2.5, 0.5);
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
		this._lfoL = new Tone.LFO(options.rate, 0, 1);

		/**
		 *  another LFO for the right side with a 180 degree phase diff
		 *  @type {Tone.LFO}
		 *  @private
		 */
		this._lfoR = new Tone.LFO(options.rate, 0, 1);
		this._lfoR.phase = 180;

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
		 * The frequency the chorus will modulate at. 
		 * @type {Tone.Signal}
		 */
		this.frequency = this._lfoL.frequency;

		//connections
		this.connectSeries(this.effectSendL, this._delayNodeL, this.effectReturnL);
		this.connectSeries(this.effectSendR, this._delayNodeR, this.effectReturnR);
		//and pass through
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
		"type" : "sine"
	};

	/**
	 * The depth of the effect. 
	 * @memberOf Tone.Chorus#
	 * @type {number}
	 * @name depth
	 */
	Object.defineProperty(Tone.Chorus.prototype, "depth", {
		get : function(){
			return this._depth;
		},
		set : function(depth){
			this._depth = depth;
			var deviation = this._delayTime * depth;
			this._lfoL.min = this._delayTime - deviation;
			this._lfoL.max = this._delayTime + deviation;
			this._lfoR.min = this._delayTime - deviation;
			this._lfoR.max = this._delayTime + deviation;
		}
	});

	/**
	 * The delayTime in milliseconds
	 * @memberOf Tone.Chorus#
	 * @type {number}
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
	 * The lfo type for the chorus. 
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
	 *  clean up
	 *  @returns {Tone.Chorus} `this`
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
		this.frequency = null;
		return this;
	};

	return Tone.Chorus;
});