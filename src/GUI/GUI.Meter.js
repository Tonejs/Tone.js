
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
