define(["Tone/core/Tone", "Tone/signal/Signal", "Tone/signal/GreaterThanZero"], function(Tone){

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
		if (normalized === 0){
			val = 1;
		} else {
			val = 0;
		}
		threshCurve[i] = val;
	}

	/**
	 *  @class  EqualZero outputs 1 when the input is strictly greater than zero
	 *  
	 *  @constructor
	 *  @extends {Tone}
	 */
	Tone.EqualZero = function(){

		/**
		 *  scale the incoming signal by a large factor
		 *  @private
		 *  @type {Tone.Multiply}
		 */
		this._scale = new Tone.Multiply(10000);
		
		/**
		 *  @type {WaveShaperNode}
		 *  @private
		 */
		this._thresh = this.context.createWaveShaper();
		this._thresh.curve = threshCurve;

		/**
		 *  threshold the output so that it's 0 or 1
		 *  @type {Tone.GreaterThanZero}
		 *  @private
		 */
		this._gtz = new Tone.GreaterThanZero();

		/**
		 *  @type {WaveShaperNode}
		 */
		this.input = this._scale;

		/**
		 *  @type {WaveShaperNode}
		 */
		this.output = this._gtz;

		//connections
		this.chain(this._scale, this._thresh, this._gtz);
	};

	Tone.extend(Tone.EqualZero);

	/**
	 *  borrows the method from {@link Tone.Signal}
	 *  
	 *  @function
	 */
	Tone.EqualZero.prototype.connect = Tone.Signal.prototype.connect;

	/**
	 *  dispose method
	 */
	Tone.EqualZero.prototype.dispose = function(){
		Tone.prototype.dispose.call(this);
		this._gtz.dispose();
		this._scale.dispose();
		this._thresh.disconnect();
		this._thresh = null;
		this._scale = null;
		this._gtz = null;
	};

	return Tone.EqualZero;
});