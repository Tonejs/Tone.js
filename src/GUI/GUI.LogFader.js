

AudioUnit.GUI.ParamFader = function(container, connectTo, minOutput, maxOutput, label, scaling, segments){
	//extend GUI
	AudioUnit.GUI.call(this);

	//components
	this.element = this.createElement();
	this.track = this.createElement();
	this.slider = this.createElement("input");
	this.slider.type = "range";
	this.textInput = this.createElement("input");
	this.textInput.type = "text";
	this.watch = connectTo;
	if (connectTo.output && connectTo.output.gain instanceof AudioParam){
		this.watch = connectTo.output.gain;
	}
	this.isDragging = false;
	this.min = this.defaultArg(minOutput, 0);
	this.max = this.defaultArg(maxOutput, 1);
	this.scaling = this.defaultArg(scaling, "log");
	
	this.bars = new AudioUnit.GUI.Bar(this.track, segments);

	//set it
	this.setClass(this.element, "fader");
	this.setClass(this.track, "track");
	this.setClass(this.slider, "slider");
	this.setClass(this.textInput, "label");
	this.appendChild(container, this.element);
	this.appendChild(this.element, this.track);
	this.appendChild(this.track, this.slider);
	this.appendChild(this.element, this.textInput);
	this.onAnimationFrame(this.followValue, this);

	this._setupEvents();

	this._setInitial();
}

AudioUnit.extend(AudioUnit.GUI.Fader, AudioUnit.GUI);

//called when the value has changed
AudioUnit.GUI.Fader.prototype.onchange = function(){};

//called when the value has changed
AudioUnit.GUI.Fader.prototype._onchange = function(){
	var val = this.slider.value / 100;
	this.bars.setLevel(val);
	var scaled = this.interpolate(this._scale(val), this.min, this.max);
	this.textInput.value = scaled.toFixed(3);
	this.watch.value = scaled;
	this.onchange(scaled);
};

AudioUnit.GUI.Fader.prototype._onchangeText = function(e){
	var val = parseFloat(this.textInput.value);
	this.slider.value = this._inverseScale(this.normalize(val, this.min, this.max)) * 100;
	this._onchange();
}

//called 60fps
AudioUnit.GUI.Fader.prototype.followValue = function(){
	if (!this.isDragging){
		var normalized = this._inverseScale(this.normalize(this.watch.value, this.min, this.max)) * 100;
		if (normalized !== this.slider.value){
			this.slider.value = normalized;
		}
	}
}

//sets the initial values
AudioUnit.GUI.Fader.prototype._setInitial = function(){
	var val = this.watch.value;
	this.slider.value = this._inverseScale(this.normalize(val, this.min, this.max)) * 100;
	this.textInput.value = val.toFixed(3);
	this.bars.setLevel(this.slider.value / 100);
}


//input a value between 0-1
AudioUnit.GUI.Fader.prototype._inverseScale = function(x){
	switch(this.scaling){
		case "lin" : 
			return parseFloat(x);
		case "log" : 
			return this.gainToLogScale(x);
		case "exp" : 
			return this.gainToPowScale(x);
	}
}

//input a value between 0-1
AudioUnit.GUI.Fader.prototype._scale = function(x){
	switch(this.scaling){
		case "lin" : 
			return parseFloat(x);
		case "log" : 
			return this.gainToPowScale(x);
		case "exp" : 
			return this.gainToLogScale(x);
	}		
}

//called when the value has changed
AudioUnit.GUI.Fader.prototype._setupEvents = function(){
	this.textInput.onchange = this._onchangeText.bind(this);
	this.slider.onchange = this._onchange.bind(this);
	this.slider.onmousedown = this._mousedown.bind(this);
	this.slider.onmouseup = this._mouseup.bind(this);
};

AudioUnit.GUI.Fader.prototype._mousedown = function(e){
	this.isDragging = true;
}

AudioUnit.GUI.Fader.prototype._mouseup = function(e){
	this.isDragging = false;
}