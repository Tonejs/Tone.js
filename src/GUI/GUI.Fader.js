///////////////////////////////////////////////////////////////////////////////
//
//	FADER
//
///////////////////////////////////////////////////////////////////////////////

Tone.GUI.Fader = function(container, minOutput, maxOutput, label, segments){
	//extend GUI
	Tone.GUI.call(this);

	//components
	this.element = this.createElement();
	this.track = this.createElement();
	this.label = this.createElement();
	this.slider = this.createElement("input");
	this.slider.type = "range";
	this.textInput = this.createElement("input");
	this.textInput.type = "text";

	
	this.isDragging = false;

	this.min = this.defaultArg(minOutput, 0);
	this.max = this.defaultArg(maxOutput, 1);
	this.currentLevel = null;
	this.scaling = "lin";
	
	this.bars = new Tone.GUI.Bar(this.track, segments);

	//set it
	this.setClass(this.element, "fader");
	this.setClass(this.track, "track");
	this.setClass(this.slider, "slider");
	this.setClass(this.textInput, "label");
	this.setClass(this.label, "label");
	this.appendChild(container, this.element);
	this.appendChild(this.element, this.track);
	this.appendChild(this.track, this.slider);
	this.appendChild(this.element, this.textInput);
	this.appendChild(this.element, this.label);
	
	this._setupEvents();
	this.setLevel(this.currentLevel);
	this.setLabel(this.defaultArg(label, ""));
}

Tone.extend(Tone.GUI.Fader, Tone.GUI);

//called when the value has changed
Tone.GUI.Fader.prototype.onchange = function(){};


//set the level of the 
Tone.GUI.Fader.prototype.setLevel = function(level){
	if (level !== this.currentLevel){
		this.currentLevel = level;
		this._setText(level);
		this._setSlider(level);
		this.onchange(level);
	}
};

///////////////////////////////////////////////////////////////////////////////
//	SCALING VALUES
///////////////////////////////////////////////////////////////////////////////

Tone.GUI.Fader.prototype._onchangeText = function(e){
	var val = parseFloat(this.textInput.value);
	this.setLevel(val);
}

//called when the value has changed
Tone.GUI.Fader.prototype._onchangeSlider = function(){
	var scaledVal = this._scale(this.slider.value / 100)
	var val = this.interpolate(scaledVal, this.min, this.max);
	this.setLevel(val);
};


//@param {number} val 
Tone.GUI.Fader.prototype._setText = function(val){
	if (val < 10){
		this.textInput.value = val.toFixed(3);
	} else if (val < 100){
		this.textInput.value = val.toFixed(2);
	} else {
		this.textInput.value = parseInt(val, 10);
	}
}

Tone.GUI.Fader.prototype._setSlider = function(val){
	//scale it to the slider range
	var normed = this.normalize(val, this.min, this.max);
	var scaled = this._inverseScale(normed);
	this.slider.value = scaled * 100;
	this.bars.setLevel(scaled);
}


//input a value between 0-1
Tone.GUI.Fader.prototype._inverseScale = function(x){
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
Tone.GUI.Fader.prototype._scale = function(x){
	switch(this.scaling){
		case "lin" : 
			return parseFloat(x);
		case "log" : 
			return this.gainToPowScale(x);
		case "exp" : 
			return this.gainToLogScale(x);
	}		
}

///////////////////////////////////////////////////////////////////////////////
//	INTERACTIONS
///////////////////////////////////////////////////////////////////////////////

//called when the value has changed
Tone.GUI.Fader.prototype._setupEvents = function(){
	this.textInput.onchange = this._onchangeText.bind(this);
	this.slider.onchange = this._onchangeSlider.bind(this);
	this.slider.onmousedown = this._mousedown.bind(this);
	this.slider.onmouseup = this._mouseup.bind(this);
};

Tone.GUI.Fader.prototype._mousedown = function(e){
	this.isDragging = true;
}

Tone.GUI.Fader.prototype._mouseup = function(e){
	this.isDragging = false;
}