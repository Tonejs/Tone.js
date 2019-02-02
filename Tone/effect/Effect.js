import Tone from "../core/Tone";
import "../component/CrossFade";
import "../core/AudioNode";

/**
 * 	@class  Tone.Effect is the base class for effects. Connect the effect between
 * 	        the effectSend and effectReturn GainNodes, then control the amount of
 * 	        effect which goes to the output using the wet control.
 *
 *  @constructor
 *  @extends {Tone.AudioNode}
 *  @param {NormalRange|Object} [wet] The starting wet value.
 */
Tone.Effect = function(){

	var options = Tone.defaults(arguments, ["wet"], Tone.Effect);
	Tone.AudioNode.call(this);
	this.createInsOuts(1, 1);

	/**
	 *  the drywet knob to control the amount of effect
	 *  @type {Tone.CrossFade}
	 *  @private
	 */
	this._dryWet = new Tone.CrossFade(options.wet);

	/**
	 *  The wet control is how much of the effected
	 *  will pass through to the output. 1 = 100% effected
	 *  signal, 0 = 100% dry signal.
	 *  @type {NormalRange}
	 *  @signal
	 */
	this.wet = this._dryWet.fade;

	/**
	 *  connect the effectSend to the input of hte effect
	 *  @type {Tone.Gain}
	 *  @private
	 */
	this.effectSend = new Tone.Gain();

	/**
	 *  connect the output of the effect to the effectReturn
	 *  @type {Tone.Gain}
	 *  @private
	 */
	this.effectReturn = new Tone.Gain();

	//connections
	Tone.connect(this.input, this._dryWet.a);
	Tone.connect(this.input, this.effectSend);
	this.effectReturn.connect(this._dryWet.b);
	this._dryWet.connect(this.output);
	this._readOnly(["wet"]);
};

Tone.extend(Tone.Effect, Tone.AudioNode);

/**
 *  @static
 *  @type {Object}
 */
Tone.Effect.defaults = {
	"wet" : 1
};

/**
 *  chains the effect in between the effectSend and effectReturn
 *  @param  {Tone} effect
 *  @private
 *  @returns {Tone.Effect} this
 */
Tone.Effect.prototype.connectEffect = function(effect){
	this.effectSend.chain(effect, this.effectReturn);
	return this;
};

/**
 *  Clean up.
 *  @returns {Tone.Effect} this
 */
Tone.Effect.prototype.dispose = function(){
	Tone.AudioNode.prototype.dispose.call(this);
	this._dryWet.dispose();
	this._dryWet = null;
	this.effectSend.dispose();
	this.effectSend = null;
	this.effectReturn.dispose();
	this.effectReturn = null;
	this._writable(["wet"]);
	this.wet = null;
	return this;
};

export default Tone.Effect;

