//paul irish polyfill
window.requestAnimFrame = (function(){
  return  window.requestAnimationFrame       ||
          window.webkitRequestAnimationFrame ||
          window.mozRequestAnimationFrame    ||
          function( callback ){
            window.setTimeout(callback, 1000 / 60);
          };
})();

///////////////////////////////////////////////////////////////////////////////
//
//	GUI
//
// 	base class for GUI
///////////////////////////////////////////////////////////////////////////////

(function(global){

	//@constructor
	//@param {string=} elementType
	Tone.GUI = function(container, type){
		this.element = this.createElement(type);
		this._fastUpdateID = null;
		this._slowUpdateID = null;
		this.appendChild(container, this.element);
	}

	//BORROW SOME METHODS FROM TONE
	Tone.extend(Tone.GUI, Tone);

	///////////////////////////////////////////////////////////////////////////
	//	PRIVATE
	///////////////////////////////////////////////////////////////////////////

	//@private
	//@type {Array<Tone.GUI>}
	var _onFastUpdateCallbacks = [];

	//@private
	//@type {Array<Tone.GUI>}
	var _onSlowUpdateCallbacks = [];

	//@private
	//@type {number}
	var IdIndex = 0;

	//@returns {number}
	function getNextID(){
		IdIndex++;
		return IdIndex.toString();
	}

	function doSlowUpdate(){
		setTimeout(doSlowUpdate, 250);
		for (var i = 0; i < _onSlowUpdateCallbacks.length; i++){
			var cback = _onSlowUpdateCallbacks[i];
			cback.callback.call(cback.context);
		}
	}
	doSlowUpdate();

	function doFastUpdate(){
		global.requestAnimFrame(doFastUpdate);
		for (var i = 0; i < _onFastUpdateCallbacks.length; i++){
			var cback = _onFastUpdateCallbacks[i];
			cback.callback.call(cback.context);
		}
	}
	doFastUpdate();

	///////////////////////////////////////////////////////////////////////////
	//	CLASS METHODS
	///////////////////////////////////////////////////////////////////////////

	//callback gets envoked at 60fps
	//@param {function()} callback
	//@param {Object} ctx (the "this" object)
	Tone.GUI.prototype.onAnimationFrame = function(callback, ctx){
		var id = getNextID();
		var callbackObj = {
			callback : callback,
			context : this.defaultArg(ctx, global),
			id : id
		}
		_onFastUpdateCallbacks.push(callbackObj);
	}

	//callback gets envoked at 60fps
	//@param {function()} callback
	//@param {Object} ctx (the "this" object)
	Tone.GUI.prototype.onSlowUpdate = function(callback, ctx){
		var id = getNextID();
		var callbackObj = {
			callback : callback,
			context : this.defaultArg(ctx, global),
			id : id
		}
		_onSlowUpdateCallbacks.push(callbackObj);
	}

	Tone.GUI.prototype.remove = function(){
		if (this.element !== null){
			this.removeChildren();
			this.element.remove();
		}
		//remove from the updates
		for (var i = 0; i < _onSlowUpdateCallbacks.length; i++){
			if (_onSlowUpdateCallbacks[i].id === this._slowUpdateID){
				_onSlowUpdateCallbacks.splice(i, 1);
			}	
		}
		for (var i = 0; i < _onFastUpdateCallbacks.length; i++){
			if (_onFastUpdateCallbacks[i].id === this._fastUpdateID){
				_onFastUpdateCallbacks.splice(i, 1);
			}	
		}
	}

	///////////////////////////////////////////////////////////////////////////
	//	UTILITIES
	///////////////////////////////////////////////////////////////////////////

	Tone.GUI.prototype.removeChildren = function(){
		if (this.element){
			var child;
			while (child = this.element.firstChild) {
				this.element.removeChild(child);
			}
		}
	}

	//@param {Element} container
	//@param {Element} element
	Tone.GUI.prototype.appendChild = function(container, element){
		this._getElement(container).appendChild(this._getElement(element));
	}

	//@param {string=} type
	//@param {string=} class
	Tone.GUI.prototype.createElement = function(type, className){
		type = this.defaultArg(type, "div");
		var el = document.createElement(type);
		className = this.defaultArg(className, "");
		this.setClass(el, className);
		return el;
	}

	//@param {Element} element
	//@param {Element} unwraps jquery if necessary
	Tone.GUI.prototype._getElement = function(el){
		if (typeof jQuery !== 'undefined' && el instanceof jQuery){
			return el[0];
		} else if (el.element && meterGui.element instanceof HTMLElement){
			return el.element
		} else {
			return el;
		}
	}

	//@param {Element} element
	//@param {string} className
	Tone.GUI.prototype.setClass = function(element, className){
		this._getElement(element).className = className;
	}

	//@param {string} str
	Tone.GUI.prototype.setLabel = function(str){
		if (this.label && this.label instanceof HTMLElement){
			this.label.textContent = str;
		}
	}


	//give it to the window
	global.Tone.GUI = Tone.GUI;
})(window);///////////////////////////////////////////////////////////////////////////////
//
//	BUTTON
//	
//	basic UI button
///////////////////////////////////////////////////////////////////////////////


Tone.GUI.Button = function(container, callback, text){
	Tone.GUI.call(this, container);

	this.button = this.createElement("input");
	this.button.type = "button";
	this.button.onclick = this.clicked.bind(this);

	//the label
	this.label = this.createElement();
	this.label.textContent = text;


	this.setClass(this.element, "button");
	this.setClass(this.label, "label");
	this.callback = callback;

	this.appendChild(this.element, this.button);
	this.appendChild(this.element, this.label);
}

//extend GUI
Tone.extend(Tone.GUI.Button, Tone.GUI);

Tone.GUI.Button.prototype.clicked = function(event){
	this.callback(event, this);
}

Tone.GUI.Button.prototype.setText = function(text){
	this.label.textContent = text;
}///////////////////////////////////////////////////////////////////////////////
//
//	BAR
//
// 	bars for meters and other UI elements
///////////////////////////////////////////////////////////////////////////////

//@param {Element} container
//@param {number=} segments
Tone.GUI.Bar = function(container, segments){
	//extend GUI
	Tone.GUI.call(this, container);

	//vars
	this.segmentCount = this.defaultArg(segments, 20);
	this.segments = new Array(this.segmentCount);
	this.label = this.createElement();

	//create the segments
	for (var i = 0; i < this.segmentCount; i++){
		var segment = this.createElement();
		if (i === 0){
			this.setClass(segment, "segment peak");
		} else if (i < this.segmentCount * .3){
			this.setClass(segment, "segment high");
		} else {
			this.setClass(segment, "segment normal");
		}
		this.appendChild(this.element, segment);
		this.segments[this.segmentCount - i - 1] = segment;
	}

	this.setClass(this.element, "bar");
	this.setClass(this.label, "label");
	//add it to the container
	this.appendChild(this.element, this.label);
}

Tone.extend(Tone.GUI.Bar, Tone.GUI);

//@param {number} val (0-1)
Tone.GUI.Bar.prototype.setLevel = function(val){
	val *= this.segmentCount;
	for (var i = 0; i < this.segmentCount; i++){
		var seg = this.segments[i];
		seg.style.opacity = Math.max(Math.min(val - i, 1), 0);
	}
}
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
//@param {Element} container
//@param {Tone.Meter} meter
//@param {string=} label
//@param {number=} segments
Tone.GUI.Meter = function(container, meter, label, segments){
	Tone.GUI.call(this);

	//components
	this.meter = meter;
	this.element = this.createElement();
	this.bars = new Array(this.meter.channels);
	this.label = this.createElement();

	//add the bars
	for (var i = 0; i < this.meter.channels; i++){
		var bar = new Tone.GUI.Bar(this.element, segments);
		this.bars[i] = bar;
	}

	//set it up
	this.setClass(this.element, "meter");
	this.setClass(this.label, "label");
	this.setLabel(this.defaultArg(label, ""));
	this.onAnimationFrame(this.update, this);
	this.onSlowUpdate(this.labelUpdate, this);
	this.appendChild(container, this.element);
	this.appendChild(this.element, this.label);
}

Tone.extend(Tone.GUI.Meter, Tone.GUI);

Tone.GUI.Meter.prototype.update = function(){
	for (var channel = 0, channelCount = this.meter.channels; channel < channelCount; channel++){
		var volume = this.meter.getLevel(channel);
		this.bars[channel].setLevel(this.gainToLogScale(volume));
		//also check if it's clipped
	}
}

Tone.GUI.Meter.prototype.labelUpdate = function(){
	for (var channel = 0, channelCount = this.meter.channels; channel < channelCount; channel++){
		var db = this.meter.getDb(channel);
		if (db < -120){
			db = "-inf"
		} else {
			db = db.toFixed(1);
		}
		this.bars[channel].setLabel(db);
	}
}
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
}///////////////////////////////////////////////////////////////////////////////
//
//	TRANSPORT
//
//	basic controls for the transport
//	start/stop/pause, tempo, time signature
///////////////////////////////////////////////////////////////////////////////

Tone.GUI.Transport = function(container, transport){
	Tone.GUI.call(this, container);

	this.setClass(this.element, "transport");

	this.transport = transport;
	this.transport.setInterval(this.updateProgress, "16n", this);

	this.start = new Tone.GUI.Button(this.element, this.startClicked.bind(this), "play");

	this.progress = this.createElement("input", "progress");
	this.progress.type = "text";
	this.progress.value = "0:0:0";
	this.appendChild(this.element, this.progress);
}

Tone.extend(Tone.GUI.Transport, Tone.GUI);

Tone.GUI.Transport.prototype.startClicked = function(){
	if (this.transport.state === "playing"){
		this.transport.stop();
		this.start.setText("play");
	} else {
		this.transport.start();
		this.start.setText("stop");
	}
}

Tone.GUI.Transport.prototype.updateProgress = function(time){
	this.progress.value = this.transport.getProgress();
}

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