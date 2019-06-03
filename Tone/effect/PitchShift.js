import Tone from "../core/Tone";
import "../component/LFO";
import "../component/CrossFade";
import "../signal/Signal";
import "../effect/FeedbackEffect";
import "../core/Delay";

/**
 *  @class Tone.PitchShift does near-realtime pitch shifting to the incoming signal.
 *         The effect is achieved by speeding up or slowing down the delayTime
 *         of a DelayNode using a sawtooth wave.
 *         Algorithm found in [this pdf](http://dsp-book.narod.ru/soundproc.pdf).
 *         Additional reference by [Miller Pucket](http://msp.ucsd.edu/techniques/v0.11/book-html/node115.html).
 *
 *  @extends {Tone.FeedbackEffect}
 *  @param {Interval=} pitch The interval to transpose the incoming signal by.
 */
Tone.PitchShift = function(){

	var options = Tone.defaults(arguments, ["pitch"], Tone.PitchShift);
	Tone.FeedbackEffect.call(this, options);

	/**
	 *  The pitch signal
	 *  @type  {Tone.Signal}
	 *  @private
	 */
	this._frequency = new Tone.Signal(0);

	/**
	 *  Uses two DelayNodes to cover up the jump in
	 *  the sawtooth wave.
	 *  @type  {DelayNode}
	 *  @private
	 */
	this._delayA = new Tone.Delay(0, 1);

	/**
	 *  The first LFO.
	 *  @type  {Tone.LFO}
	 *  @private
	 */
	this._lfoA = new Tone.LFO({
		"min" : 0,
		"max" : 0.1,
		"type" : "sawtooth"
	}).connect(this._delayA.delayTime);

	/**
	 *  The second DelayNode
	 *  @type  {DelayNode}
	 *  @private
	 */
	this._delayB = new Tone.Delay(0, 1);

	/**
	 *  The first LFO.
	 *  @type  {Tone.LFO}
	 *  @private
	 */
	this._lfoB = new Tone.LFO({
		"min" : 0,
		"max" : 0.1,
		"type" : "sawtooth",
		"phase" : 180
	}).connect(this._delayB.delayTime);

	/**
	 *  Crossfade quickly between the two delay lines
	 *  to cover up the jump in the sawtooth wave
	 *  @type  {Tone.CrossFade}
	 *  @private
	 */
	this._crossFade = new Tone.CrossFade();

	/**
	 *  LFO which alternates between the two
	 *  delay lines to cover up the disparity in the
	 *  sawtooth wave.
	 *  @type  {Tone.LFO}
	 *  @private
	 */
	this._crossFadeLFO = new Tone.LFO({
		"min" : 0,
		"max" : 1,
		"type" : "triangle",
		"phase" : 90
	}).connect(this._crossFade.fade);

	/**
	 *  The delay node
	 *  @type {Tone.Delay}
	 *  @private
	 */
	this._feedbackDelay = new Tone.Delay(options.delayTime);

	/**
	 *  The amount of delay on the input signal
	 *  @type {Time}
	 *  @signal
	 */
	this.delayTime = this._feedbackDelay.delayTime;
	this._readOnly("delayTime");

	/**
	 *  Hold the current pitch
	 *  @type {Number}
	 *  @private
	 */
	this._pitch = options.pitch;

	/**
	 *  Hold the current windowSize
	 *  @type {Number}
	 *  @private
	 */
	this._windowSize = options.windowSize;

	//connect the two delay lines up
	this._delayA.connect(this._crossFade.a);
	this._delayB.connect(this._crossFade.b);
	//connect the frequency
	this._frequency.fan(this._lfoA.frequency, this._lfoB.frequency, this._crossFadeLFO.frequency);
	//route the input
	this.effectSend.fan(this._delayA, this._delayB);
	this._crossFade.chain(this._feedbackDelay, this.effectReturn);
	//start the LFOs at the same time
	var now = this.now();
	this._lfoA.start(now);
	this._lfoB.start(now);
	this._crossFadeLFO.start(now);
	//set the initial value
	this.windowSize = this._windowSize;
};

Tone.extend(Tone.PitchShift, Tone.FeedbackEffect);

/**
 *  default values
 *  @static
 *  @type {Object}
 *  @const
 */
Tone.PitchShift.defaults = {
	"pitch" : 0,
	"windowSize" : 0.1,
	"delayTime" : 0,
	"feedback" : 0
};

/**
 * Repitch the incoming signal by some interval (measured
 * in semi-tones).
 * @memberOf Tone.PitchShift#
 * @type {Interval}
 * @name pitch
 * @example
 * pitchShift.pitch = -12; //down one octave
 * pitchShift.pitch = 7; //up a fifth
 */
Object.defineProperty(Tone.PitchShift.prototype, "pitch", {
	get : function(){
		return this._pitch;
	},
	set : function(interval){
		this._pitch = interval;
		var factor = 0;
		if (interval < 0){
			this._lfoA.min = 0;
			this._lfoA.max = this._windowSize;
			this._lfoB.min = 0;
			this._lfoB.max = this._windowSize;
			factor = Tone.intervalToFrequencyRatio(interval - 1) + 1;
		} else {
			this._lfoA.min = this._windowSize;
			this._lfoA.max = 0;
			this._lfoB.min = this._windowSize;
			this._lfoB.max = 0;
			factor = Tone.intervalToFrequencyRatio(interval) - 1;
		}
		this._frequency.value = factor * (1.2 / this._windowSize);
	}
});

/**
 * The window size corresponds roughly to the sample length in a looping sampler.
 * Smaller values are desirable for a less noticeable delay time of the pitch shifted
 * signal, but larger values will result in smoother pitch shifting for larger intervals.
 * A nominal range of 0.03 to 0.1 is recommended.
 * @memberOf Tone.PitchShift#
 * @type {Time}
 * @name windowSize
 * @example
 * pitchShift.windowSize = 0.1;
 */
Object.defineProperty(Tone.PitchShift.prototype, "windowSize", {
	get : function(){
		return this._windowSize;
	},
	set : function(size){
		this._windowSize = this.toSeconds(size);
		this.pitch = this._pitch;
	}
});

/**
 *  Clean up.
 *  @return  {Tone.PitchShift}  this
 */
Tone.PitchShift.prototype.dispose = function(){
	Tone.FeedbackEffect.prototype.dispose.call(this);
	this._frequency.dispose();
	this._frequency = null;
	this._delayA.disconnect();
	this._delayA = null;
	this._delayB.disconnect();
	this._delayB = null;
	this._lfoA.dispose();
	this._lfoA = null;
	this._lfoB.dispose();
	this._lfoB = null;
	this._crossFade.dispose();
	this._crossFade = null;
	this._crossFadeLFO.dispose();
	this._crossFadeLFO = null;
	this._writable("delayTime");
	this._feedbackDelay.dispose();
	this._feedbackDelay = null;
	this.delayTime = null;
	return this;
};

export default Tone.PitchShift;

