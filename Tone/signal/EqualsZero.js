define(["Tone/core/Tone", "Tone/signal/Threshold"], function(Tone){

	/**
	 *  Output 1 if the signal is equal to 0, otherwise outputs 0
	 *  
	 *  @constructor
	 *  @extends {Tone}
	 */
	Tone.EqualsZero = function(){
		/**
		 *  @type {WaveShaperNode}
		 *  @private
		 */
		this._equals = this.context.createWaveShaper();

		/**
		 *  @type {WaveShaperNode}
		 *  @private
		 */
		this._thresh = new Tone.Threshold(0.99999);

		/**
		 *  @type {WaveShaperNode}
		 */
		this.input = this._equals;

		this._equals.connect(this._thresh);

		this.output = this._thresh;


		this._setEquals();
	};

	Tone.extend(Tone.EqualsZero);

	/**
	 *  @private
	 */
	Tone.EqualsZero.prototype._setEquals = function(angle){
		var curveLength = 1024;
		var curve = new Float32Array(curveLength);
		for (var i = 0; i < curveLength; i++){
			var normalized = (i / (curveLength));
			var val;
			if (normalized === 0.5){
				val = 1;
			} else {
				val = 0;
			}
			curve[i] = val;
		}
		this._equals.curve = curve;
	};

	return Tone.EqualsZero;
});