define(["Tone/core/Tone", "Tone/signal/Signal", "Tone/signal/Threshold"], function(Tone){

	"use strict";

	/**
	 *  @class  When the gate is set to 0, the input signal does not pass through to the output. 
	 *          If the gate is set to 1, the input signal passes through.
	 *          the gate is initially closed.
	 *
	 *  @constructor
	 *  @extends {Tone}
	 */
	Tone.Switch = function(){
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
	};

	Tone.extend(Tone.Switch);

	/**
	 *  open the switch at a specific time
	 *
	 *  @param {Tone.Time} time the time when the switch will be open
	 */
	Tone.Switch.prototype.open = function(time){
		this.gate.setValueAtTime(1, this.toSeconds(time));
	}; 

	/**
	 *  close the switch at a specific time
	 *
	 *  @param {Tone.Time} time the time when the switch will be open
	 */
	Tone.Switch.prototype.close = function(time){
		this.gate.setValueAtTime(0, this.toSeconds(time));
	}; 

	/**
	 *  borrows the method from {@link Tone.Signal}
	 *  
	 *  @function
	 */
	Tone.Switch.prototype.connect = Tone.Signal.prototype.connect;

	/**
	 *  clean up
	 */
	Tone.Switch.prototype.dispose = function(){
		Tone.prototype.dispose.call(this);
		this.gate.dispose();
		this._thresh.dispose();
		this.gate = null;
		this._thresh = null;
	}; 

	return Tone.Switch;
});