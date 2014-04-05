///////////////////////////////////////////////////////////////////////////////
//
//  SCALE
//
//	scales the input in normal range (-1 to 1) to the output between min and max
///////////////////////////////////////////////////////////////////////////////

define(["core/Tone"], function(Tone){

	//@param {number} min
	//@param {number} max
	//@param {string} scaling (lin|exp|log|equalPower)
	Tone.Scale = function(min, max, scaling){
		Tone.call(this);

		//vals
		this.min = min;
		this.max = max;
		this.scaling = this.defaultArg(scaling, "lin");
		this.scalingFunction = this._selectScalingFunction(this.scaling);

		//components
		this.scaler = this.context.createWaveShaper();

		//connections
		this.chain(this.input, this.scaler, this.output);

		//setup
		this._scaleCurve();
	}

	//extend StereoSplit
	Tone.extend(Tone.Scale);

	//generates the values for the waveshaper
	Tone.Scale.prototype._scaleCurve = function(){
		var len = this.waveShaperResolution;
		var curve = new Float32Array(len);
		var min = this.min;
		var max = this.max;
		for (var i = 0; i < len; i++){
			//values between 0 and 1
			var terp = this.scalingFunction(i / (len - 1));
			curve[i] = terp * (max - min) + min;
		}
		this.scaler.curve = curve;
	}

	//
	Tone.Scale.prototype._selectScalingFunction = function(scaling){
		switch(scaling){
			case "lin" : return function(x) {return x};
			case "exp" : return this.expScale;
			case "log" : return this.logScale;
			case "equalPower" : return this.equalPowerScale;
		}
	}

	Tone.Scale.prototype.setMax = function(max){
		this.max = max;
		this._scaleCurve();
	}

	Tone.Scale.prototype.setMin = function(min){
		this.min = min;
		this._scaleCurve();
	}

	return Tone.Scale;
});
