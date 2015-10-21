define(["Tone/core/Tone", "Tone/core/Param"], function (Tone) {

	/**
	 *  @class Wrapper around Web Audio's native [DelayNode](http://webaudio.github.io/web-audio-api/#the-delaynode-interface). 
	 *  @extends {Tone}
	 *  @param {Time=} value The delay applied to the incoming signal.
	 *  @param {Time=} maxDelay The maximum delay time. 
	 */
	Tone.Delay = function(){

		var options = this.optionsObject(arguments, ["value", "maxDelay"], Tone.Delay.defaults);

		/**
		 *  The native delay node
		 *  @type {DelayNode}
		 *  @private
		 */
		this._delayNode = this.context.createDelay(this.toSeconds(options.maxDelay));

		Tone.Param.call(this, {
			"param" : this._delayNode.delayTime,
			"units" : Tone.Type.Time,
			"value" : options.value
		});

		//set the input and output
		this.input = this.output = this._delayNode;

		/**
		 *  The amount of time the incoming signal is
		 *  delayed. 
		 *  @type {AudioParam}
		 *  @signal
		 */
		this.delayTime = this._param;
		this._readOnly("delayTime");
	};

	Tone.extend(Tone.Delay, Tone.Param);

	/**
	 *  The defaults
	 *  @const
	 *  @type  {Object}
	 */
	Tone.Delay.defaults = {
		"maxDelay" : 1,
		"value" : 0
	};
	
	/**
	 *  Clean up.
	 *  @return  {Tone.Delay}  this
	 */
	Tone.Delay.prototype.dispose = function(){
		Tone.Param.prototype.dispose.call(this);
		this._delayNode.disconnect();
		this._delayNode = null;
		this._writable("delayTime");
		this.delayTime = null;
		return this;
	};
	
	return Tone.Delay;
});