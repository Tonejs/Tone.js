define(["Tone/core/Tone"], function(Tone){

	"use strict";
	
	/**
	 *  Master Output
	 *  
	 *  a single master output
	 *  adds toMaster to Tone
	 *
	 *  @constructor
	 *  @extends {Tone}
	 */
	var Master = function(){
		//extend audio unit
		Tone.call(this);

		/**
		 *  put a hard limiter on the output so we don't blow any eardrums
		 *  
		 *  @type {DynamicsCompressorNode}
		 */
		this.limiter = this.context.createDynamicsCompressor();
		this.limiter.threshold.value = 0;
		this.limiter.ratio.value = 20;
		//connect it up
		this.chain(this.input, this.limiter, this.output, this.context.destination);
	};

	Tone.extend(Master);

	/**
	 *  mute the output
	 *  @param {boolean} muted
	 */
	Master.prototype.mute = function(muted){
		muted = this.defaultArg(muted, true);
		if (muted){
			this.output.gain.value = 0;
		} else {
			this.output.gain.value = 1;
		}
	};

	/**
	 *  @param {number} value 
	 *  @param {Tone.Time=} fadeTime (optional) time it takes to reach the value
	 */
	Master.prototype.setVolume = function(value, fadeTime){
		var now = this.now();
		if (fadeTime){
			var currentVolume = this.output.gain.value;
			this.output.gain.cancelScheduledValues(now);
			this.output.gain.setValueAtTime(currentVolume, now);
			this.output.gain.linearRampToValueAtTime(value, now + this.toSeconds(fadeTime));
		} else {
			this.output.gain.setValueAtTime(value, now);
		}
	};

	///////////////////////////////////////////////////////////////////////////
	//	AUGMENT TONE's PROTOTYPE
	///////////////////////////////////////////////////////////////////////////

	/**
	 *  connect 'this' to the master output
	 */
	Tone.prototype.toMaster = function(){
		this.connect(Tone.Master);
	};

	/**
	 *  Also augment AudioNode's prototype to include toMaster
	 *  as a convenience
	 */
	AudioNode.prototype.toMaster = function(){
		this.connect(Tone.Master);
	};

	/**
	 *  initialize the module and listen for new audio contexts
	 */
	Tone._initAudioContext(function(){
		//a single master output
		Tone.Master = new Master();
	});

	return Tone.Master;
});