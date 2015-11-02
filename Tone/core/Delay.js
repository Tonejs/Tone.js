define(["Tone/core/Tone", "Tone/core/Param"], function (Tone) {

	"use strict";

	/**
	 *  @class Wrapper around Web Audio's native [DelayNode](http://webaudio.github.io/web-audio-api/#the-delaynode-interface). 
	 *  @extends {Tone}
	 *  @param {Time=} delayTime The delay applied to the incoming signal.
	 *  @param {Time=} maxDelay The maximum delay time. 
	 */
	Tone.Delay = function(){

		var options = this.optionsObject(arguments, ["delayTime", "maxDelay"], Tone.Delay.defaults);

		/**
		 *  The native delay node
		 *  @type {DelayNode}
		 *  @private
		 */
		this._delayNode = this.input = this.output = this.context.createDelay(this.toSeconds(options.maxDelay));

		/**
		 *  The amount of time the incoming signal is
		 *  delayed. 
		 *  @type {Tone.Param}
		 *  @signal
		 */
		this.delayTime = new Tone.Param({
			"param" : this._delayNode.delayTime,
			"units" : Tone.Type.Time,
			"value" : options.delayTime
		});

		this._readOnly("delayTime");
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
		Tone.Param.prototype.dispose.call(this);
		this._delayNode.disconnect();
		this._delayNode = null;
		this._writable("delayTime");
		this.delayTime = null;
		return this;
	};
	
	return Tone.Delay;
});