
AudioUnit.GUI.Compressor = function(container, compressor, segments){
	AudioUnit.GUI.call(this);

	this.element = this.createElement();
	//display the gain reduction
	this.reduction = new AudioUnit.GUI.ParamFader(this.element, compressor.reduction, -20, 0, "reduct", "lin", segments);
	this.reduction.slider.remove();
	//fader for thresh
	this.threshold = new AudioUnit.GUI.ParamFader(this.element, compressor.threshold, -60, 0, "thresh", "lin", segments);
	//fader for ratio
	this.ratio = new AudioUnit.GUI.ParamFader(this.element, compressor.ratio, 1, 20, "ratio", "log", segments);

	this.appendChild(container, this.element);
}

AudioUnit.extend(AudioUnit.GUI.Compressor, AudioUnit.GUI);