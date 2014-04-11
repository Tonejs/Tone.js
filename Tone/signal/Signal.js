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

	//@returns {number}
	Tone.Signal.prototype.getValue = function(){
		return this.scalar.gain.value;
	}

	//@param {number} val
	Tone.Signal.prototype.setValue = function(val){
		this.scalar.gain.value = val;
	}

	//all of the automation curves are available
	//@param {number} value
	//@param {Tone.Timing} time
	Tone.Signal.prototype.setValueAtTime = function(value, time){

		this.scalar.gain.setValueAtTime(value, this.toSeconds(time));
	}

	//@param {number} value
	//@param {Tone.Timing} endTime
	Tone.Signal.prototype.linearRampToValueAtTime = function(value, endTime){
		this.scalar.gain.linearRampToValueAtTime(value, this.toSeconds(endTime));
	}

	//@param {number} value
	//@param {Tone.Timing} endTime
	Tone.Signal.prototype.exponentialRampToValueAtTime = function(value, endTime){
		this.scalar.gain.exponentialRampToValueAtTime(value, this.toSeconds(endTime));
	}

	//@param {number} value
	//@param {Tone.Timing} startTime
	//@param {number} timeConstant
	Tone.Signal.prototype.setTargetAtTime = function(target, startTime, timeConstant){
		this.scalar.gain.setTargetAtTime(target, this.toSeconds(startTime), timeConstant);
	}

	//@param {number} value
	//@param {Tone.Timing} startTime
	//@param {Tone.Timing} duration
	Tone.Signal.prototype.setValueCurveAtTime = function(values, startTime, duration){
		this.scalar.gain.setValueCurveAtTime(values, this.toSeconds(startTime), this.toSeconds(duration));
	}

	//@param {Tone.Timing} startTime
	Tone.Signal.prototype.cancelScheduledValues = function(startTime){
		this.scalar.gain.cancelScheduledValues(this.toSeconds(startTime));
	}

	return Tone.Signal;
})