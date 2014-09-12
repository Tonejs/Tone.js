define(["Tone/core/Tone", "Tone/signal/Equal", "Tone/signal/Signal"], function(Tone){

	"use strict";

	/**
	 *  @class Select between any number of inputs, sending the one 
	 *         selected by the gate signal to the output
	 *
	 *
	 *  @constructor
	 *  @extends {Tone}
	 *  @param {number=} [sourceCount=2] the number of inputs the switch accepts
	 */
	Tone.Select = function(sourceCount){

		sourceCount = this.defaultArg(sourceCount, 2);

		/**
		 *  the array of inputs
		 *  @type {Array<SelectGate>}
		 */
		this.input = new Array(sourceCount);

		/**
		 *  the output
		 *  @type {GainNode}
		 */
		this.output = this.context.createGain();

		/**
		 *  the control signal
		 *  @type {Tone.Signal}
		 */
		this.gate = new Tone.Signal(0);

		//make all the inputs and connect them
		for (var i = 0; i < sourceCount; i++){
			var switchGate = new SelectGate(i);
			this.input[i] = switchGate;
			this.gate.connect(switchGate.selecter);
			switchGate.connect(this.output);
		}
	};

	Tone.extend(Tone.Select);

	/**
	 *  open one of the inputs and close the other
	 *  @param {number=} [which=0] open one of the gates (closes the other)
	 *  @param {Tone.Time} time the time when the switch will open
	 */
	Tone.Select.prototype.select = function(which, time){
		//make sure it's an integer
		which = Math.floor(which);
		this.gate.setValueAtTime(which, this.toSeconds(time));
	};

	/**
	 *  borrows the method from {@link Tone.Signal}
	 *  
	 *  @function
	 */
	Tone.Select.prototype.connect = Tone.Signal.prototype.connect;

	/**
	 *  dispose method
	 */
	Tone.Select.prototype.dispose = function(){
		this.gate.dispose();
		for (var i = 0; i < this.input.length; i++){
			this.input[i].dispose();
			this.input[i] = null;
		}
		Tone.prototype.dispose.call(this);
		this.gate = null;
	}; 

	////////////START HELPER////////////

	/**
	 *  helper class for Tone.Select representing a single gate
	 *  @constructor
	 *  @extends {Tone}
	 *  @internal only used by Tone.Select
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