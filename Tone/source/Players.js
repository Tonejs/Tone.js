import Tone from "../core/Tone";
import "../source/Player";
import "../component/Volume";
import "../core/AudioNode";

/**
 *  @class  Tone.Players combines multiple [Tone.Player](Player) objects.
 *
 *  @constructor
 *  @extends {Tone.AudioNode}
 *  @param {Object} urls An object mapping a name to a url.
 *  @param {function=} onload The function to invoke when all buffers are loaded.
 */
Tone.Players = function(urls){

	var args = Array.prototype.slice.call(arguments);
	args.shift();
	var options = Tone.defaults(args, ["onload"], Tone.Players);
	Tone.AudioNode.call(this, options);

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
	 * source.volume.value = -6;
	 */
	this.volume = this._volume.volume;
	this._readOnly("volume");

	//make the output explicitly stereo
	this._volume.output.output.channelCount = 2;
	this._volume.output.output.channelCountMode = "explicit";
	//mute initially
	this.mute = options.mute;

	/**
	 * The container of all of the players
	 * @type {Object}
	 * @private
	 */
	this._players = {};

	/**
	 * The loading count
	 * @type {Number}
	 * @private
	 */
	this._loadingCount = 0;

	/**
	 * private holder of the fadeIn time
	 * @type {Time}
	 * @private
	 */
	this._fadeIn = options.fadeIn;

	/**
	 * private holder of the fadeOut time
	 * @type {Time}
	 * @private
	 */
	this._fadeOut = options.fadeOut;

	//add all of the players
	for (var name in urls){
		this._loadingCount++;
		this.add(name, urls[name], this._bufferLoaded.bind(this, options.onload));
	}
};

Tone.extend(Tone.Players, Tone.AudioNode);

/**
 * The default values
 * @type {Object}
 */
Tone.Players.defaults = {
	"volume" : 0,
	"mute" : false,
	"onload" : Tone.noOp,
	"fadeIn" : 0,
	"fadeOut" : 0
};

/**
 *  A buffer was loaded. decrement the counter.
 *  @param  {Function}  callback
 *  @private
 */
Tone.Players.prototype._bufferLoaded = function(callback){
	this._loadingCount--;
	if (this._loadingCount === 0 && callback){
		callback(this);
	}
};

/**
 * Mute the output.
 * @memberOf Tone.Source#
 * @type {boolean}
 * @name mute
 * @example
 * //mute the output
 * source.mute = true;
 */
Object.defineProperty(Tone.Players.prototype, "mute", {
	get : function(){
		return this._volume.mute;
	},
	set : function(mute){
		this._volume.mute = mute;
	}
});

/**
 * The fadeIn time of the amplitude envelope.
 * @memberOf Tone.Source#
 * @type {Time}
 * @name fadeIn
 */
Object.defineProperty(Tone.Players.prototype, "fadeIn", {
	get : function(){
		return this._fadeIn;
	},
	set : function(fadeIn){
		this._fadeIn = fadeIn;
		this._forEach(function(player){
			player.fadeIn = fadeIn;
		});
	}
});

/**
 * The fadeOut time of the amplitude envelope.
 * @memberOf Tone.Source#
 * @type {Time}
 * @name fadeOut
 */
Object.defineProperty(Tone.Players.prototype, "fadeOut", {
	get : function(){
		return this._fadeOut;
	},
	set : function(fadeOut){
		this._fadeOut = fadeOut;
		this._forEach(function(player){
			player.fadeOut = fadeOut;
		});
	}
});

/**
 * The state of the players object. Returns "started" if any of the players are playing.
 * @memberOf Tone.Players#
 * @type {String}
 * @name state
 * @readOnly
 */
Object.defineProperty(Tone.Players.prototype, "state", {
	get : function(){
		var playing = false;
		this._forEach(function(player){
			playing = playing || player.state === Tone.State.Started;
		});
		return playing ? Tone.State.Started : Tone.State.Stopped;
	}
});

/**
 *  True if the buffers object has a buffer by that name.
 *  @param  {String|Number}  name  The key or index of the
 *                                 buffer.
 *  @return  {Boolean}
 */
Tone.Players.prototype.has = function(name){
	return this._players.hasOwnProperty(name);
};

/**
 *  Get a player by name.
 *  @param  {String}  name  The players name as defined in
 *                          the constructor object or `add` method.
 *  @return  {Tone.Player}
 */
Tone.Players.prototype.get = function(name){
	if (this.has(name)){
		return this._players[name];
	} else {
		throw new Error("Tone.Players: no player named "+name);
	}
};

/**
 * Iterate over all of the players
 * @param  {Function} callback
 * @return {Tone.Players}            this
 * @private
 */
Tone.Players.prototype._forEach = function(callback){
	for (var playerName in this._players){
		callback(this._players[playerName], playerName);
	}
	return this;
};

/**
 * If all the buffers are loaded or not
 * @memberOf Tone.Players#
 * @type {Boolean}
 * @name loaded
 * @readOnly
 */
Object.defineProperty(Tone.Players.prototype, "loaded", {
	get : function(){
		var isLoaded = true;
		this._forEach(function(player){
			isLoaded = isLoaded && player.loaded;
		});
		return isLoaded;
	}
});

/**
 *  Add a player by name and url to the Players
 *  @param  {String}    name      A unique name to give the player
 *  @param  {String|Tone.Buffer|Audiobuffer}  url  Either the url of the bufer,
 *                                                 or a buffer which will be added
 *                                                 with the given name.
 *  @param  {Function=}  callback  The callback to invoke
 *                                 when the url is loaded.
 */
Tone.Players.prototype.add = function(name, url, callback){
	this._players[name] = new Tone.Player(url, callback).connect(this.output);
	this._players[name].fadeIn = this._fadeIn;
	this._players[name].fadeOut = this._fadeOut;
	return this;
};

/**
 * Stop all of the players at the given time
 * @param {Time} time The time to stop all of the players.
 * @return {Tone.Players} this
 */
Tone.Players.prototype.stopAll = function(time){
	this._forEach(function(player){
		player.stop(time);
	});
};

/**
 *  Dispose and disconnect.
 *  @return {Tone.Players} this
 */
Tone.Players.prototype.dispose = function(){
	Tone.AudioNode.prototype.dispose.call(this);
	this._volume.dispose();
	this._volume = null;
	this._writable("volume");
	this.volume = null;
	this.output = null;
	this._forEach(function(player){
		player.dispose();
	});
	this._players = null;
	return this;
};

export default Tone.Players;

