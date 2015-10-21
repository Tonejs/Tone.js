define(["Tone/core/Tone", "Tone/core/Param", "Tone/core/Type"], function (Tone) {

	"use strict";

	/**
	 *  @class A thin wrapper around the Native Web Audio GainNode.
	 *         The GainNode is a basic building block of the Web Audio
	 *         API and is useful for routing audio and adjusting gains. 
	 *  @extends {Tone}
	 *  @param  {Number=}  value  The initial gain of the GainNode
	 *  @param {Tone.Type=} units The units of the gain parameter. 
	 */
	Tone.Gain = function(){

		var options = this.optionsObject(arguments, ["value", "units"], Tone.Gain.defaults);

		/**
		 *  The GainNode
		 *  @type  {GainNode}
		 *  @private
		 */
		this._gainNode = this.context.createGain();

		options.param = this._gainNode.gain;
		Tone.Param.call(this, options);
		this.input = this.output = this._gainNode;

		/**
		 *  The gain parameter of the gain node.
		 *  @type {AudioParam}
		 *  @signal
		 */
		this.gain = this._param;
		this._readOnly("gain");
	};

	Tone.extend(Tone.Gain, Tone.Param);

	/**
	 *  The defaults
	 *  @const
	 *  @type  {Object}
	 */
	Tone.Gain.defaults = {
		"value" : 1,
		"units" : Tone.Type.Gain,
		"convert" : true
	};

	/**
	 *  Clean up.
	 *  @return  {Tone.Gain}  this
	 */
	Tone.Gain.prototype.dispose = function(){
		Tone.Param.prototype.dispose.call(this);
		this._gainNode.disconnect();
		this._gainNode = null;
		this._writable("gain");
		this.gain = null;
	};

	return Tone.Gain;
});