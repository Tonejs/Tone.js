define(["Tone/core/Tone", "Tone/signal/Threshold", "Tone/signal/Add"], function(Tone){

	/**
	 *  @class  Output 1 if the signal is less than the value, otherwise outputs 0
	 *  
	 *  @constructor
	 *  @extends {Tone}
	 *  @param {number=} [value=0] the value to compare to the incoming signal
	 */
	Tone.LessThan = function(value){
		/**
		 *  @type {WaveShaperNode}
		 *  @private
		 */
		this._lt = this.context.createWaveShaper();

		/**
		 *  @type {Tone.Threshold}
		 *  @private
		 */
		this._thresh = new Tone.Threshold(0.001);

		/**
		 *  subtract the value from the incoming signal
		 *  
		 *  @type {Tone.Add}
		 *  @private
		 */
		this._adder = new Tone.Add(this.defaultArg(-value, 0));

		/**
	 	 *  alias for the adder
		 *  @type {Tone.Add}
		 */
		this.input = this._adder;

		/**
		 *  alias for the thresh
		 *  @type {Tone.Threshold}
		 */
		this.output = this._thresh;

		//connect
		this.chain(this._adder, this._lt, this._thresh);
		//setup waveshaper
		this._setLessThanZero();
	};

	Tone.extend(Tone.LessThan);

	/**
	 *  @private
	 */
	Tone.LessThan.prototype._setLessThanZero = function(){
		var curveLength = 1024;
		var curve = new Float32Array(curveLength);
		for (var i = 0; i < curveLength; i++){
			var normalized = (i / (curveLength)) * 2 - 1;
			if (normalized < 0){
				curve[i] = 1;
			} else {
				curve[i] = 0;
			}
		}
		this._lt.curve = curve;
	};

	/**
	 *  set the value to compare to
	 *  
	 *  @param {number} value
	 */
	Tone.LessThan.prototype.setValue = function(value){
		this._adder.setValue(-value);
	};

	/**
	 *  borrows the method from {@link Tone.Signal}
	 *  
	 *  @function
	 */
	Tone.LessThan.prototype.connect = Tone.Signal.prototype.connect;

	/**
	 *  dispose method
	 */
	Tone.LessThan.prototype.dispose = function(){
		this._lt.disconnect();
		this._adder.disconnect();
		this._thresh.dispose();
		this._lt = null;
		this._adder = null;
		this._thresh = null;
	};

	return Tone.LessThan;
});