define(["Tone/core/Tone", "Tone/signal/SignalBase", "Tone/signal/GreaterThan"], function(Tone){

	"use strict";

	/**
	 *  @class  When the gate is set to 0, the input signal does not pass through to the output. 
	 *          If the gate is set to 1, the input signal passes through.
	 *          the gate is initially closed.
	 *
	 *  @constructor
	 *  @extends {Tone.SignalBase}
	 *  @param {Boolean} [open=false] If the gate is initially open or closed.
	 *  @example
	 * var sigSwitch = new Tone.Switch();
	 * var signal = new Tone.Signal(2).connect(sigSwitch);
	 * //initially no output from sigSwitch
	 * sigSwitch.gate.value = 1;
	 * //open the switch and allow the signal through
	 * //the output of sigSwitch is now 2. 
	 */
	Tone.Switch = function(open){

		open = this.defaultArg(open, false);

		Tone.call(this);

		/**
		 *  The control signal for the switch.
		 *  When this value is 0, the input signal will NOT pass through,
		 *  when it is high (1), the input signal will pass through.
		 *  
		 *  @type {Number}
		 *  @signal
		 */
		this.gate = new Tone.Signal(0);
		this._readOnly("gate");

		/**
		 *  thresh the control signal to either 0 or 1
		 *  @type {Tone.GreaterThan}
		 *  @private
		 */
		this._thresh = new Tone.GreaterThan(0.5);

		this.input.connect(this.output);
		this.gate.chain(this._thresh, this.output.gain);

		//initially open
		if (open){
			this.open();
		}
	};

	Tone.extend(Tone.Switch, Tone.SignalBase);

	/**
	 *  Open the switch at a specific time. 
	 *
	 *  @param {Time} [time=now] The time when the switch will be open. 
	 *  @returns {Tone.Switch} this
	 *  @example
	 *  //open the switch to let the signal through
	 *  sigSwitch.open();
	 */
	Tone.Switch.prototype.open = function(time){
		this.gate.setValueAtTime(1, this.toSeconds(time));
		return this;
	}; 

	/**
	 *  Close the switch at a specific time. 
	 *
	 *  @param {Time} [time=now] The time when the switch will be closed.
	 *  @returns {Tone.Switch} this
	 *  @example
	 *  //close the switch a half second from now
	 *  sigSwitch.close("+0.5");
	 */
	Tone.Switch.prototype.close = function(time){
		this.gate.setValueAtTime(0, this.toSeconds(time));
		return this;
	}; 

	/**
	 *  Clean up.
	 *  @returns {Tone.Switch} this
	 */
	Tone.Switch.prototype.dispose = function(){
		Tone.prototype.dispose.call(this);
		this._writable("gate");
		this.gate.dispose();
		this.gate = null;
		this._thresh.dispose();
		this._thresh = null;
		return this;
	}; 

	return Tone.Switch;
});