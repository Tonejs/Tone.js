define(["Tone/core/Tone", "Tone/component/CrossFade", "Tone/component/Merge", "Tone/component/Split", 
	"Tone/signal/Signal", "Tone/signal/AudioToGain", "Tone/signal/Zero"], 
function(Tone){

	"use strict";

	/**
	 *  @class  Both Tone.Panner3D and Tone.Listener have a position in 3D space 
	 *          using a right-handed cartesian coordinate system. 
	 *          The units used in the coordinate system are not defined; 
	 *          these coordinates are independent/invariant of any particular 
	 *          units such as meters or feet. Tone.Panner3D objects have an forward 
	 *          vector representing the direction the sound is projecting. Additionally, 
	 *          they have a sound cone representing how directional the sound is. 
	 *          For example, the sound could be omnidirectional, in which case it would 
	 *          be heard anywhere regardless of its forward, or it can be more directional 
	 *          and heard only if it is facing the listener. Tone.Listener objects 
	 *          (representing a person's ears) have an forward and up vector 
	 *          representing in which direction the person is facing. Because both the 
	 *          source stream and the listener can be moving, they both have a velocity 
	 *          vector representing both the speed and direction of movement. Taken together, 
	 *          these two velocities can be used to generate a doppler shift effect which changes the pitch.
	 *          <br><br>
	 *          Note: the position of the Listener will have no effect on nodes not connected to a Tone.Panner3D
	 *  
	 *  @constructor
	 *  @extends {Tone}
	 *  @singleton
	 *  @param {Number} positionX The initial x position.
	 *  @param {Number} positionY The initial y position.
	 *  @param {Number} positionZ The initial z position.
	 */
	Tone.Listener = function(){

		var options = this.optionsObject(arguments, ["positionX", "positionY", "positionZ"], ListenerConstructor.defaults);

		/**
		 *  The listener node
		 *  @type {AudioListener}
		 *  @private
		 */
		this._listener = this.context.listener;

		/**
		 *  Holds the current forward orientation
		 *  @type  {Array}
		 *  @private
		 */
		this._orientation = [options.forwardX, options.forwardY, options.forwardZ, options.upX, options.upY, options.upZ];

		/**
		 *  Holds the current position
		 *  @type  {Array}
		 *  @private
		 */
		this._position = [options.positionX, options.positionY, options.positionZ];

		// set the default position/forward
		this.forwardX = options.forwardX;
		this.forwardY = options.forwardY;
		this.forwardZ = options.forwardZ;
		this.upX = options.upX;
		this.upY = options.upY;
		this.upZ = options.upZ;
		this.positionX = options.positionX;
		this.positionY = options.positionY;
		this.positionZ = options.positionZ;
	};

	Tone.extend(Tone.Listener);

	/**
	 *  the default parameters
	 *  @static
	 *  @const
	 *  @type {Object}
	 *  Defaults according to the specification
	 */
	Tone.Listener.defaults = {
		"positionX" : 0,
		"positionY" : 0,
		"positionZ" : 0,
		"forwardX" : 0,
		"forwardY" : 0,
		"forwardZ" : 1,
		"upX" : 0,
		"upY" : 1,
		"upZ" : 0
	};

	Tone.Listener.prototype._rampTimeConstant = 0.3;

	/**
	 *  Sets the position of the listener in 3d space.	
	 *  @param  {Number}  x
	 *  @param  {Number}  y
	 *  @param  {Number}  z
	 *  @return {Tone.Listener} this
	 */
	Tone.Listener.prototype.setPosition = function(x, y, z){
		if (this._listener.positionX){
			var now = this.now();
			this._listener.positionX.setTargetAtTime(x, now, this._rampTimeConstant);
			this._listener.positionY.setTargetAtTime(y, now, this._rampTimeConstant);
			this._listener.positionZ.setTargetAtTime(z, now, this._rampTimeConstant);
		} else {
			this._listener.setPosition(x, y, z);
		}
		this._position = Array.prototype.slice.call(arguments);
		return this;
	};

	/**
	 *  Sets the orientation of the listener using two vectors, the forward
	 *  vector (which direction the listener is facing) and the up vector 
	 *  (which the up direction of the listener). An up vector
	 *  of 0, 0, 1 is equivalent to the listener standing up in the Z direction. 
	 *  @param  {Number}  x
	 *  @param  {Number}  y
	 *  @param  {Number}  z
	 *  @param  {Number}  upX
	 *  @param  {Number}  upY
	 *  @param  {Number}  upZ
	 *  @return {Tone.Listener} this
	 */
	Tone.Listener.prototype.setOrientation = function(x, y, z, upX, upY, upZ){
		if (this._listener.forwardX){
			var now = this.now();
			this._listener.forwardX.setTargetAtTime(x, now, this._rampTimeConstant);
			this._listener.forwardY.setTargetAtTime(y, now, this._rampTimeConstant);
			this._listener.forwardZ.setTargetAtTime(z, now, this._rampTimeConstant);
			this._listener.upX.setTargetAtTime(upX, now, this._rampTimeConstant);
			this._listener.upY.setTargetAtTime(upY, now, this._rampTimeConstant);
			this._listener.upZ.setTargetAtTime(upZ, now, this._rampTimeConstant);
		} else {
			this._listener.setOrientation(x, y, z, upX, upY, upZ);
		}
		this._orientation = Array.prototype.slice.call(arguments);
		return this;
	};

	/**
	 *  The x position of the panner object.
	 *  @type {Number}
	 *  @memberOf Tone.Listener#
	 *  @name positionX
	 */
	Object.defineProperty(Tone.Listener.prototype, "positionX", {
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
	 *  @memberOf Tone.Listener#
	 *  @name positionY
	 */
	Object.defineProperty(Tone.Listener.prototype, "positionY", {
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
	 *  @memberOf Tone.Listener#
	 *  @name positionZ
	 */
	Object.defineProperty(Tone.Listener.prototype, "positionZ", {
		set : function(pos){
			this._position[2] = pos;
			this.setPosition.apply(this, this._position);
		},
		get : function(){
			return this._position[2];
		}
	});

	/**
	 *  The x coordinate of the listeners front direction. i.e. 
	 *  which way they are facing.
	 *  @type {Number}
	 *  @memberOf Tone.Listener#
	 *  @name forwardX
	 */
	Object.defineProperty(Tone.Listener.prototype, "forwardX", {
		set : function(pos){
			this._orientation[0] = pos;
			this.setOrientation.apply(this, this._orientation);
		},
		get : function(){
			return this._orientation[0];
		}
	});

	/**
	 *  The y coordinate of the listeners front direction. i.e. 
	 *  which way they are facing.
	 *  @type {Number}
	 *  @memberOf Tone.Listener#
	 *  @name forwardY
	 */
	Object.defineProperty(Tone.Listener.prototype, "forwardY", {
		set : function(pos){
			this._orientation[1] = pos;
			this.setOrientation.apply(this, this._orientation);
		},
		get : function(){
			return this._orientation[1];
		}
	});

	/**
	 *  The z coordinate of the listeners front direction. i.e. 
	 *  which way they are facing.
	 *  @type {Number}
	 *  @memberOf Tone.Listener#
	 *  @name forwardZ
	 */
	Object.defineProperty(Tone.Listener.prototype, "forwardZ", {
		set : function(pos){
			this._orientation[2] = pos;
			this.setOrientation.apply(this, this._orientation);
		},
		get : function(){
			return this._orientation[2];
		}
	});

	/**
	 *  The x coordinate of the listener's up direction. i.e.
	 *  the direction the listener is standing in.
	 *  @type {Number}
	 *  @memberOf Tone.Listener#
	 *  @name upX
	 */
	Object.defineProperty(Tone.Listener.prototype, "upX", {
		set : function(pos){
			this._orientation[3] = pos;
			this.setOrientation.apply(this, this._orientation);
		},
		get : function(){
			return this._orientation[3];
		}
	});

	/**
	 *  The y coordinate of the listener's up direction. i.e.
	 *  the direction the listener is standing in.
	 *  @type {Number}
	 *  @memberOf Tone.Listener#
	 *  @name upY
	 */
	Object.defineProperty(Tone.Listener.prototype, "upY", {
		set : function(pos){
			this._orientation[4] = pos;
			this.setOrientation.apply(this, this._orientation);
		},
		get : function(){
			return this._orientation[4];
		}
	});

	/**
	 *  The z coordinate of the listener's up direction. i.e.
	 *  the direction the listener is standing in.
	 *  @type {Number}
	 *  @memberOf Tone.Listener#
	 *  @name upZ
	 */
	Object.defineProperty(Tone.Listener.prototype, "upZ", {
		set : function(pos){
			this._orientation[5] = pos;
			this.setOrientation.apply(this, this._orientation);
		},
		get : function(){
			return this._orientation[5];
		}
	});

	/**
	 *  Clean up.
	 *  @returns {Tone.Listener} this
	 */
	Tone.Listener.prototype.dispose = function(){
		this._listener.disconnect();
		this._listener = null;
		this._orientation = null;
		this._position = null;
		return this;
	};

	//SINGLETON SETUP
	var ListenerConstructor = Tone.Listener;
	Tone._initAudioContext(function(){
		if (typeof Tone.Listener === "function"){
			//a single listener object
			Tone.Listener = new Tone.Listener();
		} else {
			//make new Listener insides
			ListenerConstructor.call(Tone.Listener);
		}
	});
	//END SINGLETON SETUP

	return Tone.Listener;
});