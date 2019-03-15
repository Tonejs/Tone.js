import Tone from "../core/Tone";
import "../component/LowpassCombFilter";
import "../effect/StereoEffect";
import "../signal/Signal";
import "../component/Split";
import "../component/Merge";
import "../signal/ScaleExp";

/**
 *  an array of comb filter delay values from Freeverb implementation
 *  @static
 *  @private
 *  @type {Array}
 */
var combFilterTunings = [1557 / 44100, 1617 / 44100, 1491 / 44100, 1422 / 44100, 1277 / 44100, 1356 / 44100, 1188 / 44100, 1116 / 44100];

/**
 *  an array of allpass filter frequency values from Freeverb implementation
 *  @private
 *  @static
 *  @type {Array}
 */
var allpassFilterFrequencies = [225, 556, 441, 341];

/**
 *  @class Tone.Freeverb is a reverb based on [Freeverb](https://ccrma.stanford.edu/~jos/pasp/Freeverb.html).
 *         Read more on reverb on [Sound On Sound](https://web.archive.org/web/20160404083902/http://www.soundonsound.com:80/sos/feb01/articles/synthsecrets.asp).
 *
 *  @extends {Tone.Effect}
 *  @constructor
 *  @param {NormalRange|Object} [roomSize] Correlated to the decay time.
 *  @param {Frequency} [dampening] The cutoff frequency of a lowpass filter as part
 *                                 of the reverb.
 *  @example
 * var freeverb = new Tone.Freeverb().toMaster();
 * freeverb.dampening.value = 1000;
 * //routing synth through the reverb
 * var synth = new Tone.AMSynth().connect(freeverb);
 */
Tone.Freeverb = function(){

	var options = Tone.defaults(arguments, ["roomSize", "dampening"], Tone.Freeverb);
	Tone.StereoEffect.call(this, options);

	/**
	 *  The roomSize value between. A larger roomSize
	 *  will result in a longer decay.
	 *  @type {NormalRange}
	 *  @signal
	 */
	this.roomSize = new Tone.Signal(options.roomSize, Tone.Type.NormalRange);

	/**
	 *  The amount of dampening of the reverberant signal.
	 *  @type {Frequency}
	 *  @signal
	 */
	this.dampening = new Tone.Signal(options.dampening, Tone.Type.Frequency);

	/**
	 *  the comb filters
	 *  @type {Array}
	 *  @private
	 */
	this._combFilters = [];

	/**
	 *  the allpass filters on the left
	 *  @type {Array}
	 *  @private
	 */
	this._allpassFiltersL = [];

	/**
	 *  the allpass filters on the right
	 *  @type {Array}
	 *  @private
	 */
	this._allpassFiltersR = [];

	//make the allpass filters on the right
	for (var l = 0; l < allpassFilterFrequencies.length; l++){
		var allpassL = this.context.createBiquadFilter();
		allpassL.type = "allpass";
		allpassL.frequency.value = allpassFilterFrequencies[l];
		this._allpassFiltersL.push(allpassL);
	}

	//make the allpass filters on the left
	for (var r = 0; r < allpassFilterFrequencies.length; r++){
		var allpassR = this.context.createBiquadFilter();
		allpassR.type = "allpass";
		allpassR.frequency.value = allpassFilterFrequencies[r];
		this._allpassFiltersR.push(allpassR);
	}

	//make the comb filters
	for (var c = 0; c < combFilterTunings.length; c++){
		var lfpf = new Tone.LowpassCombFilter(combFilterTunings[c]);
		if (c < combFilterTunings.length / 2){
			this.effectSendL.chain(lfpf, this._allpassFiltersL[0]);
		} else {
			this.effectSendR.chain(lfpf, this._allpassFiltersR[0]);
		}
		this.roomSize.connect(lfpf.resonance);
		this.dampening.connect(lfpf.dampening);
		this._combFilters.push(lfpf);
	}

	//chain the allpass filters togetehr
	Tone.connectSeries.apply(Tone, this._allpassFiltersL);
	Tone.connectSeries.apply(Tone, this._allpassFiltersR);
	Tone.connect(this._allpassFiltersL[this._allpassFiltersL.length - 1], this.effectReturnL);
	Tone.connect(this._allpassFiltersR[this._allpassFiltersR.length - 1], this.effectReturnR);
	this._readOnly(["roomSize", "dampening"]);
};

Tone.extend(Tone.Freeverb, Tone.StereoEffect);

/**
 *  @static
 *  @type {Object}
 */
Tone.Freeverb.defaults = {
	"roomSize" : 0.7,
	"dampening" : 3000
};

/**
 *  Clean up.
 *  @returns {Tone.Freeverb} this
 */
Tone.Freeverb.prototype.dispose = function(){
	Tone.StereoEffect.prototype.dispose.call(this);
	for (var al = 0; al < this._allpassFiltersL.length; al++){
		this._allpassFiltersL[al].disconnect();
		this._allpassFiltersL[al] = null;
	}
	this._allpassFiltersL = null;
	for (var ar = 0; ar < this._allpassFiltersR.length; ar++){
		this._allpassFiltersR[ar].disconnect();
		this._allpassFiltersR[ar] = null;
	}
	this._allpassFiltersR = null;
	for (var cf = 0; cf < this._combFilters.length; cf++){
		this._combFilters[cf].dispose();
		this._combFilters[cf] = null;
	}
	this._combFilters = null;
	this._writable(["roomSize", "dampening"]);
	this.roomSize.dispose();
	this.roomSize = null;
	this.dampening.dispose();
	this.dampening = null;
	return this;
};

export default Tone.Freeverb;

