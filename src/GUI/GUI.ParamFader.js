///////////////////////////////////////////////////////////////////////////////
//
//	PARAM FADER
//
//	attach it to an AudioParam and let it control/follow it's value
///////////////////////////////////////////////////////////////////////////////

Tone.GUI.ParamFader = function(container, audioParam, minOutput, maxOutput, label, scaling, segments){
	//extend Fader
	Tone.GUI.Fader.call(this, container, minOutput, maxOutput, label, segments);

	//set the scaling
	this.scaling = this.defaultArg(scaling, "log");
	this.watch = audioParam;
	
	this.onAnimationFrame(this.followValue, this);
}

Tone.extend(Tone.GUI.ParamFader, Tone.GUI.Fader);

//called 60fps
Tone.GUI.ParamFader.prototype.followValue = function(){
	if (!this.isDragging){
		this.setLevel(this.watch.value);
	}
}

Tone.GUI.ParamFader.prototype.onchange = function(val){
	this.watch.value = val;
}