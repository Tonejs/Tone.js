import Tone from "../core/Tone";
import "../component/Follower";
import "../signal/GreaterThan";
import "../core/AudioNode";

/**
 *  @class  Tone.Gate only passes a signal through when the incoming
 *          signal exceeds a specified threshold. To do this, Gate uses
 *          a Tone.Follower to follow the amplitude of the incoming signal.
 *          A common implementation of this class is a [Noise Gate](https://en.wikipedia.org/wiki/Noise_gate).
 *
 *  @constructor
 *  @extends {Tone.AudioNode}
 *  @param {Decibels|Object} [threshold] The threshold above which the gate will open.
 *  @param {Time=} smoothing The follower's smoothing time
 *  @example
 * var gate = new Tone.Gate(-30, 0.2, 0.3).toMaster();
 * var mic = new Tone.UserMedia().connect(gate);
 * //the gate will only pass through the incoming
 * //signal when it's louder than -30db
 */
Tone.Gate = function(){

	var options = Tone.defaults(arguments, ["threshold", "smoothing"], Tone.Gate);
	Tone.AudioNode.call(this);
	this.createInsOuts(1, 1);

	/**
	 *  @type {Tone.Follower}
	 *  @private
	 */
	this._follower = new Tone.Follower(options.smoothing);

	/**
	 *  @type {Tone.GreaterThan}
	 *  @private
	 */
	this._gt = new Tone.GreaterThan(Tone.dbToGain(options.threshold));

	//the connections
	Tone.connect(this.input, this.output);
	//the control signal
	Tone.connectSeries(this.input, this._follower, this._gt, this.output.gain);
};

Tone.extend(Tone.Gate, Tone.AudioNode);

/**
 *  @const
 *  @static
 *  @type {Object}
 */
Tone.Gate.defaults = {
	"smoothing" : 0.1,
	"threshold" : -40
};

/**
 * The threshold of the gate in decibels
 * @memberOf Tone.Gate#
 * @type {Decibels}
 * @name threshold
 */
Object.defineProperty(Tone.Gate.prototype, "threshold", {
	get : function(){
		return Tone.gainToDb(this._gt.value);
	},
	set : function(thresh){
		this._gt.value = Tone.dbToGain(thresh);
	}
});

/**
 * The attack/decay speed of the gate
 * @memberOf Tone.Gate#
 * @type {Time}
 * @name smoothing
 */
Object.defineProperty(Tone.Gate.prototype, "smoothing", {
	get : function(){
		return this._follower.smoothing;
	},
	set : function(smoothingTime){
		this._follower.smoothing = smoothingTime;
	}
});

/**
 *  Clean up.
 *  @returns {Tone.Gate} this
 */
Tone.Gate.prototype.dispose = function(){
	Tone.AudioNode.prototype.dispose.call(this);
	this._follower.dispose();
	this._gt.dispose();
	this._follower = null;
	this._gt = null;
	return this;
};

export default Tone.Gate;

