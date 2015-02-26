define(["Tone/core/Tone", "Tone/signal/Signal"], function(Tone){

	"use strict";
	
	/**
	 *  @class  A single master output which is connected to the
	 *          AudioDestinationNode. It provides useful conveniences
	 *          such as the ability to set the global volume and mute
	 *          the entire application. Additionally, it accepts
	 *          a master send/receive for adding final compression, 
	 *          limiting or effects to your application. <br><br>
	 *          Like the Transport, the Master output is created for you
	 *          on initialization. It does not need to be created.
	 *
	 *  @constructor
	 *  @extends {Tone}
	 */
	Tone.Master = function(){
		Tone.call(this);

		/**
		 * the unmuted volume
		 * @type {number}
		 * @private
		 */
		this._unmutedVolume = 1;

		/**
		 * the volume of the output in decibels
		 * @type {Tone.Signal}
		 */
		this.volume = new Tone.Signal(this.output.gain, Tone.Signal.Units.Decibels);
		
		//connections
		this.input.chain(this.output, this.context.destination);
	};

	Tone.extend(Tone.Master);

	/**
	 *  Mutethe output
	 *  @returns {Tone.Master} `this`
	 */
	Tone.Master.prototype.mute = function(){
		this._unmutedVolume = this.volume.value;
		//maybe it should ramp here?
		this.volume.value = -Infinity;
		return this;
	};

	/**
	 *  Unmute the output. Will return the volume to it's value before 
	 *  the output was muted. 
	 *  @returns {Tone.Master} `this`
	 */
	Tone.Master.prototype.mute = function(){
		this.volume.value = this._unmutedVolume;
		return this;
	};

	/**
	 *  route the master signal to the node's input. 
	 *  NOTE: this will disconnect the previously connected node
	 *  @param {AudioNode|Tone} node the node to use as the entry
	 *                               point to the master chain
	 *  @returns {Tone.Master} `this`
	 */
	Tone.Master.prototype.send = function(node){
		//disconnect the previous node
		this.input.disconnect();
		this.input.connect(node);
		return this;
	};

	/**
	 *  the master effects chain return point
	 *  @param {AudioNode|Tone} node the node to connect 
	 *  @returns {Tone.Master} `this`
	 */
	Tone.Master.prototype.receive = function(node){
		node.connect(this.output);
		return this;
	};

	///////////////////////////////////////////////////////////////////////////
	//	AUGMENT TONE's PROTOTYPE
	///////////////////////////////////////////////////////////////////////////

	/**
	 *  connect 'this' to the master output
	 *  defined in "Tone/core/Master"
	 *  @returns {Tone} `this`
	 */
	Tone.prototype.toMaster = function(){
		this.connect(Tone.Master);
		return this;
	};

	/**
	 *  Also augment AudioNode's prototype to include toMaster
	 *  as a convenience
	 *  @returns {AudioNode} `this`
	 */
	AudioNode.prototype.toMaster = function(){
		this.connect(Tone.Master);
		return this;
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