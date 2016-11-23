define(["Tone/core/Tone", "Tone/signal/TimelineSignal", 
	"Tone/signal/Pow", "Tone/type/Type"], function(Tone){

	"use strict";

	/**
	 *  @class  Tone.Envelope is an [ADSR](https://en.wikipedia.org/wiki/Synthesizer#ADSR_envelope)
	 *          envelope generator. Tone.Envelope outputs a signal which 
	 *          can be connected to an AudioParam or Tone.Signal. 
	 *          <img src="https://upload.wikimedia.org/wikipedia/commons/e/ea/ADSR_parameter.svg">
	 *
	 *  @constructor
	 *  @extends {Tone}
	 *  @param {Time} [attack] The amount of time it takes for the envelope to go from 
	 *                         0 to it's maximum value. 
	 *  @param {Time} [decay]	The period of time after the attack that it takes for the envelope
	 *                       	to fall to the sustain value. 
	 *  @param {NormalRange} [sustain]	The percent of the maximum value that the envelope rests at until
	 *                                	the release is triggered. 
	 *  @param {Time} [release]	The amount of time after the release is triggered it takes to reach 0. 
	 *  @example
	 * //an amplitude envelope
	 * var gainNode = Tone.context.createGain();
	 * var env = new Tone.Envelope({
	 * 	"attack" : 0.1,
	 * 	"decay" : 0.2,
	 * 	"sustain" : 1,
	 * 	"release" : 0.8,
	 * });
	 * env.connect(gainNode.gain);
	 */
	Tone.Envelope = function(){

		//get all of the defaults
		var options = this.optionsObject(arguments, ["attack", "decay", "sustain", "release"], Tone.Envelope.defaults);

		/** 
		 *  When triggerAttack is called, the attack time is the amount of
		 *  time it takes for the envelope to reach it's maximum value. 
		 *  @type {Time}
		 */
		this.attack = options.attack;

		/**
		 *  After the attack portion of the envelope, the value will fall
		 *  over the duration of the decay time to it's sustain value. 
		 *  @type {Time}
		 */
		this.decay = options.decay;
		
		/**
		 * 	The sustain value is the value 
		 * 	which the envelope rests at after triggerAttack is
		 * 	called, but before triggerRelease is invoked. 
		 *  @type {NormalRange}
		 */
		this.sustain = options.sustain;

		/**
		 *  After triggerRelease is called, the envelope's
		 *  value will fall to it's miminum value over the
		 *  duration of the release time. 
		 *  @type {Time}
		 */
		this.release = options.release;

		/**
		 *  the next time the envelope is at standby
		 *  @type {number}
		 *  @private
		 */
		this._attackCurve = "linear";

		/**
		 *  the next time the envelope is at standby
		 *  @type {number}
		 *  @private
		 */
		this._releaseCurve = "exponential";

		/**
		 *  the signal
		 *  @type {Tone.TimelineSignal}
		 *  @private
		 */
		this._sig = this.output = new Tone.TimelineSignal();
		this._sig.setValueAtTime(0, 0);

		//set the attackCurve initially
		this.attackCurve = options.attackCurve;
		this.releaseCurve = options.releaseCurve;
	};

	Tone.extend(Tone.Envelope);

	/**
	 *  the default parameters
	 *  @static
	 *  @const
	 */
	Tone.Envelope.defaults = {
		"attack" : 0.01,
		"decay" : 0.1,
		"sustain" : 0.5,
		"release" : 1,
		"attackCurve" : "linear",
		"releaseCurve" : "exponential",
	};

	/**
	 * Read the current value of the envelope. Useful for 
	 * syncronizing visual output to the envelope. 
	 * @memberOf Tone.Envelope#
	 * @type {Number}
	 * @name value
	 * @readOnly
	 */
	Object.defineProperty(Tone.Envelope.prototype, "value", {
		get : function(){
			return this.getValueAtTime(this.now());
		}
	});

	/**
	 * The shape of the attack. 
	 * Can be any of these strings:
	 * <ul>
	 *   <li>linear</li>
	 *   <li>exponential</li>
	 *   <li>sine</li>
	 *   <li>cosine</li>
	 *   <li>bounce</li>
	 *   <li>ripple</li>
	 *   <li>step</li>
	 * </ul>
	 * Can also be an array which describes the curve. Values
	 * in the array are evenly subdivided and linearly
	 * interpolated over the duration of the attack. 
	 * @memberOf Tone.Envelope#
	 * @type {String|Array}
	 * @name attackCurve
	 * @example
	 * env.attackCurve = "linear";
	 * @example
	 * //can also be an array
	 * env.attackCurve = [0, 0.2, 0.3, 0.4, 1]
	 */
	Object.defineProperty(Tone.Envelope.prototype, "attackCurve", {
		get : function(){
			if (this.isString(this._attackCurve)){
				return this._attackCurve;
			} else if (this.isArray(this._attackCurve)){
				//look up the name in the curves array
				for (var type in Tone.Envelope.Type){
					if (Tone.Envelope.Type[type].In === this._attackCurve){
						return type;
					}
				}
				//otherwise just return the array
				return this._attackCurve;
			}
		}, 
		set : function(curve){
			//check if it's a valid type
			if (Tone.Envelope.Type.hasOwnProperty(curve)){
				var curveDef = Tone.Envelope.Type[curve];
				if (this.isObject(curveDef)){
					this._attackCurve = curveDef.In;
				} else {
					this._attackCurve = curveDef;
				}
			} else if (this.isArray(curve)){
				this._attackCurve = curve;
			} else {
				throw new Error("Tone.Envelope: invalid curve: " + curve);
			}
		}
	});

	/**
	 * The shape of the release. See the attack curve types. 
	 * @memberOf Tone.Envelope#
	 * @type {String|Array}
	 * @name releaseCurve
	 * @example
	 * env.releaseCurve = "linear";
	 */
	Object.defineProperty(Tone.Envelope.prototype, "releaseCurve", {
		get : function(){
			if (this.isString(this._releaseCurve)){
				return this._releaseCurve;
			} else if (this.isArray(this._releaseCurve)){
				//look up the name in the curves array
				for (var type in Tone.Envelope.Type){
					if (Tone.Envelope.Type[type].Out === this._releaseCurve){
						return type;
					}
				}
				//otherwise just return the array
				return this._releaseCurve;
			}
		}, 
		set : function(curve){
			//check if it's a valid type
			if (Tone.Envelope.Type.hasOwnProperty(curve)){
				var curveDef = Tone.Envelope.Type[curve];
				if (this.isObject(curveDef)){
					this._releaseCurve = curveDef.Out;
				} else {
					this._releaseCurve = curveDef;
				}
			} else if (this.isArray(curve)){
				this._releaseCurve = curve;
			} else {
				throw new Error("Tone.Envelope: invalid curve: " + curve);
			}
		}
	});

	/**
	 *  Trigger the attack/decay portion of the ADSR envelope. 
	 *  @param  {Time} [time=now] When the attack should start.
	 *  @param {NormalRange} [velocity=1] The velocity of the envelope scales the vales.
	 *                               number between 0-1
	 *  @returns {Tone.Envelope} this
	 *  @example
	 *  //trigger the attack 0.5 seconds from now with a velocity of 0.2
	 *  env.triggerAttack("+0.5", 0.2);
	 */
	Tone.Envelope.prototype.triggerAttack = function(time, velocity){
		time = this.toSeconds(time);
		var originalAttack = this.toSeconds(this.attack);
		var attack = originalAttack;
		var decay = this.toSeconds(this.decay);
		velocity = this.defaultArg(velocity, 1);
		//check if it's not a complete attack
		var currentValue = this.getValueAtTime(time);
		if (currentValue > 0){
			//subtract the current value from the attack time
			var attackRate = 1 / attack;
			var remainingDistance = 1 - currentValue;
			//the attack is now the remaining time
			attack = remainingDistance / attackRate;
		}
		//attack
		if (this._attackCurve === "linear"){
			this._sig.linearRampToValue(velocity, attack, time);
		} else if (this._attackCurve === "exponential"){
			this._sig.exponentialRampToValue(velocity, attack, time);
		} else if (attack > 0){
			this._sig.setRampPoint(time);
			var curve = this._attackCurve;
			//take only a portion of the curve
			if (attack < originalAttack){
				var percentComplete = 1 - attack / originalAttack;
				var sliceIndex = Math.floor(percentComplete * this._attackCurve.length);
				curve = this._attackCurve.slice(sliceIndex);
				//the first index is the current value
				curve[0] = currentValue;
			}
			this._sig.setValueCurveAtTime(curve, time, attack, velocity);
		}
		//decay
		this._sig.exponentialRampToValue(velocity * this.sustain, decay, attack + time);
		return this;
	};
	
	/**
	 *  Triggers the release of the envelope.
	 *  @param  {Time} [time=now] When the release portion of the envelope should start. 
	 *  @returns {Tone.Envelope} this
	 *  @example
	 *  //trigger release immediately
	 *  env.triggerRelease();
	 */
	Tone.Envelope.prototype.triggerRelease = function(time){
		time = this.toSeconds(time);
		var currentValue = this.getValueAtTime(time);
		if (currentValue > 0){
			var release = this.toSeconds(this.release);
			if (this._releaseCurve === "linear"){
				this._sig.linearRampToValue(0, release, time);
			} else if (this._releaseCurve === "exponential"){
				this._sig.exponentialRampToValue(0, release, time);
			} else{
				var curve = this._releaseCurve;
				if (this.isArray(curve)){
					this._sig.setRampPoint(time);
					this._sig.setValueCurveAtTime(curve, time, release, currentValue);
				}
			}
		}
		return this;
	};

	/**
	 *  Get the scheduled value at the given time. This will
	 *  return the unconverted (raw) value.
	 *  @param  {Number}  time  The time in seconds.
	 *  @return  {Number}  The scheduled value at the given time.
	 */
	Tone.Envelope.prototype.getValueAtTime = function(time){
		return this._sig.getValueAtTime(time);
	};

	/**
	 *  triggerAttackRelease is shorthand for triggerAttack, then waiting
	 *  some duration, then triggerRelease. 
	 *  @param {Time} duration The duration of the sustain.
	 *  @param {Time} [time=now] When the attack should be triggered.
	 *  @param {number} [velocity=1] The velocity of the envelope. 
	 *  @returns {Tone.Envelope} this
	 *  @example
	 * //trigger the attack and then the release after 0.6 seconds.
	 * env.triggerAttackRelease(0.6);
	 */
	Tone.Envelope.prototype.triggerAttackRelease = function(duration, time, velocity) {
		time = this.toSeconds(time);
		this.triggerAttack(time, velocity);
		this.triggerRelease(time + this.toSeconds(duration));
		return this;
	};

	/**
	 *  Cancels all scheduled envelope changes after the given time.
	 *  @param  {Time} after
	 *  @returns {Tone.Envelope} this
	 */
	Tone.Envelope.prototype.cancel = function (after) {
		this._sig.cancelScheduledValues(after);
		return this;
	};

	/**
	 *  Borrows the connect method from Tone.Signal. 
	 *  @function
	 *  @private
	 */
	Tone.Envelope.prototype.connect = Tone.Signal.prototype.connect;

 	/**
 	 *  Generate some complex envelope curves. 
 	 */
	(function _createCurves(){

		var curveLen = 128;

		var i, k;

		//cosine curve
		var cosineCurve = [];
		for (i = 0; i < curveLen; i++){
			cosineCurve[i] = Math.sin((i / (curveLen - 1)) * (Math.PI / 2));
		}

		//ripple curve
		var rippleCurve = [];
		var rippleCurveFreq = 6.4;
		for (i = 0; i < curveLen - 1; i++){
			k = (i / (curveLen - 1));
			var sineWave = Math.sin(k * (Math.PI  * 2) * rippleCurveFreq - Math.PI / 2) + 1;
			rippleCurve[i] = sineWave/10 + k * 0.83;
		}
		rippleCurve[curveLen - 1] = 1;

		//stairs curve
		var stairsCurve = [];
		var steps = 5;
		for (i = 0; i < curveLen; i++){
			stairsCurve[i] = Math.ceil((i / (curveLen - 1)) * steps) / steps;
		}		

		//in-out easing curve
		var sineCurve = [];
		for (i = 0; i < curveLen; i++){
			k = i / (curveLen - 1);
			sineCurve[i] = 0.5 * (1 - Math.cos(Math.PI * k));
		}

		//a bounce curve
		var bounceCurve = [];
		for (i = 0; i < curveLen; i++){
			k = i / (curveLen - 1);
			var freq = Math.pow(k, 3) * 4 + 0.2;
			var val = Math.cos(freq * Math.PI * 2 * k);
			bounceCurve[i] = Math.abs(val * (1 - k));
		}

		/**
		 *  Invert a value curve to make it work for the release
		 *  @private
		 */
		function invertCurve(curve){
			var out = new Array(curve.length);
			for (var j = 0; j < curve.length; j++){
				out[j] = 1 - curve[j];
			}
			return out;
		}

		/**
		 *  reverse the curve
		 *  @private
		 */
		function reverseCurve(curve){
			return curve.slice(0).reverse();
		}

		/**
		 *  attack and release curve arrays
		 *  @type  {Object}
		 *  @private
		 */
	 	Tone.Envelope.Type = {
	 		"linear" : "linear",
	 		"exponential" : "exponential",
			"bounce" : {
				In : invertCurve(bounceCurve),
				Out : bounceCurve
			},
			"cosine" : {
				In : cosineCurve,
				Out : reverseCurve(cosineCurve)
			},
			"step" : {
				In : stairsCurve,
				Out : invertCurve(stairsCurve)
			},
			"ripple" : {
				In : rippleCurve,
				Out : invertCurve(rippleCurve)
			},
			"sine" : {
				In : sineCurve,
				Out : invertCurve(sineCurve)
			}
		};

	})();

	/**
	 *  Disconnect and dispose.
	 *  @returns {Tone.Envelope} this
	 */
	Tone.Envelope.prototype.dispose = function(){
		Tone.prototype.dispose.call(this);
		this._sig.dispose();
		this._sig = null;
		this._attackCurve = null;
		this._releaseCurve = null;
		return this;
	};


	return Tone.Envelope;
});
