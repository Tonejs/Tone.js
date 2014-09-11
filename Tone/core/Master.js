define(["Tone/core/Tone"], function(Tone){

	"use strict";
	
	/**
	 *  @class  A single master output. 
	 *          adds toMaster to Tone
	 *
	 *  @constructor
	 *  @extends {Tone}
	 */
	Tone.Master = function(){
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

	Tone.extend(Tone.Master);

	/**
	 *  mute the output
	 *  @param {boolean} muted
	 */
	Tone.Master.prototype.mute = function(muted){
		muted = this.defaultArg(muted, true);
		if (muted){
			this.output.gain.value = 0;
		} else {
			this.output.gain.value = 1;
		}
	};

	/**
	 *  @param {number} db volume in decibels 
	 *  @param {Tone.Time=} fadeTime (optional) time it takes to reach the value
	 */
	Tone.Master.prototype.setVolume = function(db, fadeTime){
		var now = this.now();
		var gain = this.dbToGain(db);
		if (fadeTime){
			var currentVolume = this.output.gain.value;
			this.output.gain.cancelScheduledValues(now);
			this.output.gain.setValueAtTime(currentVolume, now);
			this.output.gain.linearRampToValueAtTime(gain, now + this.toSeconds(fadeTime));
		} else {
			this.output.gain.setValueAtTime(gain, now);
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

	var MasterConstructor = Tone.Master;

	//a single master output
	Tone.Master = new Tone.Master();

	/**
	 *  initialize the module and listen for new audio contexts
	 */
	Tone._initAudioContext(function(){
		MasterConstructor.call(Tone.Master);
	});

	return Tone.Master;
});