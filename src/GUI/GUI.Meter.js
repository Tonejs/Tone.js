
//@param {Element} container
//@param {AudioUnit.Meter} meter
//@param {string=} label
//@param {number=} segments
AudioUnit.GUI.Meter = function(container, meter, label, segments){
	AudioUnit.GUI.call(this);

	//components
	this.meter = meter;
	this.element = this.createElement();
	this.bars = new Array(this.meter.channels);
	this.label = this.createElement();

	//add the bars
	for (var i = 0; i < this.meter.channels; i++){
		var bar = new AudioUnit.GUI.Bar(this.element, segments);
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

AudioUnit.extend(AudioUnit.GUI.Meter, AudioUnit.GUI);

AudioUnit.GUI.Meter.prototype.update = function(){
	for (var channel = 0, channelCount = this.meter.channels; channel < channelCount; channel++){
		var volume = this.meter.getLevel(channel);
		this.bars[channel].setLevel(this.gainToLogScale(volume));
		//also check if it's clipped
	}
}

AudioUnit.GUI.Meter.prototype.labelUpdate = function(){
	for (var channel = 0, channelCount = this.meter.channels; channel < channelCount; channel++){
		var db = this.meter.getDb(channel);
		if (db < -100){
			db = "-inf"
		} else {
			db = db.toFixed(1);
		}
		this.bars[channel].setLabel(db);
	}
}
