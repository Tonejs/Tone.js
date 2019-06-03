/**
 *  Update the position of this panner based on 
 *  a THREE.Object3D that is passed in.
 *  Adapted from https://github.com/mrdoob/three.js/blob/dev/src/audio/PositionalAudio.js
 *  @param  {THREE.Object3D}  object
 *  @return  {Tone.Panner3D}  this
 */
Tone.Panner3D.prototype.updatePosition = (function(){

	if (!THREE){
		throw new Error("this method requires THREE.js");
	}

	var position = new THREE.Vector3();

	return function(object){
		position.setFromMatrixPosition(object.matrixWorld);
		this.setPosition(position.x, position.y, position.z);
	};
}());

/**
 *  Update the listener's position and orientation based on
 *  a THREE.Object3D that is passed in.
 *  Adapted from https://github.com/mrdoob/three.js/blob/dev/src/audio/PositionalAudio.js
 *  @param  {THREE.Object3D}  object
 *  @return  {Tone.Panner3D}  this
 */
Tone.Listener.constructor.prototype.updatePosition = (function(){

	if (!THREE){
		throw new Error("this method requires THREE.js");
	}

	var position = new THREE.Vector3();
	var quaternion = new THREE.Quaternion();
	var scale = new THREE.Vector3();

	var orientation = new THREE.Vector3();

	return function(object){
		var up = object.up;
		object.matrixWorld.decompose( position, quaternion, scale);
		orientation.set(0, 0, -1).applyQuaternion( quaternion);

		this.setPosition(position.x, position.y, position.z);

		this.setOrientation(orientation.x, orientation.y, orientation.z, up.x, up.y, up.z);
	};

}());