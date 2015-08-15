define(["Tone/core/Tone"], function (Tone) {

	/**
	 *  @class Wrapper around Web Audio's native [DelayNode](http://webaudio.github.io/web-audio-api/#the-delaynode-interface). 
	 *  @extends {Tone}
	 *  @param {Number=} delayTime The delay applied to the incoming signal.
	 *  @param {Number=} maxDelay The maximum delay time. 
	 */
	Tone.Delay = function(){

		var options = this.optionsObject(arguments, ["delayTime", "maxDelay"], Tone.Delay.defaults);

		/**
		 *  The native delay node
		 *  @type {DelayNode}
		 *  @private
		 */
		this._delayNode = this.input = this.output = this.context.createDelay(options.maxDelay);

		/**
		 *  The amount of time the incoming signal is
		 *  delayed. 
		 *  @type {Positive}
		 *  @signal
		 */
		this.delayTime = this._delayNode.delayTime;

		this._readOnly("delayTime");
		this.delayTime.value = options.delayTime;
	};

	Tone.extend(Tone.Delay);

	/**
	 *  The defaults
	 *  @const
	 *  @type  {Object}
	 */
	Tone.Delay.defaults = {
		"maxDelay" : 1,
		"delayTime" : 0
	};

	/**
	 *  Clean up.
	 *  @return  {Tone.Delay}  this
	 */
	Tone.Delay.prototype.dispose = function(){
		Tone.prototype.dispose.call(this);
		this._delayNode.disconnect();
		this._delayNode = null;
		this._writable("delayTime");
		this.delayTime = null;
		return this;
	};
	
	return Tone.Delay;
});