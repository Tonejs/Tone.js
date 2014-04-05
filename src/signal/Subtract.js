///////////////////////////////////////////////////////////////////////////////
//
//  SUBTRACT FROM
//
//	subtract the signal from the constant
//	for subtracting from the signal, use Tone.Add with a negative number
///////////////////////////////////////////////////////////////////////////////

define(["core/Tone"], function(Tone){

	Tone.Subtract = function(constant){
		Tone.call(this);

		this.constant = constant;

		//component
		this.subber = this.context.createWaveShaper();

		//connections
		this.chain(this.input, this.subber, this.output);

		//setup
		this._subCurve();
	}

	Tone.extend(Tone.Subtract);

	//subtracts the signal from the value
	Tone.Subtract.prototype._subCurve = function(){
		var len = this.waveShaperResolution;
		var curve = new Float32Array(len);
		for (var i = 0; i < len; i++){
			///scale the values between -1 to 1
			var baseline = (i / (len - 1)) * 2 - 1;
			//all inputs produce the output value
			curve[i] = this.constant - baseline;
		}
		//console.log(curve);
		this.subber.curve = curve;
	}

	return Tone.Subtract;
});