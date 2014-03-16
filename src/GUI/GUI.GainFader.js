///////////////////////////////////////////////////////////////////////////////
//
//	GAIN FADER
//
//	attach it to an GainNode or an Tone to control the output gain
///////////////////////////////////////////////////////////////////////////////

Tone.GUI.GainFader = function(container, gain, label, segments){
	if (!(gain instanceof GainNode) && gain.output instanceof GainNode){
		gain = gain.output;
	}
	//extend Fader
	Tone.GUI.ParamFader.call(this, container, gain.gain, 0, 1, label, "log", segments);
}

Tone.extend(Tone.GUI.GainFader, Tone.GUI.ParamFader);

//@override
Tone.GUI.GainFader.prototype._setText = function(val){
	this.textInput.value = this.gainToDb(val).toFixed(1) + "db";
}

//@override
Tone.GUI.GainFader.prototype._onchangeText = function(e){
	var val = parseFloat(this.textInput.value);
	this.setLevel(this.dbToGain(val));
}

