define(["Tone/core/Tone"], function (Tone) {

	/**
	 *  @class A thin wrapper around the Native Web Audio GainNode.
	 *         The GainNode is a basic building block of the Web Audio
	 *         API and is useful for routing audio and adjusting gains. 
	 *  @extends {Tone}
	 *  @param  {Number=}  initial  The initial gain of the GainNode
	 */
	Tone.Gain = function(initial){

		/**
		 *  The GainNode
		 *  @type  {GainNode}
		 *  @private
		 */
		this._gainNode = this.input = this.output = this.context.createGain();

		/**
		 *  The gain of the gain node.
		 *  @type {Number}
		 *  @signal
		 */
		this.gain = this._gainNode.gain;

		//set the initial value
		initial = this.defaultArg(initial, 1);
		this._readOnly("gain");
		this.gain.value = initial;
	};

	Tone.extend(Tone.Gain);

	/**
	 *  The defaults
	 *  @const
	 *  @type  {Object}
	 */
	Tone.Gain.defaults = {
		"gain" : 1
	};

	/**
	 *  Clean up.
	 *  @return  {Tone.Gain}  this
	 */
	Tone.Gain.prototype.dispose = function(){
		Tone.prototype.dispose.call(this);
		this._gainNode.disconnect();
		this._gainNode = null;
		this._writable("gain");
		this.gain = null;
	};

	return Tone.Gain;
});