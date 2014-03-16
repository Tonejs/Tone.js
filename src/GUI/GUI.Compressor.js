
Tone.GUI.Compressor = function(container, compressor, segments){
	Tone.GUI.call(this);

	this.element = this.createElement();
	//display the gain reduction
	this.reduction = new Tone.GUI.ParamFader(this.element, compressor.reduction, -20, 0, "reduct", "lin", segments);
	this.reduction.slider.remove();
	//fader for thresh
	this.threshold = new Tone.GUI.ParamFader(this.element, compressor.threshold, -60, 0, "thresh", "lin", segments);
	//fader for ratio
	this.ratio = new Tone.GUI.ParamFader(this.element, compressor.ratio, 1, 20, "ratio", "log", segments);

	this.appendChild(container, this.element);
}

Tone.extend(Tone.GUI.Compressor, Tone.GUI);