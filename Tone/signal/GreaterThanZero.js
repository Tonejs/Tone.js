define(["Tone/core/Tone", "Tone/signal/Signal", "Tone/signal/Multiply"], function(Tone){

	"use strict";

	/**
	 *  @private
	 *  @static
	 *  @type {Float32Array}
	 */
	var threshCurve = new Float32Array(2048);
	//set the value
	for (var i = 0; i < threshCurve.length; i++){
		var normalized = (i / (threshCurve.length)) * 2 - 1;
		var val;
		if (normalized <= 0){
			val = 0;
		} else {
			val = 1;
		}
		threshCurve[i] = val;
	}

	/**
	 *  @class  GreaterThanZero outputs 1 when the input is strictly greater than zero
	 *  
	 *  @constructor
	 *  @extends {Tone}
	 */
	Tone.GreaterThanZero = function(){
		
		/**
		 *  @type {WaveShaperNode}
		 *  @private
		 */
		this._thresh = this.context.createWaveShaper();
		this._thresh.curve = threshCurve;

		/**
		 *  scale the first thresholded signal by a large value.
		 *  this will help with values which are very close to 0
		 *  @type {Tone.Multiply}
		 *  @private
		 */
		this._scale = new Tone.Multiply(10000);

		/**
		 *  @type {WaveShaperNode}
		 */
		this.input = this._scale;

		/**
		 *  @type {WaveShaperNode}
		 */
		this.output = this._thresh;

		//connections
		this._scale.connect(this._thresh);
	};

	Tone.extend(Tone.GreaterThanZero);

	/**
	 *  borrows the method from {@link Tone.Signal}
	 *  
	 *  @function
	 */
	Tone.GreaterThanZero.prototype.connect = Tone.Signal.prototype.connect;

	/**
	 *  dispose method
	 */
	Tone.GreaterThanZero.prototype.dispose = function(){
		Tone.prototype.dispose.call(this);
		this._scale.dispose();
		this._thresh.disconnect();
		this._thresh = null;
		this._scale = null;
	};

	return Tone.GreaterThanZero;
});