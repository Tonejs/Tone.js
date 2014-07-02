define(["Tone/core/Tone"], function(Tone){

	/**
	 *  return the absolute value of an incoming signal between -1 and 1
	 *
	 *  @constructor
	 *  @extends {Tone}
	 *  @param {number} value
	 */
	Tone.Abs = function(value){
		/**
		 *  @type {WaveShaperNode}
		 *  @private
		 */
		this._abs = this.context.createWaveShaper();
		/**
		 *  @type {WaveShaperNode}
		 */
		this.input = this.output = this._abs;

		this._setAbsCurve();
	};

	Tone.extend(Tone.Abs);

	/**
	 *  @param {number} thresh 
	 *  @private
	 */
	Tone.Abs.prototype._setAbsCurve = function(){
		var curveLength = 1024;
		var curve = new Float32Array(curveLength);
		for (var i = 0; i < curveLength; i++){
			var normalized = (i / (curveLength - 1)) * 2 - 1;
			curve[i] = val = Math.abs(normalized);
		}
		this._abs.curve = curve;
	};

	/**
	 *  dispose method
	 */
	Tone.Abs.prototype.dispose = function(){
		this._abs.disconnect();
		this._abs = null;
	}; 

	return Tone.Abs;
});