define(["Tone/core/Tone", "Tone/signal/Gate", "Tone/signal/Equal", "Tone/signal/Signal"], function(Tone){

	/**
	 *  @class Switch between any number of inputs, sending the one 
	 *         selected by the gate signal to the output
	 *
	 *
	 *  @constructor
	 *  @extends {Tone}
	 *  @param {number=} [sourceCount=2] the number of inputs the switch accepts
	 */
	Tone.Switch = function(sourceCount){

		sourceCount = this.defaultArg(sourceCount, 2);

		/**
		 *  the array of inputs
		 *  @type {Array<SwitchGate>}
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
			var switchGate = new SwitchGate(i);
			this.input[i] = switchGate;
			this.gate.connect(switchGate.selecter);
			switchGate.connect(this.output);
		}
	};

	Tone.extend(Tone.Switch);

	/**
	 *  open one of the inputs and close the other
	 *  @param {number=} [which=0] open one of the gates (closes the other)
	 *  @param {Tone.Time} time the time when the switch will open
	 */
	Tone.Switch.prototype.open = function(which, time){
		//make sure it's an integer
		which = Math.floor(which);
		this.gate.setValueAtTime(which, this.toSeconds(time));
	};

	/**
	 *  dispose method
	 */
	Tone.Switch.prototype.dispose = function(){
		this.output.disconnect();
		this.gate.dispose();
		for (var i = 0; i < this.input.length; i++){
			this.input[i].dispose();
			this.input[i] = null;
		}
		this.gate = null;
		this.output = null;
	}; 

	////////////START HELPER////////////

	/**
	 *  helper class for Tone.Switch representing a single gate
	 *  @constructor
	 *  @extends {Tone}
	 *  @internal only used by Tone.Switch
	 */
	var SwitchGate = function(num){

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
		this.gate.gain.value = 0;
	};

	Tone.extend(SwitchGate);

	/**
	 *  clean up
	 *  @private
	 */
	SwitchGate.prototype.dispose = function(){
		this.selecter.dispose();
		this.gate.disconnect();
		this.selecter = null;
		this.gate = null;
	};

	////////////END HELPER////////////

	//return Tone.Switch
	return Tone.Switch;
});