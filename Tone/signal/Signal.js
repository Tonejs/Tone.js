import Tone from "../core/Tone";
import "../type/Type";
import "../core/Param";
import "../signal/SignalBase";
import "../shim/ConstantSourceNode";

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
	Tone.Param.call(this, options);

	/**
	 * The constant source node which generates the signal
	 * @type {ConstantSourceNode}
	 * @private
	 */
	this._constantSource = this.context.createConstantSource();
	this._constantSource.start(0);
	this._param = this._constantSource.offset;
	this.value = options.value;

	/**
	 * The node where the constant signal value is scaled.
	 * @type {ConstantSourceNode}
	 * @private
	 */
	this.output = this._constantSource;

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

//use SignalBase's connect/disconnect methods
Tone.Signal.prototype.connect = Tone.SignalBase.prototype.connect;
Tone.Signal.prototype.disconnect = Tone.SignalBase.prototype.disconnect;

/**
 * Return the current signal value at the given time.
 * @param  {Time} time When to get the signal value
 * @return {Number}
 */
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
	this._constantSource.stop();
	this._constantSource.disconnect();
	this._constantSource = null;
	return this;
};

export default Tone.Signal;

