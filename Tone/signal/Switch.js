define(["Tone/core/Tone", "Tone/signal/Gate", "Tone/signal/EqualZero", "Tone/signal/Signal"], function(Tone){

	/**
	 *  @class A single pole, double throw switch. 
	 *
	 *  Pass in two Nodes. When the gate is set to 0, only the first Node
	 *  passes through the output, and when it is set to 1, only the second is passed. 
	 *
	 *
	 *  @constructor
	 *  @extends {Tone}
	 *  @param {AudioNode | Tone} source0 when gate is 0, this source is passed to the output
	 *  @param {AudioNode | Tone} source1 when gate is 1, this source is passed to the output
	 */
	Tone.Switch = function(source0, source1){
		/**
		 *  the gate on source0
		 *  @type {Tone.Gate}
		 *  @private
		 */
		this._gate0 = this.context.createGain();

		/**
		 *  the gate on source1
		 *  @type {Tone.Gate}
		 *  @private
		 */
		this._gate1 = this.context.createGain();

		/**
		 *  the output
		 *  @type {GainNode}
		 */
		this.output = this.context.createGain();

		/**
		 *  the gate control signal
		 */
		this.gate = new Tone.Signal(0);

		/**
		 *  a logical not, when the gate is 0, this outputs 1
		 *  @type {Tone}
		 *  @private
		 */
		this._not = new Tone.EqualZero();

		/**
		 *  thresh the control signal
		 *  @type {Tone.Threshold}
		 *  @private
		 */
		this._thresh = new Tone.Threshold(0.5);

		
		//connect the audio paths through the gates
		this.chain(source0, this._gate0, this.output);
		this.chain(source1, this._gate1, this.output);
		//threshold the gate signal
		this.gate.connect(this._thresh);
		//connect it to the control points
		this._thresh.connect(this._gate0.gain);
		this.chain(this._thresh, this._not, this._gate1.gain);
		//zero out the gains
		this._gate0.gain.value = 0;
		this._gate1.gain.value = 0;
	};

	Tone.extend(Tone.Switch);

	/**
	 *  open one of the inputs and close the other
	 *  @param {number=} [which=0] open one of the gates (closes the other)
	 *  @param {Tone.Time} time the time when the switch will open
	 */
	Tone.Switch.prototype.open = function(which, time){
		if (which < 1){
			which = 0;
		} else if (which > 1){
			which = 1;
		}
		this.gate.setValueAtTime(which, this.toSeconds(time));
	};

	/**
	 *  dispose method
	 */
	Tone.Switch.prototype.dispose = function(){
		this.output.disconnect();
		this._gate0.disconnect();
		this._gate1.disconnect();
		this.gate.dispose();
		this._not.dispose();
		this.gate = null;
		this.output = null;
		this._not = null;
		this._gate0 = null;
		this._gate1 = null;
	}; 

	return Tone.Switch;
});