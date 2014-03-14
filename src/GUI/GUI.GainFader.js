///////////////////////////////////////////////////////////////////////////////
//
//	GAIN FADER
//
//	attach it to an GainNode or an AudioUnit to control the output gain
///////////////////////////////////////////////////////////////////////////////

AudioUnit.GUI.GainFader = function(container, gain, label, segments){
	if (!(gain instanceof GainNode) && gain.output instanceof GainNode){
		gain = gain.output;
	}
	//extend Fader
	AudioUnit.GUI.ParamFader.call(this, container, gain.gain, 0, 1, label, "log", segments);
}

AudioUnit.extend(AudioUnit.GUI.GainFader, AudioUnit.GUI.ParamFader);

//@override
AudioUnit.GUI.GainFader.prototype._setText = function(val){
	this.textInput.value = this.gainToDb(val).toFixed(1) + "db";
}

//@override
AudioUnit.GUI.GainFader.prototype._onchangeText = function(e){
	var val = parseFloat(this.textInput.value);
	this.setLevel(this.dbToGain(val));
}

