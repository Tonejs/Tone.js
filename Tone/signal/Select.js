define(["Tone/core/Tone", "Tone/signal/Equal", "Tone/signal/Signal"], function(Tone){

	"use strict";

	/**
	 *  @class Select between any number of inputs, sending the one 
	 *         selected by the gate signal to the output
	 *
	 *  @constructor
	 *  @extends {Tone.SignalBase}
	 *  @param {number} [sourceCount=2] the number of inputs the switch accepts
	 *  @example
	 * var sel = new Tone.Select(2);
	 * var sigA = new Tone.Signal(10).connect(sel, 0, 0);
	 * var sigB = new Tone.Signal(20).connect(sel, 0, 1);
	 * sel.gate.value = 0;
	 * //sel outputs 10 (the value of sigA);
	 * sel.gate.value = 1;
	 * //sel outputs 20 (the value of sigB);
	 */
	Tone.Select = function(sourceCount){

		sourceCount = this.defaultArg(sourceCount, 2);

		Tone.call(this, sourceCount, 1);

		/**
		 *  the control signal
		 *  @type {Number}
		 *  @signal
		 */
		this.gate = new Tone.Signal(0);
		this._readOnly("gate");

		//make all the inputs and connect them
		for (var i = 0; i < sourceCount; i++){
			var switchGate = new SelectGate(i);
			this.input[i] = switchGate;
			this.gate.connect(switchGate.selecter);
			switchGate.connect(this.output);
		}
	};

	Tone.extend(Tone.Select, Tone.SignalBase);

	/**
	 *  Open a specific input and close the others.
	 *  @param {number} which The gate to open. 
	 *  @param {Time} [time=now] The time when the switch will open
	 *  @returns {Tone.Select} this
	 *  @example
	 * //open input 1 in a half second from now
	 * sel.select(1, "+0.5");
	 */
	Tone.Select.prototype.select = function(which, time){
		//make sure it's an integer
		which = Math.floor(which);
		this.gate.setValueAtTime(which, this.toSeconds(time));
		return this;
	};

	/**
	 *  Clean up.
	 *  @returns {Tone.Select} this
	 */
	Tone.Select.prototype.dispose = function(){
		this._writable("gate");
		this.gate.dispose();
		this.gate = null;
		for (var i = 0; i < this.input.length; i++){
			this.input[i].dispose();
			this.input[i] = null;
		}
		Tone.prototype.dispose.call(this);
		return this;
	}; 

	////////////START HELPER////////////

	/**
	 *  helper class for Tone.Select representing a single gate
	 *  @constructor
	 *  @extends {Tone}
	 *  @private
	 */
	var SelectGate = function(num){

		/**
		 *  the selector
		 *  @type {Tone.Equal}
		 */
		this.selecter = new Tone.Equal(num);

		/**
		 *  the gate
		 *  @type {GainNode}
		 */
		this.gate = this.input = this.output = this.context.createGain();

		//connect the selecter to the gate gain
		this.selecter.connect(this.gate.gain);
	};

	Tone.extend(SelectGate);

	/**
	 *  clean up
	 *  @private
	 */
	SelectGate.prototype.dispose = function(){
		Tone.prototype.dispose.call(this);
		this.selecter.dispose();
		this.gate.disconnect();
		this.selecter = null;
		this.gate = null;
	};

	////////////END HELPER////////////

	//return Tone.Select
	return Tone.Select;
});