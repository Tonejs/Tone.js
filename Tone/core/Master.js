import Tone from "../core/Tone";
import "../component/Volume";
import "../core/Context";
import "../core/AudioNode";

/**
 *  @class  A single master output which is connected to the
 *          AudioDestinationNode (aka your speakers).
 *          It provides useful conveniences such as the ability
 *          to set the volume and mute the entire application.
 *          It also gives you the ability to apply master effects to your application.
 *          <br><br>
 *          Like Tone.Transport, A single Tone.Master is created
 *          on initialization and you do not need to explicitly construct one.
 *
 *  @constructor
 *  @extends {Tone}
 *  @singleton
 *  @example
 * //the audio will go from the oscillator to the speakers
 * oscillator.connect(Tone.Master);
 * //a convenience for connecting to the master output is also provided:
 * oscillator.toMaster();
 * //the above two examples are equivalent.
 */
Tone.Master = function(){

	Tone.AudioNode.call(this);
	Tone.getContext(function(){
		this.createInsOuts(1, 0);

		/**
		 *  The private volume node
		 *  @type  {Tone.Volume}
		 *  @private
		 */
		this._volume = this.output = new Tone.Volume();

		/**
		 * The volume of the master output.
		 * @type {Decibels}
		 * @signal
		 */
		this.volume = this._volume.volume;

		this._readOnly("volume");
		//connections
		Tone.connectSeries(this.input, this.output, this.context.destination);

		//master is a singleton so it adds itself to the context
		this.context.master = this;
	}.bind(this));
};

Tone.extend(Tone.Master, Tone.AudioNode);

/**
 *  @type {Object}
 *  @const
 */
Tone.Master.defaults = {
	"volume" : 0,
	"mute" : false
};

/**
 * Is an instanceof Tone.Master
 * @type {Boolean}
 */
Tone.Master.prototype.isMaster = true;

/**
 * Mute the output.
 * @memberOf Tone.Master#
 * @type {boolean}
 * @name mute
 * @example
 * //mute the output
 * Tone.Master.mute = true;
 */
Object.defineProperty(Tone.Master.prototype, "mute", {
	get : function(){
		return this._volume.mute;
	},
	set : function(mute){
		this._volume.mute = mute;
	}
});

/**
 *  Add a master effects chain. NOTE: this will disconnect any nodes which were previously
 *  chained in the master effects chain.
 *  @param {...(AudioNode|Tone)} nodes All arguments will be connected in a row
 *                                  and the Master will be routed through it.
 *  @return  {Tone.Master}  this
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
	var args = Array.from(arguments);
	args.unshift(this.input);
	args.push(this.output);
	Tone.connectSeries.apply(undefined, args);
};

/**
 *  Clean up
 *  @return  {Tone.Master}  this
 */
Tone.Master.prototype.dispose = function(){
	Tone.AudioNode.prototype.dispose.call(this);
	this._writable("volume");
	this._volume.dispose();
	this._volume = null;
	this.volume = null;
};

///////////////////////////////////////////////////////////////////////////
//	AUGMENT TONE's PROTOTYPE
///////////////////////////////////////////////////////////////////////////

/**
 *  Connect 'this' to the master output. Shorthand for this.connect(Tone.Master)
 *  @returns {Tone.AudioNode} this
 *  @example
 * //connect an oscillator to the master output
 * var osc = new Tone.Oscillator().toMaster();
 */
Tone.AudioNode.prototype.toMaster = function(){
	this.connect(this.context.master);
	return this;
};

/**
 *  initialize the module and listen for new audio contexts
 *  @private
 */
var MasterConstructor = Tone.Master;
Tone.Master = new MasterConstructor();

Tone.Context.on("init", function(context){
	// if it already exists, just restore it
	if (context.master && context.master.isMaster){
		Tone.Master = context.master;
	} else {
		Tone.Master = new MasterConstructor();
	}
});

Tone.Context.on("close", function(context){
	if (context.master && context.master.isMaster){
		context.master.dispose();
	}
});

export default Tone.Master;

