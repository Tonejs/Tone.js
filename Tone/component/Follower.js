define(["../core/Tone", "../signal/Abs", "../signal/Subtract", 
	"../signal/Signal", "../type/Type", "../core/Delay", "../core/AudioNode"], function(Tone){

	"use strict";

	/**
	 *  @class  Tone.Follower is a  crude envelope follower which will follow
	 *          the amplitude of an incoming signal. Read more about envelope followers (also known
	 *          as envelope detectors) on [Wikipedia](https://en.wikipedia.org/wiki/Envelope_detector).
	 *
	 *  @constructor
	 *  @extends {Tone.AudioNode}
	 *  @param {Time} [smoothing=0.05] The rate of change of the follower.
	 *  @example
	 * var follower = new Tone.Follower(0.3);
	 */
	Tone.Follower = function(){

		var options = Tone.defaults(arguments, ["smoothing"], Tone.Follower);
		Tone.AudioNode.call(this);
		this.createInsOuts(1, 1);

		/**
		 *  @type {Tone.Abs}
		 *  @private
		 */
		this._abs = new Tone.Abs();

		/**
		 *  the lowpass filter which smooths the input
		 *  @type {BiquadFilterNode}
		 *  @private
		 */
		this._filter = this.context.createBiquadFilter();
		this._filter.type = "lowpass";
		this._filter.frequency.value = 0;
		this._filter.Q.value = 0;

		/**
		 *  @type {Tone.Subtract}
		 *  @private
		 */
		this._sub = new Tone.Subtract();

		/**
		 *  delay node to compare change over time
		 *  @type {Tone.Delay}
		 *  @private
		 */
		this._delay = new Tone.Delay(this.blockTime);

		/**
		 *  the smoothing value
		 *  @private
		 *  @type {Number}
		 */
		this._smoothing = options.smoothing;

		this.input.connect(this._delay, this._sub);
		this.input.connect(this._sub, 0, 1);
		this._sub.chain(this._abs, this._filter, this.output);

		//set the smoothing initially
		this.smoothing = options.smoothing;
	};

	Tone.extend(Tone.Follower, Tone.AudioNode);

	/**
	 *  @static
	 *  @type {Object}
	 */
	Tone.Follower.defaults = {
		"smoothing" : 0.05,
	};

	/**
	 * The attack time.
	 * @memberOf Tone.Follower#
	 * @type {Time}
	 * @name smoothing
	 */
	Object.defineProperty(Tone.Follower.prototype, "smoothing", {
		get : function(){
			return this._smoothing;
		},
		set : function(smoothing){
			this._smoothing = smoothing;
			this._filter.frequency.value = Tone.Time(smoothing).toFrequency() * 0.5;
		}
	});

	/**
	 *  Borrows the connect method from Signal so that the output can be used
	 *  as a Tone.Signal control signal.
	 *  @function
	 */
	Tone.Follower.prototype.connect = Tone.SignalBase.prototype.connect;

	/**
	 *  dispose
	 *  @returns {Tone.Follower} this
	 */
	Tone.Follower.prototype.dispose = function(){
		Tone.AudioNode.prototype.dispose.call(this);
		this._filter.disconnect();
		this._filter = null;
		this._delay.dispose();
		this._delay = null;
		this._sub.disconnect();
		this._sub = null;
		this._abs.dispose();
		this._abs = null;
		return this;
	};

	return Tone.Follower;
});
