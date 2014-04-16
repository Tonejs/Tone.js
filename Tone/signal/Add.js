///////////////////////////////////////////////////////////////////////////////
//
//  ADD
//
//	adds a constant value to the incoming signal in normal range (-1 to 1)
///////////////////////////////////////////////////////////////////////////////

define(["Tone/core/Tone"], function(Tone){

	Tone.Add = function(constant){
		Tone.call(this);

		this.constant = constant;

		//component
		this.adder = this.context.createWaveShaper();

		//connections
		this.chain(this.input, this.adder, this.output);

		//setup
		this._adderCurve();
	}

	Tone.extend(Tone.Add);

	//adds a constant value to the incoming signal
	Tone.Add.prototype._adderCurve = function(){
		var len = this.waveShaperResolution;
		var curve = new Float32Array(len);
		for (var i = 0; i < len; i++){
			///scale the values between -1 to 1
			var baseline = (i / (len - 1)) * 2 - 1;
			//all inputs produce the output value
			curve[i] = baseline + this.constant;
		}
		//console.log(curve);
		this.adder.curve = curve;
	}

	//set the constant value
	//@param {number} const
	Tone.Add.prototype.setConstant = function(constant){
		this.constant = constant;
		this._adderCurve();
	}

	return Tone.Add;
});