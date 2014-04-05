///////////////////////////////////////////////////////////////////////////////
//
//  NORMALIZE
//
//	normalizes the incoming signal (between inputMin and inputMax)
//	to normal range (-1 to 1)
//	should deprecate!
///////////////////////////////////////////////////////////////////////////////

define(["core/Tone"], function(Tone){	

	Tone.Normalize = function(inputMin, inputMax){
		Tone.call(this);

		//vars
		this.inputMin = this.defaultArg(inputMin, -1);
		this.inputMax = this.defaultArg(inputMax, 1);

		//components
		this.normalize = this.context.createScriptProcessor(this.bufferSize, 1, 1);

		//connections
		this.chain(this.input, this.normalize, this.output);

		//setup
		this.normalize.onaudioprocess = this._process.bind(this);
	}

	Tone.extend(Tone.Normalize);

	Tone.Normalize.prototype._process = function(e) {
		var bufferSize = this.normalize.bufferSize;
		var input = e.inputBuffer.getChannelData(0);
		var output = e.outputBuffer.getChannelData(0);
		var min = this.inputMin;
		var max = this.inputMax;
		var divisor = (max - min) / 2;
		for (var i = 0; i < bufferSize; i++) {
			output[i] = (input[i] - min) / divisor - 1;
		}
	}

	return Tone.Normalize;
})
