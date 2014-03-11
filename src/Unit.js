///////////////////////////////////////////////////////////////////////////////
//
//	WEB AUDIO UNIT
//
///////////////////////////////////////////////////////////////////////////////

WebAudio.Unit = function(){
	this.input = WebAudio.createGain();
	this.output = WebAudio.createGain();
}

WebAudio.Unit.prototype.connect = function(unit){
	if (unit.input && unit.input instanceof GainNode){
		this.output.connect(unit.input);
	} else {
		this.output.connect(unit);
	}
}

//connect together an array of units in series
WebAudio.Unit.prototype.chain = function(units){
	if (units.length > 1){
		var currentUnit = units[0];
		for (var i = 1; i < units.length; i++){
			currentUnit.connect(units[i]);
			currentUnit = units[i];
		}
	}
}

//set the output volume
WebAudio.Unit.prototype.setVolume = function(vol){
	this.output.gain.value = vol;
}

//fade the output volume
WebAudio.Unit.prototype.fadeTo = function(value, duration){
	this.rampToValue(this.output.gain, value, duration);
}

//immediately ramps to value linearly
WebAudio.Unit.prototype.rampToValue = function(audioParam, value, duration){
	var currentValue = audioParam.value;
	var now = WebAudio.now;
	audioParam.setValueAtTime(currentValue, now);
	audioParam.linearRampToValueAtTime(value, now + duration);
}

//immediately ramps to value exponentially
WebAudio.Unit.prototype.exponentialRampToValue = function(audioParam, value, duration){
	var currentValue = audioParam.value;
	var now = WebAudio.now;
	audioParam.setValueAtTime(currentValue, now);
	audioParam.exponentialRampToValueAtTime(value, now + duration);
}

//if the given argument is undefined, go with the default
WebAudio.Unit.prototype.defaultArgument = function(given, fallback){
	return typeof(given) !== 'undefined' ? given : fallback;
}

//tear down a node
WebAudio.Unit.prototype.tearDown = function(){
	//go through all of the attributes, if any of them has a disconnect function, call it
	
}

