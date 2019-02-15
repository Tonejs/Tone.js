import Tone from "../core/Tone";
import "../component/Volume";
import "../core/AudioNode";

/**
 *  @class  Tone.UserMedia uses MediaDevices.getUserMedia to open up
 *          and external microphone or audio input. Check
 *          [MediaDevices API Support](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia)
 *          to see which browsers are supported. Access to an external input
 *          is limited to secure (HTTPS) connections.
 *
 *  @constructor
 *  @extends {Tone.AudioNode}
 *  @param {Decibels=} volume The level of the input
 *  @example
 * //list the inputs and open the third one
 * var motu = new Tone.UserMedia();
 *
 * //opening the input asks the user to activate their mic
 * motu.open().then(function(){
 * 	//promise resolves when input is available
 * });
 */

Tone.UserMedia = function(){

	var options = Tone.defaults(arguments, ["volume"], Tone.UserMedia);
	Tone.AudioNode.call(this);

	/**
	 *  The MediaStreamNode
	 *  @type {MediaStreamAudioSourceNode}
	 *  @private
	 */
	this._mediaStream = null;

	/**
	 *  The media stream created by getUserMedia.
	 *  @type {LocalMediaStream}
	 *  @private
	 */
	this._stream = null;

	/**
	 *  The open device
	 *  @type  {MediaDeviceInfo}
	 *  @private
	 */
	this._device = null;

	/**
	 *  The output volume node
	 *  @type  {Tone.Volume}
	 *  @private
	 */
	this._volume = this.output = new Tone.Volume(options.volume);

	/**
	 * The volume of the output in decibels.
	 * @type {Decibels}
	 * @signal
	 * @example
	 * input.volume.value = -6;
	 */
	this.volume = this._volume.volume;
	this._readOnly("volume");

	this.mute = options.mute;
};

Tone.extend(Tone.UserMedia, Tone.AudioNode);

/**
 * the default parameters
 * @type {Object}
 */
Tone.UserMedia.defaults = {
	"volume" : 0,
	"mute" : false
};

/**
 *  Open the media stream. If a string is passed in, it is assumed
 *  to be the label or id of the stream, if a number is passed in,
 *  it is the input number of the stream.
 *  @param  {String|Number} [labelOrId="default"] The label or id of the audio input media device.
 *                                                With no argument, the default stream is opened.
 *  @return {Promise} The promise is resolved when the stream is open.
 */
Tone.UserMedia.prototype.open = function(labelOrId){
	//close the previous stream
	if (this.state === Tone.State.Started){
		this.close();
	}
	return Tone.UserMedia.enumerateDevices().then(function(devices){
		var device;
		if (Tone.isNumber(labelOrId)){
			device = devices[labelOrId];
		} else {
			device = devices.find(function(device){
				return device.label === labelOrId || device.deviceId === labelOrId;
			});
			//didn't find a matching device
			if (!device && devices.length > 0){
				device = devices[0];
			} else if (!device && Tone.isDefined(labelOrId)){
				throw new Error("Tone.UserMedia: no matching device: "+labelOrId);
			}
		}
		this._device = device;
		//do getUserMedia
		var constraints = {
			audio : {
				"echoCancellation" : false,
				"sampleRate" : this.context.sampleRate,
				"noiseSuppression" : false,
				"mozNoiseSuppression" : false,
			}
		};
		if (device){
			constraints.audio.deviceId = device.deviceId;				
		}
		return navigator.mediaDevices.getUserMedia(constraints).then(function(stream){
			//start a new source only if the previous one is closed
			if (!this._stream){
				this._stream = stream;
				//Wrap a MediaStreamSourceNode around the live input stream.
				this._mediaStream = this.context.createMediaStreamSource(stream);
				//Connect the MediaStreamSourceNode to a gate gain node
				Tone.connect(this._mediaStream, this.output);
			}
			return this;
		}.bind(this));
	}.bind(this));
};

/**
 *  Close the media stream
 *  @return {Tone.UserMedia} this
 */
Tone.UserMedia.prototype.close = function(){
	if (this._stream){
		this._stream.getAudioTracks().forEach(function(track){
			track.stop();
		});
		this._stream = null;
		//remove the old media stream
		this._mediaStream.disconnect();
		this._mediaStream = null;
	}
	this._device = null;
	return this;
};

/**
 *  Returns a promise which resolves with the list of audio input devices available.
 *  @return {Promise} The promise that is resolved with the devices
 *  @static
 *  @example
 * Tone.UserMedia.enumerateDevices().then(function(devices){
 * 	console.log(devices)
 * })
 */
Tone.UserMedia.enumerateDevices = function(){
	return navigator.mediaDevices.enumerateDevices().then(function(devices){
		return devices.filter(function(device){
			return device.kind === "audioinput";
		});
	});
};

/**
 *  Returns the playback state of the source, "started" when the microphone is open
 *  and "stopped" when the mic is closed.
 *  @type {Tone.State}
 *  @readOnly
 *  @memberOf Tone.UserMedia#
 *  @name state
 */
Object.defineProperty(Tone.UserMedia.prototype, "state", {
	get : function(){
		return this._stream && this._stream.active ? Tone.State.Started : Tone.State.Stopped;
	}
});

/**
 * 	Returns an identifier for the represented device that is
 * 	persisted across sessions. It is un-guessable by other applications and
 * 	unique to the origin of the calling application. It is reset when the
 * 	user clears cookies (for Private Browsing, a different identifier is
 * 	used that is not persisted across sessions). Returns undefined when the
 * 	device is not open.
 *  @type {String}
 *  @readOnly
 *  @memberOf Tone.UserMedia#
 *  @name deviceId
 */
Object.defineProperty(Tone.UserMedia.prototype, "deviceId", {
	get : function(){
		if (this._device){
			return this._device.deviceId;
		} else {
			return null;
		}
	}
});

/**
 * 	Returns a group identifier. Two devices have the
 * 	same group identifier if they belong to the same physical device.
 * 	Returns undefined when the device is not open.
 *  @type {String}
 *  @readOnly
 *  @memberOf Tone.UserMedia#
 *  @name groupId
 */
Object.defineProperty(Tone.UserMedia.prototype, "groupId", {
	get : function(){
		if (this._device){
			return this._device.groupId;
		} else {
			return null;
		}
	}
});

/**
 * 	Returns a label describing this device (for example "Built-in Microphone").
 * 	Returns undefined when the device is not open or label is not available
 * 	because of permissions.
 *  @type {String}
 *  @readOnly
 *  @memberOf Tone.UserMedia#
 *  @name groupId
 */
Object.defineProperty(Tone.UserMedia.prototype, "label", {
	get : function(){
		if (this._device){
			return this._device.label;
		} else {
			return null;
		}
	}
});

/**
 * Mute the output.
 * @memberOf Tone.UserMedia#
 * @type {boolean}
 * @name mute
 * @example
 * //mute the output
 * userMedia.mute = true;
 */
Object.defineProperty(Tone.UserMedia.prototype, "mute", {
	get : function(){
		return this._volume.mute;
	},
	set : function(mute){
		this._volume.mute = mute;
	}
});

/**
 * Clean up.
 * @return {Tone.UserMedia} this
 */
Tone.UserMedia.prototype.dispose = function(){
	Tone.AudioNode.prototype.dispose.call(this);
	this.close();
	this._writable("volume");
	this._volume.dispose();
	this._volume = null;
	this.volume = null;
	return this;
};

/**
 *  If getUserMedia is supported by the browser.
 *  @type  {Boolean}
 *  @memberOf Tone.UserMedia#
 *  @name supported
 *  @static
 *  @readOnly
 */
Object.defineProperty(Tone.UserMedia, "supported", {
	get : function(){
		return Tone.isDefined(navigator.mediaDevices) && Tone.isFunction(navigator.mediaDevices.getUserMedia);
	}
});

export default Tone.UserMedia;

