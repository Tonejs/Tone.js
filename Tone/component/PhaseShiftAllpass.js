import Tone from "../core/Tone";
import "../core/AudioNode";

/**
 *  @class Tone.PhaseShiftAllpass is an implementation of a Hilbert Transform using
 *         two Allpass filter banks whose outputs have a phase difference of 90°.
 *         Coefficients and structure was developed by Olli Niemitalo.
 *         For more details see: http://yehar.com/blog/?p=368
 *
 *  @extends {Tone.AudioNode}
 */
Tone.PhaseShiftAllpass = function(){

	Tone.AudioNode.call(this);

	this.createInsOuts(1, 2);

	for (var i = 0; i < 2; i++){
		this.output[i] = new Tone.Gain();
		this.output[i].channelCount = 1;
		this.output[i].channelCountMode = "explicit";
	}

	const allpassBank1Values = [0.6923878, 0.9360654322959, 0.9882295226860, 0.9987488452737];
	const allpassBank2Values = [0.4021921162426, 0.8561710882420, 0.9722909545651, 0.9952884791278];

	function createAllpassCoefficients(value){
		return [[value * value, 0, -1], [1, 0, -(value * value)]];
	}

	/**
	 *  The first Allpass filter of the first bank
	 *  @type  {IIRFilterNode}
	 *  @private
	 */
	let coefficients = createAllpassCoefficients(allpassBank1Values[0]);
	this._firstBankAP0 = Tone.context.createIIRFilter(coefficients[0], coefficients[1]);

	/**
	 *  The second Allpass filter of the first bank
	 *  @type  {IIRFilterNode}
	 *  @private
	 */
	coefficients = createAllpassCoefficients(allpassBank1Values[1]);
	this._firstBankAP1 = Tone.context.createIIRFilter(coefficients[0], coefficients[1]);

	/**
	 *  The third Allpass filter of the first bank
	 *  @type  {IIRFilterNode}
	 *  @private
	 */
	coefficients = createAllpassCoefficients(allpassBank1Values[2]);
	this._firstBankAP2 = Tone.context.createIIRFilter(coefficients[0], coefficients[1]);

	/**
	 *  The forth Allpass filter of the first bank
	 *  @type  {IIRFilterNode}
	 *	@private
	 */
	coefficients = createAllpassCoefficients(allpassBank1Values[3]);
	this._firstBankAP3 = Tone.context.createIIRFilter(coefficients[0], coefficients[1]);

	/**
	 *  A IIR filter implementing a delay by one sample used by the first bank
	 *  @type  {IIRFilterNode}
	 *  @private
	 */
	this._oneSampleDelay = Tone.context.createIIRFilter([0.0, 1.0], [1.0, 0.0]);

	/**
	 *  The first Allpass filter of the second bank
	 *  @type  {IIRFilterNode}
	 *  @private
	 */
	coefficients = createAllpassCoefficients(allpassBank2Values[0]);
	this._secondBankAP0 = Tone.context.createIIRFilter(coefficients[0], coefficients[1]);

	/**
	 *  The second Allpass filter of the second bank
	 *  @type  {IIRFilterNode}
	 *  @private
	 */
	coefficients = createAllpassCoefficients(allpassBank2Values[1]);
	this._secondBankAP1 = Tone.context.createIIRFilter(coefficients[0], coefficients[1]);

	/**
	 *  The third Allpass filter of the second bank
	 *  @type  {IIRFilterNode}
	 *  @private
	 */
	coefficients = createAllpassCoefficients(allpassBank2Values[2]);
	this._secondBankAP2 = Tone.context.createIIRFilter(coefficients[0], coefficients[1]);

	/**
	 *  The forth Allpass filter of the second bank
	 *  @type  {IIRFilterNode}
	 *  @private
	 */
	coefficients = createAllpassCoefficients(allpassBank2Values[3]);
	this._secondBankAP3 = Tone.context.createIIRFilter(coefficients[0], coefficients[1]);

	// connect Allpass filter banks
	Tone.connect(this.input, this._firstBankAP0);
	Tone.connect(this.input, this._secondBankAP0);

	Tone.connectSeries(this._firstBankAP0, this._firstBankAP1, this._firstBankAP2, this._firstBankAP3, this._oneSampleDelay, this.output[0]);

	Tone.connectSeries(this._secondBankAP0, this._secondBankAP1, this._secondBankAP2, this._secondBankAP3, this.output[1]);
};

Tone.extend(Tone.PhaseShiftAllpass, Tone.AudioNode);

/**
 *  Clean up.
 *  @return  {Tone.PhaseShiftAllpass}  this
 */
Tone.PhaseShiftAllpass.prototype.dispose = function(){
	this.output[0].dispose();
	this.output[0] = null;
	this.output[1].dispose();
	this.output[1] = null;
	Tone.AudioNode.prototype.dispose.call(this);
	this._firstBankAP0.disconnect();
	this._firstBankAP0 = null;
	this._firstBankAP1.disconnect();
	this._firstBankAP1 = null;
	this._firstBankAP2.disconnect();
	this._firstBankAP2 = null;
	this._firstBankAP3.disconnect();
	this._firstBankAP3 = null;
	this._secondBankAP0.disconnect();
	this._secondBankAP0 = null;
	this._secondBankAP1.disconnect();
	this._secondBankAP1 = null;
	this._secondBankAP2.disconnect();
	this._secondBankAP2 = null;
	this._secondBankAP3.disconnect();
	this._secondBankAP3 = null;
	this._oneSampleDelay.disconnect();
	this._oneSampleDelay = null;
	return this;
};

export default Tone.PhaseShiftAllpass;
