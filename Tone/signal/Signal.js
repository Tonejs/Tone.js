define(["Tone/core/Tone", "Tone/signal/WaveShaper", "Tone/type/Type", "Tone/core/Param",
	"Tone/shim/ConstantSourceNode", "Tone/core/Gain"], function(Tone){

	"use strict";

	/**
	 *  @class  A signal is an audio-rate value. Tone.Signal is a core component of the library.
	 *          Unlike a number, Signals can be scheduled with sample-level accuracy. Tone.Signal
	 *          has all of the methods available to native Web Audio
	 *          [AudioParam](http://webaudio.github.io/web-audio-api/#the-audioparam-interface)
	 *          as well as additional conveniences. Read more about working with signals
	 *          [here](https://github.com/Tonejs/Tone.js/wiki/Signals).
	 *
	 *  @constructor
	 *  @extends {Tone.Param}
	 *  @param {Number|AudioParam} [value] Initial value of the signal. If an AudioParam
	 *                                     is passed in, that parameter will be wrapped
	 *                                     and controlled by the Signal.
	 *  @param {string} [units=Number] unit The units the signal is in.
	 *  @example
	 * var signal = new Tone.Signal(10);
	 */
	Tone.Signal = function(){

		var options = Tone.defaults(arguments, ["value", "units"], Tone.Signal);
		var constantSource = Tone.context.createConstantSource();
		constantSource.start(0);
		options.param = constantSource.offset;
		Tone.Param.call(this, options);

		/**
		 * The node where the constant signal value is scaled.
		 * @type {GainNode}
		 * @private
		 */
		this.output = constantSource;

		/**
		 * The node where the value is set.
		 * @type {Tone.Param}
		 * @private
		 */
		this.input = this._param = this.output.offset;
	};

	Tone.extend(Tone.Signal, Tone.Param);

	/**
	 *  The default values
	 *  @type  {Object}
	 *  @static
	 *  @const
	 */
	Tone.Signal.defaults = {
		"value" : 0,
		"units" : Tone.Type.Default,
		"convert" : true,
	};

	/**
	 *  When signals connect to other signals or AudioParams,
	 *  they take over the output value of that signal or AudioParam.
	 *  For all other nodes, the behavior is the same as a default <code>connect</code>.
	 *
	 *  @override
	 *  @param {AudioParam|AudioNode|Tone.Signal|Tone} node
	 *  @param {number} [outputNumber=0] The output number to connect from.
	 *  @param {number} [inputNumber=0] The input number to connect to.
	 *  @returns {Tone.SignalBase} this
	 *  @method
	 */
	Tone.Signal.prototype.connect = Tone.SignalBase.prototype.connect;

	Tone.Signal.prototype.getValueAtTime = function(time){
		if (this._param.getValueAtTime){
			return this._param.getValueAtTime(time);
		} else {
			return Tone.Param.prototype.getValueAtTime.call(this, time);
		}
	};

	/**
	 *  dispose and disconnect
	 *  @returns {Tone.Signal} this
	 */
	Tone.Signal.prototype.dispose = function(){
		Tone.Param.prototype.dispose.call(this);
		return this;
	};

	return Tone.Signal;
});
