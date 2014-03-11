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
			var toUnit = units[i];
			if (toUnit.input && toUnit.input instanceof GainNode){
				currentUnit.connect(toUnit.input);
			} else {
				currentUnit.connect(toUnit);
			}
			currentUnit = toUnit;
		}
	}
}

//set the output volume
WebAudio.Unit.prototype.setVolume = function(vol){
	this.output.gain.value = vol;
}

//fade the output volume
//@param {number} value
//@param {number=} duration (in seconds)
WebAudio.Unit.prototype.fadeTo = function(value, duration){
	this.defaultArgument(duration, WebAudio.fadeTime);
	this.rampToValue(this.output.gain, value, duration);
}


//tear down a node
WebAudio.Unit.prototype.tearDown = function(){
	//go through all of the attributes, if any of them has a disconnect function, call it	
}

///////////////////////////////////////////////////////////////////////////////
//	UTILITIES / HELPERS
///////////////////////////////////////////////////////////////////////////////

//immediately ramps to value linearly
//@param {AudioParam} audioParam
//@param {number} value
//@param {number=} duration (in seconds)
WebAudio.Unit.prototype.rampToValue = function(audioParam, value, duration){
	var currentValue = audioParam.value;
	var now = WebAudio.now;
	duration = this.defaultArgument(duration, WebAudio.fadeTime);
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

//@param {number} percent (0-1)
//@returns {number} the equal power gain
//good for cross fades
WebAudio.Unit.prototype.equalPowerGain = function(percent){
	return Math.sin((percent) * 0.5*Math.PI);
}

//@param {number} db
//@returns {number} gain
WebAudio.Unit.prototype.dbToGain = function(db) {
	return Math.pow(2, db / 6);
}

//@param {number} gain
//@returns {number} db
WebAudio.Unit.prototype.gainToDb = function(gain) {
	return  20 * (Math.log(gain) / Math.LN10);
}

///////////////////////////////////////////////////////////////////////////////
//	STATIC
///////////////////////////////////////////////////////////////////////////////

//extends WebAudio.Unit with the given class
//@param {function} Class
WebAudio.Unit.extend = function(Class){
	Class.prototype = new WebAudio.Unit();
	Class.prototype.constructor = Class;
}