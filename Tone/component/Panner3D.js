define(["Tone/core/Tone", "Tone/component/CrossFade", "Tone/component/Merge", "Tone/component/Split", 
	"Tone/signal/Signal", "Tone/signal/AudioToGain", "Tone/signal/Zero"], 
function(Tone){

	"use strict";

	/**
	 *  @class  A spatialized panner node which supports equalpower or HRTF panning.
	 *          Tries to normalize the API across various browsers. See Tone.Listener
	 *  
	 *  @constructor
	 *  @extends {Tone}
	 *  @param {Number} positionX The initial x position.
	 *  @param {Number} positionY The initial y position.
	 *  @param {Number} positionZ The initial z position.
	 */
	Tone.Panner3D = function(){

		var options = this.optionsObject(arguments, ["positionX", "positionY", "positionZ"], Tone.Panner3D.defaults);

		/**
		 *  The panner node
		 *  @type {PannerNode}
		 *  @private
		 */
		this._panner = this.input = this.output = this.context.createPanner();
		//set some values
		this._panner.panningModel = options.panningModel;
		this._panner.maxDistance = options.maxDistance;
		this._panner.distanceModel = options.distanceModel;
		this._panner.coneOuterGain = options.coneOuterGain;
		this._panner.coneOuterAngle = options.coneOuterAngle;
		this._panner.coneInnerAngle = options.coneInnerAngle;
		this._panner.refDistance = options.refDistance;
		this._panner.rolloffFactor = options.rolloffFactor;

		/**
		 *  Holds the current orientation
		 *  @type  {Array}
		 *  @private
		 */
		this._orientation = [options.orientationX, options.orientationY, options.orientationZ];

		/**
		 *  Holds the current position
		 *  @type  {Array}
		 *  @private
		 */
		this._position = [options.positionX, options.positionY, options.positionZ];

		// set the default position/orientation
		this.orientationX = options.orientationX;
		this.orientationY = options.orientationY;
		this.orientationZ = options.orientationZ;
		this.positionX = options.positionX;
		this.positionY = options.positionY;
		this.positionZ = options.positionZ;
	};

	Tone.extend(Tone.Panner3D);

	/**
	 *  the default parameters
	 *  @static
	 *  @const
	 *  @type {Object}
	 *  Defaults according to the specification
	 */
	Tone.Panner3D.defaults = {
		"positionX" : 0,
		"positionY" : 0,
		"positionZ" : 0,
		"orientationX" : 0,
		"orientationY" : 0,
		"orientationZ" : 0,
		"panningModel" : "equalpower",
		"maxDistance" : 10000,
		"distanceModel" : "inverse",
		"coneOuterGain" : 0,
		"coneOuterAngle" : 360,
		"coneInnerAngle" : 360,
		"refDistance" : 1,
		"rolloffFactor" : 1
	};

	Tone.Panner3D.prototype._rampTimeConstant = 0.3;

	/**
	 *  Sets the position of the source in 3d space.	
	 *  @param  {Number}  x
	 *  @param  {Number}  y
	 *  @param  {Number}  z
	 *  @return {Tone.Panner3D} this
	 */
	Tone.Panner3D.prototype.setPosition = function(x, y, z){
		if (this._panner.positionX){
			var now = this.now();
			this._panner.positionX.setTargetAtTime(x, now, this._rampTimeConstant);
			this._panner.positionY.setTargetAtTime(y, now, this._rampTimeConstant);
			this._panner.positionZ.setTargetAtTime(z, now, this._rampTimeConstant);
		} else {
			this._panner.setPosition(x, y, z);
		}
		this._position = Array.prototype.slice.call(arguments);
		return this;
	};

	/**
	 *  Sets the orientation of the source in 3d space.	
	 *  @param  {Number}  x
	 *  @param  {Number}  y
	 *  @param  {Number}  z
	 *  @return {Tone.Panner3D} this
	 */
	Tone.Panner3D.prototype.setOrientation = function(x, y, z){
		if (this._panner.orientationX){
			var now = this.now();
			this._panner.orientationX.setTargetAtTime(x, now, this._rampTimeConstant);
			this._panner.orientationY.setTargetAtTime(y, now, this._rampTimeConstant);
			this._panner.orientationZ.setTargetAtTime(z, now, this._rampTimeConstant);
		} else {
			this._panner.setOrientation(x, y, z);
		}
		this._orientation = Array.prototype.slice.call(arguments);
		return this;
	};

	/**
	 *  The x position of the panner object.
	 *  @type {Number}
	 *  @memberOf Tone.Panner3D#
	 *  @name positionX
	 */
	Object.defineProperty(Tone.Panner3D.prototype, "positionX", {
		set : function(pos){
			this._position[0] = pos;
			this.setPosition.apply(this, this._position);
		},
		get : function(){
			return this._position[0];
		}
	});

	/**
	 *  The y position of the panner object.
	 *  @type {Number}
	 *  @memberOf Tone.Panner3D#
	 *  @name positionY
	 */
	Object.defineProperty(Tone.Panner3D.prototype, "positionY", {
		set : function(pos){
			this._position[1] = pos;
			this.setPosition.apply(this, this._position);
		},
		get : function(){
			return this._position[1];
		}
	});

	/**
	 *  The z position of the panner object.
	 *  @type {Number}
	 *  @memberOf Tone.Panner3D#
	 *  @name positionZ
	 */
	Object.defineProperty(Tone.Panner3D.prototype, "positionZ", {
		set : function(pos){
			this._position[2] = pos;
			this.setPosition.apply(this, this._position);
		},
		get : function(){
			return this._position[2];
		}
	});

	/**
	 *  The x orientation of the panner object.
	 *  @type {Number}
	 *  @memberOf Tone.Panner3D#
	 *  @name orientationX
	 */
	Object.defineProperty(Tone.Panner3D.prototype, "orientationX", {
		set : function(pos){
			this._orientation[0] = pos;
			this.setOrientation.apply(this, this._orientation);
		},
		get : function(){
			return this._orientation[0];
		}
	});

	/**
	 *  The y orientation of the panner object.
	 *  @type {Number}
	 *  @memberOf Tone.Panner3D#
	 *  @name orientationY
	 */
	Object.defineProperty(Tone.Panner3D.prototype, "orientationY", {
		set : function(pos){
			this._orientation[1] = pos;
			this.setOrientation.apply(this, this._orientation);
		},
		get : function(){
			return this._orientation[1];
		}
	});

	/**
	 *  The z orientation of the panner object.
	 *  @type {Number}
	 *  @memberOf Tone.Panner3D#
	 *  @name orientationZ
	 */
	Object.defineProperty(Tone.Panner3D.prototype, "orientationZ", {
		set : function(pos){
			this._orientation[2] = pos;
			this.setOrientation.apply(this, this._orientation);
		},
		get : function(){
			return this._orientation[2];
		}
	});

	/**
	 *  Proxy a property on the panner to an exposed public propery
	 *  @param  {String}  prop
	 *  @private
	 */
	Tone.Panner3D._aliasProperty = function(prop){
		Object.defineProperty(Tone.Panner3D.prototype, prop, {
			set : function(val){
				this._panner[prop] = val;
			},
			get : function(){
				return this._panner[prop];
			}
		});
	};

	/**
	 *  The panning model. Either "equalpower" or "HRTF".
	 *  @type {String}
	 *  @memberOf Tone.Panner3D#
	 *  @name panningModel
	 */
	Tone.Panner3D._aliasProperty("panningModel");

	/**
	 *  A reference distance for reducing volume as source move further from the listener
	 *  @type {Number}
	 *  @memberOf Tone.Panner3D#
	 *  @name refDistance
	 */
	Tone.Panner3D._aliasProperty("refDistance");

	/**
	 *  Describes how quickly the volume is reduced as source moves away from listener.
	 *  @type {Number}
	 *  @memberOf Tone.Panner3D#
	 *  @name rolloffFactor
	 */
	Tone.Panner3D._aliasProperty("rolloffFactor");

	/**
	 *  The distance model used by,  "linear", "inverse", or "exponential".
	 *  @type {String}
	 *  @memberOf Tone.Panner3D#
	 *  @name distanceModel
	 */
	Tone.Panner3D._aliasProperty("distanceModel");

	/**
	 *  The angle, in degrees, inside of which there will be no volume reduction
	 *  @type {Degrees}
	 *  @memberOf Tone.Panner3D#
	 *  @name coneInnerAngle
	 */
	Tone.Panner3D._aliasProperty("coneInnerAngle");

	/**
	 *  The angle, in degrees, outside of which the volume will be reduced 
	 *  to a constant value of coneOuterGain
	 *  @type {Degrees}
	 *  @memberOf Tone.Panner3D#
	 *  @name coneOuterAngle
	 */
	Tone.Panner3D._aliasProperty("coneOuterAngle");

	/**
	 *  The gain outside of the coneOuterAngle
	 *  @type {Gain}
	 *  @memberOf Tone.Panner3D#
	 *  @name coneOuterGain
	 */
	Tone.Panner3D._aliasProperty("coneOuterGain");

	/**
	 *  The maximum distance between source and listener, 
	 *  after which the volume will not be reduced any further.
	 *  @type {Positive}
	 *  @memberOf Tone.Panner3D#
	 *  @name maxDistance
	 */
	Tone.Panner3D._aliasProperty("maxDistance");

	/**
	 *  Clean up.
	 *  @returns {Tone.Panner3D} this
	 */
	Tone.Panner3D.prototype.dispose = function(){
		this._panner.disconnect();
		this._panner = null;
		this._orientation = null;
		this._position = null;
		return this;
	};

	return Tone.Panner3D;
});