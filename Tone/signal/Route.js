define(["Tone/core/Tone", "Tone/signal/Equal", "Tone/signal/Signal"], function(Tone){

	"use strict";

	/**
	 *  @class Route a single input to the specified output
	 *
	 *
	 *  @constructor
	 *  @extends {Tone}
	 *  @param {number=} [outputCount=2] the number of inputs the switch accepts
	 */
	Tone.Route = function(outputCount){

		outputCount = this.defaultArg(outputCount, 2);

		/**
		 *  the array of outputs
		 *  @type {Array<RouteGate>}
		 */
		this.output = new Array(outputCount);

		/**
		 *  a single input
		 *  @type {GainNode}
		 */
		this.input = this.context.createGain();

		/**
		 *  the control signal
		 *  @type {Tone.Signal}
		 */
		this.gate = new Tone.Signal(0);

		//make all the inputs and connect them
		for (var i = 0; i < outputCount; i++){
			var routeGate = new RouteGate(i);
			this.output[i] = routeGate;
			this.gate.connect(routeGate.selecter);
			this.input.connect(routeGate);
		}
	};

	Tone.extend(Tone.Route);

	/**
	 *  routes the signal to one of the outputs and close the others
	 *  @param {number=} [which=0] open one of the gates (closes the other)
	 *  @param {Tone.Time} time the time when the switch will open
	 */
	Tone.Route.prototype.select = function(which, time){
		//make sure it's an integer
		which = Math.floor(which);
		this.gate.setValueAtTime(which, this.toSeconds(time));
	};

	/**
	 *  borrows the method from {@link Tone.Signal}
	 *  
	 *  @function
	 */
	Tone.Route.prototype.connect = Tone.Signal.prototype.connect;

	/**
	 *  dispose method
	 */
	Tone.Route.prototype.dispose = function(){
		this.gate.dispose();
		for (var i = 0; i < this.output.length; i++){
			this.output[i].dispose();
			this.output[i] = null;
		}
		Tone.prototype.dispose.call(this);
		this.gate = null;
	}; 

	////////////START HELPER////////////

	/**
	 *  helper class for Tone.Route representing a single gate
	 *  @constructor
	 *  @extends {Tone}
	 *  @internal only used by Tone.Route
	 */
	var RouteGate = function(num){

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

	Tone.extend(RouteGate);

	/**
	 *  clean up
	 *  @private
	 */
	RouteGate.prototype.dispose = function(){
		Tone.prototype.dispose.call(this);
		this.selecter.dispose();
		this.gate.disconnect();
		this.selecter = null;
		this.gate = null;
	};

	////////////END HELPER////////////

	//return Tone.Route
	return Tone.Route;
});