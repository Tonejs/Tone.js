define(["../core/Tone", "../component/CrossFade", "../component/Merge", "../component/Split",
	"../signal/Signal", "../signal/AudioToGain", "../signal/Zero"], function(Tone){

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
	 */
	Tone.Listener = function(){

		Tone.call(this);

		/**
		 *  Holds the current forward orientation
		 *  @type  {Array}
		 *  @private
		 */
		this._orientation = [0, 0, 0, 0, 0, 0];

		/**
		 *  Holds the current position
		 *  @type  {Array}
		 *  @private
		 */
		this._position = [0, 0, 0];

		Tone.getContext(function(){
			// set the default position/forward
			this.set(ListenerConstructor.defaults);

			//listener is a singleton so it adds itself to the context
			this.context.listener = this;
		}.bind(this));

	};

	Tone.extend(Tone.Listener);

	/**
	 *  Defaults according to the specification
	 *  @static
	 *  @const
	 *  @type {Object}
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

	/**
	 * Is an instanceof Tone.Listener
	 * @type {Boolean}
	 */
	Tone.Listener.prototype.isListener = true;

	/**
	 * The ramp time which is applied to the setTargetAtTime
	 * @type {Number}
	 * @private
	 */
	Tone.Listener.prototype._rampTimeConstant = 0.01;

	/**
	 *  Sets the position of the listener in 3d space.
	 *  @param  {Number}  x
	 *  @param  {Number}  y
	 *  @param  {Number}  z
	 *  @return {Tone.Listener} this
	 */
	Tone.Listener.prototype.setPosition = function(x, y, z){
		if (this.context.rawContext.listener.positionX){
			var now = this.now();
			this.context.rawContext.listener.positionX.setTargetAtTime(x, now, this._rampTimeConstant);
			this.context.rawContext.listener.positionY.setTargetAtTime(y, now, this._rampTimeConstant);
			this.context.rawContext.listener.positionZ.setTargetAtTime(z, now, this._rampTimeConstant);
		} else {
			this.context.rawContext.listener.setPosition(x, y, z);
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
		if (this.context.rawContext.listener.forwardX){
			var now = this.now();
			this.context.rawContext.listener.forwardX.setTargetAtTime(x, now, this._rampTimeConstant);
			this.context.rawContext.listener.forwardY.setTargetAtTime(y, now, this._rampTimeConstant);
			this.context.rawContext.listener.forwardZ.setTargetAtTime(z, now, this._rampTimeConstant);
			this.context.rawContext.listener.upX.setTargetAtTime(upX, now, this._rampTimeConstant);
			this.context.rawContext.listener.upY.setTargetAtTime(upY, now, this._rampTimeConstant);
			this.context.rawContext.listener.upZ.setTargetAtTime(upZ, now, this._rampTimeConstant);
		} else {
			this.context.rawContext.listener.setOrientation(x, y, z, upX, upY, upZ);
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
		this._orientation = null;
		this._position = null;
		return this;
	};

	//SINGLETON SETUP
	var ListenerConstructor = Tone.Listener;
	Tone.Listener = new ListenerConstructor();

	Tone.Context.on("init", function(context){
		if (context.listener && context.listener.isListener){
			//a single listener object
			Tone.Listener = context.listener;
		} else {
			//make new Listener insides
			Tone.Listener = new ListenerConstructor();
		}
	});
	//END SINGLETON SETUP

	return Tone.Listener;
});
