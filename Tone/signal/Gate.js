define(["Tone/core/Tone", "Tone/signal/Signal", "Tone/signal/Threshold"], function(Tone){

	/**
	 *  When the gate is set to 0, the input signal does not pass through to the output. 
	 *  If the gate is set to 1, the input signal passes through
	 *
	 *  the switch will initially be closed.
	 *
	 *  @constructor
	 *  @extends {Tone}
	 */
	Tone.Gate = function(){
		Tone.call(this);

		/**
		 *  the control signal for the switch
		 *  when this value is 0, the input signal will not pass through,
		 *  when it is high (1), the input signal will pass through.
		 *  
		 *  @type {Tone.Signal}
		 */
		this.gate = new Tone.Signal(0);

		/**
		 *  thresh the control signal
		 *  @type {Tone.Threshold}
		 *  @private
		 */
		this._thresh = new Tone.Threshold(0.5);

		this.input.connect(this.output);
		this.chain(this.gate, this._thresh, this.output.gain);
		this.output.gain.value = 0;
	};

	Tone.extend(Tone.Gate);

	/**
	 *  open the switch at a specific time
	 *
	 *  @param {Tone.Time} time the time when the switch will be open
	 */
	Tone.Gate.prototype.open = function(time){
		this.gate.setValueAtTime(1, this.toSeconds(time));
	}; 

	/**
	 *  close the switch at a specific time
	 *
	 *  @param {Tone.Time} time the time when the switch will be open
	 */
	Tone.Gate.prototype.close = function(time){
		this.gate.setValueAtTime(0, this.toSeconds(time));
	}; 

	/**
	 *  clean up
	 */
	Tone.Gate.prototype.dispose = function(){
		this.gate.dispose();
		this._thresh.dispose();
		this.input.disconnect();
		this.output.disconnect();
		this.signal = null;
		this._thresh = null;
		this.input = null;
		this.output = null;
	}; 

	return Tone.Gate;
});