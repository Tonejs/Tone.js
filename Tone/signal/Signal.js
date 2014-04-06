///////////////////////////////////////////////////////////////////////////////
//
//  SIGNAL
//
//	audio-rate value
//	useful for controlling AudioParams
///////////////////////////////////////////////////////////////////////////////

define(["Tone/core/Tone"], function(Tone){
	
	//@param {number=} value
	Tone.Signal = function(value){
		Tone.call(this);

		//components
		this.signal = this.context.createWaveShaper();
		this.scalar = this.context.createGain();
		//generator to drive values
		this.generator = this.context.createOscillator();

		//connections
		this.chain(this.generator, this.signal, this.scalar, this.output);
		//pass values through
		this.input.connect(this.output);

		//setup
		this.generator.start(0);
		this._signalCurve();
		this.setValue(this.defaultArg(value, 0));

	}

	Tone.extend(Tone.Signal);

	//generates a constant output of 1
	Tone.Signal.prototype._signalCurve = function(){
		var len = 8;
		var curve = new Float32Array(len);
		for (var i = 0; i < len; i++){
			//all inputs produce the output value
			curve[i] = 1;
		}
		//console.log(curve);
		this.signal.curve = curve;
	}

	Tone.Signal.prototype.getValue = function(val){
		return this.scalar.gain.value;
	}

	Tone.Signal.prototype.setValue = function(val){
		this.scalar.gain.value = val;
	}

	//all of the automation curves are available
	Tone.Signal.prototype.setValueAtTime = function(value, time){
		this.scalar.gain.setValueAtTime(value, time);
	}

	Tone.Signal.prototype.linearRampToValueAtTime = function(value, endTime){
		this.scalar.gain.linearRampToValueAtTime(value, endTime);
	}

	Tone.Signal.prototype.exponentialRampToValueAtTime = function(value, endTime){
		this.scalar.gain.exponentialRampToValueAtTime(value, endTime);
	}

	Tone.Signal.prototype.setTargetAtTime = function(target, startTime, timeConstant){
		this.scalar.gain.setTargetAtTime(target, startTime, timeConstant);
	}

	Tone.Signal.prototype.setValueCurveAtTime = function(values, startTime, duration){
		this.scalar.gain.setValueCurveAtTime(values, startTime, duration);
	}

	Tone.Signal.prototype.cancelScheduledValues = function(startTime){
		this.scalar.gain.cancelScheduledValues(startTime);
	}

	return Tone.Signal;
})