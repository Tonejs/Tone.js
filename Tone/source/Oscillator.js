///////////////////////////////////////////////////////////////////////////////
//
//  OSCILLATOR
//
//	just an oscillator, 
//	but starting and stopping is easier than the native version
///////////////////////////////////////////////////////////////////////////////

define(["Tone/core/Tone"], function(Tone){

	Tone.Oscillator = function(freq, type){
		Tone.call(this);

		this.started = false;

		//components
		this.oscillator = this.context.createOscillator();
		this.oscillator.frequency.value = this.defaultArg(freq, 440);
		this.oscillator.type = this.defaultArg(type, "sine");
		//connections
		this.chain(this.oscillator, this.output);
	}

	Tone.extend(Tone.Oscillator);

	//@param {number=} time
	Tone.Oscillator.prototype.start = function(time){
		if (!this.started){
			var freq = this.oscillator.frequency.value;
			var type = this.oscillator.type;
			var detune = this.oscillator.frequency.value;
			this.oscillator = this.context.createOscillator();
			this.oscillator.frequency.value = freq;
			this.oscillator.type = type;
			this.oscillator.detune.value = detune;
			this.oscillator.connect(this.output);
			this.started = true;
			time = this.defaultArg(time, this.now());
			this.oscillator.start(time);
		}
	}

	//@param {number=} time
	Tone.Oscillator.prototype.stop = function(time){
		if (this.started){
			time = this.defaultArg(time, this.now());
			this.oscillator.stop(time);
			this.started = false;
		}
	}

	//@param {number} val
	//@param {Tone.Timing=} rampTime
	Tone.Oscillator.prototype.setFrequency = function(val, rampTime){
		rampTime = this.defaultArg(rampTime, 0);
		this.oscillator.frequency.linearRampToValueAtTime(this.toFrequency(val), this.toSeconds(rampTime));
	}

	//@param {string} type
	Tone.Oscillator.prototype.setType = function(type){
		this.oscillator.type = type;
	}

	return Tone.Oscillator;
});