///////////////////////////////////////////////////////////////////////////////
//
//  NOISE
//
///////////////////////////////////////////////////////////////////////////////

//@param {string} type the noise type
AudioUnit.Noise = function(type){
	//extend Unit
	AudioUnit.call(this);

	//components
	this.jsNode = this.context.createScriptProcessor(this.bufferSize, 1, 1);
	this.shaper = this.context.createWaveShaper();

	//connections
	this.jsNode.connect(this.shaper);
	this.shaper.connect(this.output);

	this.setType(this.defaultArg(type, "white"));
}

AudioUnit.extend(AudioUnit.Noise, AudioUnit);

//@param {string} type ('white', 'pink', 'brown')
AudioUnit.Noise.prototype.setType = function(type){
	switch (type){
		case "white" : 
			this.jsNode.onaudioprocess = this._whiteNoise.bind(this);
			break;
		case "pink" : 
			this.jsNode.onaudioprocess = this._pinkNoise.bind(this);
			break;
		case "brown" : 
			this.jsNode.onaudioprocess = this._brownNoise.bind(this);
			break;
		default : 
			this.jsNode.onaudioprocess = this._whiteNoise.bind(this);
	}
}

//modified from http://noisehack.com/generate-noise-web-audio-api/
AudioUnit.Noise.prototype._pinkNoise = (function() {
    var b0, b1, b2, b3, b4, b5, b6;
    b0 = b1 = b2 = b3 = b4 = b5 = b6 = 0.0;
    var bufferSize = this.bufferSize;
    return function(e) {
        var output = e.outputBuffer.getChannelData(0);
        for (var i = 0; i < bufferSize; i++) {
            var white = Math.random() * 2 - 1;
            b0 = 0.99886 * b0 + white * 0.0555179;
            b1 = 0.99332 * b1 + white * 0.0750759;
            b2 = 0.96900 * b2 + white * 0.1538520;
            b3 = 0.86650 * b3 + white * 0.3104856;
            b4 = 0.55000 * b4 + white * 0.5329522;
            b5 = -0.7616 * b5 - white * 0.0168980;
            output[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
            output[i] *= 0.11; // (roughly) compensate for gain
            b6 = white * 0.115926;
        }
    }
})();

//modified from http://noisehack.com/generate-noise-web-audio-api/
AudioUnit.Noise.prototype._brownNoise = (function() {
    var lastOut = 0.0;
    var bufferSize = this.bufferSize;
    return function(e) {
        var output = e.outputBuffer.getChannelData(0);
        for (var i = 0; i < bufferSize; i++) {
            var white = Math.random() * 2 - 1;
            output[i] = (lastOut + (0.02 * white)) / 1.02;
            lastOut = output[i];
            output[i] *= 3.5; // (roughly) compensate for gain
        }
    }
    return node;
})();

//modified from http://noisehack.com/generate-noise-web-audio-api/
AudioUnit.Noise.prototype._whiteNoise = function(e){
	var bufferSize = this.bufferSize;
 	var output = event.outputBuffer.getChannelData(0);
    for (var i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
    }
}