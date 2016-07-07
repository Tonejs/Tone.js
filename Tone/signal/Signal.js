define(["Tone/core/Tone", "Tone/signal/WaveShaper", "Tone/type/Type", "Tone/core/Param", "Tone/core/Gain"], function(Tone){

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

		var options = this.optionsObject(arguments, ["value", "units"], Tone.Signal.defaults);

		/**
		 * The node where the constant signal value is scaled.
		 * @type {GainNode}
		 * @private
		 */
		this.output = this._gain = this.context.createGain();

		options.param = this._gain.gain;
		Tone.Param.call(this, options);

		/**
		 * The node where the value is set.
		 * @type {Tone.Param}
		 * @private
		 */
		this.input = this._param = this._gain.gain;

		//connect the const output to the node output
		Tone.Signal._constant.chain(this._gain);
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

	/**
	 *  dispose and disconnect
	 *  @returns {Tone.Signal} this
	 */
	Tone.Signal.prototype.dispose = function(){
		Tone.Param.prototype.dispose.call(this);
		this._param = null;
		this._gain.disconnect();
		this._gain = null;
		return this;
	};

	///////////////////////////////////////////////////////////////////////////
	//	STATIC
	///////////////////////////////////////////////////////////////////////////

	/**
	 *  Generates a constant output of 1.
	 *  @static
	 *  @private
	 *  @const
	 *  @type {AudioBufferSourceNode}
	 */
	Tone.Signal._constant = null;

	/**
	 *  initializer function
	 */
	Tone._initAudioContext(function(audioContext){
		var buffer = audioContext.createBuffer(1, 128, audioContext.sampleRate);
		var arr = buffer.getChannelData(0);
		for (var i = 0; i < arr.length; i++){
			arr[i] = 1;
		}
		Tone.Signal._constant = audioContext.createBufferSource();
		Tone.Signal._constant.channelCount = 1;
		Tone.Signal._constant.channelCountMode = "explicit";
		Tone.Signal._constant.buffer = buffer;
		Tone.Signal._constant.loop = true;
		Tone.Signal._constant.start(0);
		Tone.Signal._constant.noGC();
	});

	return Tone.Signal;
});