import Tone from "../core/Tone";
import "../signal/WaveShaper";
import "../signal/SignalBase";

/**
 *  @class Return the absolute value of an incoming signal.
 *
 *  @constructor
 *  @extends {Tone.SignalBase}
 *  @example
 * var signal = new Tone.Signal(-1);
 * var abs = new Tone.Abs();
 * signal.connect(abs);
 * //the output of abs is 1.
 */
Tone.Abs = function(){
	Tone.SignalBase.call(this);
	/**
	 *  @type {Tone.LessThan}
	 *  @private
	 */
	this._abs = this.input = this.output = new Tone.WaveShaper(function(val){
		if (Math.abs(val) < 0.001){
			return 0;
		} else {
			return Math.abs(val);
		}
	}, 1024);
};

Tone.extend(Tone.Abs, Tone.SignalBase);

/**
 *  dispose method
 *  @returns {Tone.Abs} this
 */
Tone.Abs.prototype.dispose = function(){
	Tone.SignalBase.prototype.dispose.call(this);
	this._abs.dispose();
	this._abs = null;
	return this;
};

export default Tone.Abs;

