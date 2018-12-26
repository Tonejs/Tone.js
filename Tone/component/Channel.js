define(["../core/Tone", "../component/PanVol", "../component/Solo", "../core/AudioNode"], function(Tone){

	/**
	 *  @class Tone.Channel provides a channel strip interface with 
	 *  volume, pan, solo and mute controls. 
	 *
	 *  @extends {Tone.AudioNode}
	 *  @constructor
	 *  @param {Decibels} volume The output volume.
	 *  @param {AudioRange} pan the initial pan
	 *  @example
	 * //pan the incoming signal left and drop the volume
	 * var channel = new Tone.Channel(-0.25, -12);
	 */
	Tone.Channel = function(){

		var options = Tone.defaults(arguments, ["volume", "pan"], Tone.PanVol);
		Tone.AudioNode.call(this, options);

		/**
		 *  The soloing interface
		 *  @type {Tone.Solo}
		 *  @private
		 */
		this._solo = this.input = new Tone.Solo(options.solo);

		/**
		 *  The panning and volume node
		 *  @type {Tone.PanVol}
		 *  @private
		 */
		this._panVol = this.output = new Tone.PanVol({
			"pan" : options.pan, 
			"volume" : options.volume,
			"mute" : options.mute
		});

		/**
		 *  The L/R panning control.
		 *  @type {AudioRange}
		 *  @signal
		 */
		this.pan = this._panVol.pan;

		/**
		 *  The volume control in decibels.
		 *  @type {Decibels}
		 *  @signal
		 */
		this.volume = this._panVol.volume;

		this._solo.connect(this._panVol);
		this._readOnly(["pan", "volume"]);
	};

	Tone.extend(Tone.Channel, Tone.AudioNode);

	/**
	 *  The defaults
	 *  @type  {Object}
	 *  @const
	 *  @static
	 */
	Tone.Channel.defaults = {
		"pan" : 0,
		"volume" : 0,
		"mute" : false,
		"solo" : false
	};

	/**
	 * Solo/unsolo the channel. Soloing is only relative to other
	 * Tone.Channels and Tone.Solos. 
	 * @memberOf Tone.Channel#
	 * @name solo
	 * @type {Boolean}
	 */
	Object.defineProperty(Tone.Channel.prototype, "solo", {
		get : function(){
			return this._solo.solo;
		},
		set : function(solo){
			this._solo.solo = solo;
		}
	});

	/**
	 *  If the current instance is muted, i.e. another instance is soloed,
	 *  or the channel is muted
	 *  @memberOf Tone.Channel#
	 *  @type {Boolean}
	 *  @name muted
	 *  @readOnly
	 */
	Object.defineProperty(Tone.Channel.prototype, "muted", {
		get : function(){
			return this._solo.muted || this.mute;
		}
	});

	/**
	 * Mute/unmute the volume
	 * @memberOf Tone.Channel#
	 * @name mute
	 * @type {Boolean}
	 */
	Object.defineProperty(Tone.Channel.prototype, "mute", {
		get : function(){
			return this._panVol.mute;
		},
		set : function(mute){
			this._panVol.mute = mute;
		}
	});

	/**
	 *  clean up
	 *  @returns {Tone.Channel} this
	 */
	Tone.Channel.prototype.dispose = function(){
		Tone.AudioNode.prototype.dispose.call(this);
		this._writable(["pan", "volume"]);
		this._panVol.dispose();
		this._panVol = null;
		this.pan = null;
		this.volume = null;
		this._solo.dispose();
		this._solo = null;
		return this;
	};

	return Tone.Channel;
});
