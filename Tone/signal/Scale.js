///////////////////////////////////////////////////////////////////////////////
//
//  SCALE
//
//	performs linear scaling on an input signal between inputMin and inputMax 
//	to output the range outputMin outputMax
///////////////////////////////////////////////////////////////////////////////

define(["Tone/core/Tone", "Tone/signal/Add", "Tone/signal/Multiply"], function(Tone){

	//@param {number} inputMin
	//@param {number} inputMax
	//@param {number=} outputMin
	//@param {number=} outputMax
	Tone.Scale = function(inputMin, inputMax, outputMin, outputMax){
		Tone.call(this);

		if (arguments.length == 2){
			outputMin = inputMin;
			outputMax = inputMax;
			inputMin = -1;
			inputMax = 1;
		}
		//components
		this.plusInput = new Tone.Add(-inputMin);
		this.scale = new Tone.Multiply((outputMax - outputMin)/(inputMax - inputMin));
		this.plusOutput = new Tone.Add(outputMin);

		//connections
		this.chain(this.input, this.plusInput, this.scale, this.plusOutput, this.output);
	}

	//extend StereoSplit
	Tone.extend(Tone.Scale);


	return Tone.Scale;
});
