define(["Tone/core/Tone", "Tone/signal/SignalBase", "Tone/signal/GreaterThan"], function(Tone){

	"use strict";

	/**
	 *  @class  When the gate is set to 0, the input signal does not pass through to the output. 
	 *          If the gate is set to 1, the input signal passes through.
	 *          the gate is initially closed.
	 *
	 *  @constructor
	 *  @extends {Tone.SignalBase}
	 *  @example
	 *  var sigSwitch = new Tone.Switch();
	 *  var signal = new Tone.Signal(2).connect(sigSwitch);
	 *  //initially no output from sigSwitch
	 *  sigSwitch.gate.value = 1;
	 *  //open the switch and allow the signal through
	 *  //the output of sigSwitch is now 2. 
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
		 *  thresh the control signal to either 0 or 1
		 *  @type {Tone.GreaterThan}
		 *  @private
		 */
		this._thresh = new Tone.GreaterThan(0.5);

		this.input.connect(this.output);
		this.gate.chain(this._thresh, this.output.gain);
	};

	Tone.extend(Tone.Switch, Tone.SignalBase);

	/**
	 *  open the switch at a specific time
	 *
	 *  @param {Tone.Time=} time the time when the switch will be open
	 *  @returns {Tone.Switch} `this`
	 *  @example
	 *  //open the switch to let the signal through
	 *  sigSwitch.open();
	 */
	Tone.Switch.prototype.open = function(time){
		this.gate.setValueAtTime(1, this.toSeconds(time));
		return this;
	}; 

	/**
	 *  close the switch at a specific time
	 *
	 *  @param {Tone.Time} time the time when the switch will be open
	 *  @returns {Tone.Switch} `this`
	 *  @example
	 *  //close the switch a half second from now
	 *  sigSwitch.close("+0.5");
	 */
	Tone.Switch.prototype.close = function(time){
		this.gate.setValueAtTime(0, this.toSeconds(time));
		return this;
	}; 

	/**
	 *  clean up
	 *  @returns {Tone.Switch} `this`
	 */
	Tone.Switch.prototype.dispose = function(){
		Tone.prototype.dispose.call(this);
		this.gate.dispose();
		this._thresh.dispose();
		this.gate = null;
		this._thresh = null;
		return this;
	}; 

	return Tone.Switch;
});