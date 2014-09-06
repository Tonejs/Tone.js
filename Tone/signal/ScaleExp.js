define(["Tone/core/Tone", "Tone/signal/Add", "Tone/signal/Multiply", "Tone/signal/Signal"], function(Tone){
	
	/**
	 *  @class  performs an exponential scaling on an input signal.
	 *          Scales from the input range of inputMin to inputMax 
	 *          to the output range of outputMin to outputMax.
	 *
	 *  @description If only two arguments are provided, the inputMin and inputMax are set to -1 and 1
	 *
	 *  @constructor
	 *  @extends {Tone}
	 *  @param {number} inputMin  
	 *  @param {number} inputMax  
	 *  @param {number} outputMin 
	 *  @param {number=} outputMax 
	 *  @param {number=} [exponent=2] the exponent which scales the incoming signal
	 */
	Tone.ScaleExp = function(inputMin, inputMax, outputMin, outputMax, exponent){

		Tone.call(this);

		//if there are only two args
		if (arguments.length === 2){
			outputMin = inputMin;
			outputMax = inputMax;
			exponent = 2;
			inputMin = -1;
			inputMax = 1;
		} else if (arguments.length === 3){
			exponent = outputMin;
			outputMin = inputMin;
			outputMax = inputMax;
			inputMin = -1;
			inputMax = 1;
		}

		/** 
		 *  @private
		 *  @type {number}
		 */
		this._inputMin = inputMin;
		
		/** 
		 *  @private
		 *  @type {number}
		 */
		this._inputMax = inputMax;

		/** 
		 *  @private
		 *  @type {number}
		 */
		this._outputMin = outputMin;

		/** 
		 *  @private
		 *  @type {number}
		 */
		this._outputMax = outputMax;


		/** 
		 *  @private
		 *  @type {Tone.Add}
		 */
		this._plusInput = new Tone.Add(0);

		/** 
		 *  @private
		 *  @type {Tone.Multiply}
		 */
		this._normalize = new Tone.Multiply(1);

		/** 
		 *  @private
		 *  @type {Tone.Multiply}
		 */
		this._scale = new Tone.Multiply(1);

		/** 
		 *  @private
		 *  @type {Tone.Add}
		 */
		this._plusOutput = new Tone.Add(0);

		/**
		 *  @private
		 *  @type {WaveShaperNode}
		 */
		this._expScaler = this.context.createWaveShaper();

		//connections
		this.chain(this.input, this._plusInput, this._normalize, this._expScaler, this._scale, this._plusOutput, this.output);
		//set the scaling values
		this._setScalingParameters();
		this.setExponent(this.defaultArg(exponent, 2));
	};

	Tone.extend(Tone.ScaleExp);

	/**
	 *  set the scaling parameters
	 *  
	 *  @private
	 */
	Tone.ScaleExp.prototype._setScalingParameters = function(){
		//components
		this._plusInput.setValue(-this._inputMin);
		this._scale.setValue((this._outputMax - this._outputMin));
		this._normalize.setValue(1 / (this._inputMax - this._inputMin));
		this._plusOutput.setValue(this._outputMin);
	};

	/**
	 *  set the exponential scaling curve
	 *  @param {number} exp the exponent to raise the incoming signal to
	 */
	Tone.ScaleExp.prototype.setExponent = function(exp){
		var curveLength = 1024;
		var curve = new Float32Array(curveLength);
		for (var i = 0; i < curveLength; i++){
			var normalized = (i / (curveLength)) * 2 - 1;
			if (normalized >= 0){
				curve[i] = Math.pow(normalized, exp);
			} else {
				curve[i] = normalized;
			}
		}
		this._expScaler.curve = curve;
	};

	/**
	 *  set the input min value
	 *  @param {number} val 
	 */
	Tone.ScaleExp.prototype.setInputMin = function(val){
		this._inputMin = val;
		this._setScalingParameters();
	};

	/**
	 *  set the input max value
	 *  @param {number} val 
	 */
	Tone.ScaleExp.prototype.setInputMax = function(val){
		this._inputMax = val;
		this._setScalingParameters();
	};

	/**
	 *  set the output min value
	 *  @param {number} val 
	 */
	Tone.ScaleExp.prototype.setOutputMin = function(val){
		this._outputMin = val;
		this._setScalingParameters();
	};

	/**
	 *  set the output max value
	 *  @param {number} val 
	 */
	Tone.ScaleExp.prototype.setOutputMax = function(val){
		this._outputMax = val;
		this._setScalingParameters();
	};

	/**
	 *  borrows connect from {@link Tone.Signal}
	 *  
	 *  @function
	 */
	Tone.ScaleExp.prototype.connect = Tone.Signal.prototype.connect;

	/**
	 *  clean up
	 */
	Tone.ScaleExp.prototype.dispose = function(){
		Tone.prototype.dispose.call(this);
		this._plusInput.dispose();
		this._plusOutput.dispose();
		this._normalize.dispose();
		this._scale.dispose();
		this._expScaler.disconnect();
		this._plusInput = null;
		this._plusOutput = null;
		this._scale = null;
		this._normalize = null;
		this._expScaler = null;
	}; 


	return Tone.ScaleExp;
});
