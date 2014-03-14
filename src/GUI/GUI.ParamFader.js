///////////////////////////////////////////////////////////////////////////////
//
//	PARAM FADER
//
//	attach it to an AudioParam and let it control/follow it's value
///////////////////////////////////////////////////////////////////////////////

AudioUnit.GUI.ParamFader = function(container, audioParam, minOutput, maxOutput, label, scaling, segments){
	//extend Fader
	AudioUnit.GUI.Fader.call(this, container, minOutput, maxOutput, label, segments);

	//set the scaling
	this.scaling = this.defaultArg(scaling, "log");
	this.watch = audioParam;
	
	this.onAnimationFrame(this.followValue, this);
}

AudioUnit.extend(AudioUnit.GUI.ParamFader, AudioUnit.GUI.Fader);

//called 60fps
AudioUnit.GUI.ParamFader.prototype.followValue = function(){
	if (!this.isDragging){
		this.setLevel(this.watch.value);
	}
}

AudioUnit.GUI.ParamFader.prototype.onchange = function(val){
	this.watch.value = val;
}