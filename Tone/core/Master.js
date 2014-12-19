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
		Tone.call(this);
		
		//connections
		this.input.chain(this.output, this.context.destination);
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
	 *  @param {Tone.Time=} fadeTime time it takes to reach the value
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

	/**
	 *  route the master signal to the node's input. 
	 *  NOTE: this will disconnect the previously connected node
	 *  @param {AudioNode|Tone} node the node to use as the entry
	 *                               point to the master chain
	 */
	Tone.Master.prototype.send = function(node){
		//disconnect the previous node
		this.input.disconnect();
		this.input.connect(node);
	};

	/**
	 *  the master effects chain return point
	 *  @param {AudioNode|Tone} node the node to connect 
	 */
	Tone.Master.prototype.receive = function(node){
		node.connect(this.output);
	};

	///////////////////////////////////////////////////////////////////////////
	//	AUGMENT TONE's PROTOTYPE
	///////////////////////////////////////////////////////////////////////////

	/**
	 *  connect 'this' to the master output
	 *  defined in "Tone/core/Master"
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

	/**
	 *  initialize the module and listen for new audio contexts
	 */
	Tone._initAudioContext(function(){
		//a single master output
		if (!Tone.prototype.isUndef(Tone.Master)){
			Tone.Master = new MasterConstructor();
		} else {
			MasterConstructor.prototype.dispose.call(Tone.Master);
			MasterConstructor.call(Tone.Master);
		}
	});

	return Tone.Master;
});