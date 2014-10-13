define(["Tone/core/Tone", "Tone/signal/Select", "Tone/signal/Equal"], function(Tone){

	"use strict";

	/**
	 *  @class IfThenElse has three inputs. When the first input (if) is true (i.e. === 1), 
	 *         then it will pass the second input (then) through to the output, otherwise, 
	 *         if it's not true (i.e. === 0) then it will pass the third input (else) 
	 *         through to the output. 
	 *
	 *  @extends {Tone}
	 *  @constructor
	 */
	Tone.IfThenElse = function(){

		/**
		 *  the inputs
		 *  @type {Array}
		 */
		this.input = new Array(3);

		/**
		 *  the selector node which is responsible for the routing
		 *  @type {Tone.Select}
		 *  @private
		 */
		this._selector = new Tone.Select(2);

		/**
		 *  the output
		 *  @type {Tone.Select}
		 */
		this.output = this._selector;

		//the input mapping
		this.if = this.input[0] = this._selector.gate;
		this.then = this.input[1] = this._selector.input[1];
		this.else = this.input[2] = this._selector.input[0];
	};

	Tone.extend(Tone.IfThenElse);

	/**
	 *  clean up
	 */
	Tone.IfThenElse.prototype.dispose = function(){
		Tone.prototype.dispose.call(this);
		this._selector.dispose();
		this._selector = null;
		this.if = null;
		this.then = null;
		this.else = null;
	};

	return Tone.IfThenElse;
});