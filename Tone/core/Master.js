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
		 *  if the master is muted
		 *  @type {boolean}
		 *  @private
		 */
		this._muted = false;

		/**
		 * the volume of the output in decibels
		 * @type {Decibels}
		 * @signal
		 */
		this.volume = new Tone.Signal(this.output.gain, Tone.Type.Decibels);
		
		//connections
		this.input.chain(this.output, this.context.destination);
	};

	Tone.extend(Tone.Master);

	/**
	 *  @type {Object}
	 *  @const
	 */
	Tone.Master.defaults = {
		"volume" : 0,
		"mute" : false
	};

	/**
	 * Set `mute` to true to stop all output
	 * @memberOf Tone.Master#
	 * @type {boolean}
	 * @name mute
	 * @example
	 * //mute the output
	 * Tone.Master.mute = true;
	 */
	Object.defineProperty(Tone.Master.prototype, "mute", {
		get : function(){
			return this._muted;
		}, 
		set : function(mute){
			this._muted = mute;
			if (!this._muted && mute){
				this._unmutedVolume = this.volume.value;
				//maybe it should ramp here?
				this.volume.value = -Infinity;
			} else if (this._muted && !mute){
				this.volume.value = this._unmutedVolume;
			}
		}
	});

	/**
	 *  Add a master effects chain. This will disconnect any nodes which were previously 
	 *  chained. 
	 *  @param {AudioNode|Tone...} args All arguments will be connected in a row
	 *                                  and the Master will be routed through it
	 *  @return  {Tone.Master}  `this`
	 *  @example
	 * //some overall compression to keep the levels in check
	 * var masterCompressor = new Tone.Compressor({
	 * 	"threshold" : -6,
	 * 	"ratio" : 3,
	 * 	"attack" : 0.5,
	 * 	"release" : 0.1
	 * });
	 * //give a little boost to the lows
	 * var lowBump = new Tone.Filter(200, "lowshelf");
	 * //route everything through the filter 
	 * //and compressor before going to the speakers
	 * Tone.Master.chain(lowBump, masterCompressor);
	 */
	Tone.Master.prototype.chain = function(){
		this.input.disconnect();
		this.input.chain.apply(this.input, arguments);
		arguments[arguments.length - 1].connect(this.output);
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