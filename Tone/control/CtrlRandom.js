define(["Tone/core/Tone", "Tone/core/Type"], function (Tone) {

	"use strict";

	/**
	 *  @class  Choose a random value.
	 *  @extends {Tone}
	 *  @example
	 * var randomWalk = new Tone.CtrlRandom({
	 * 	"min" : 0,
	 * 	"max" : 10,
	 * 	"integer" : true
	 * });
	 * randomWalk.eval();
	 *
	 *  @param {Number|Time=} min The minimum return value.
	 *  @param {Number|Time=} max The maximum return value.
	 */
	Tone.CtrlRandom = function(){

		var options = this.optionsObject(arguments, ["min", "max"], Tone.CtrlRandom.defaults);

		/**
		 *  The minimum return value
		 *  @type  {Number|Time}
		 */
		this.min = options.min;

		/**
		 *  The maximum return value
		 *  @type  {Number|Time}
		 */
		this.max = options.max;

		/**
		 *  If the return value should be an integer
		 *  @type  {Boolean}
		 */
		this.integer = options.integer;
	};

	Tone.extend(Tone.CtrlRandom);

	/**
	 *  The defaults
	 *  @const
	 *  @type  {Object}
	 */
	Tone.CtrlRandom.defaults = {
		"min" : 0,
		"max" : 1,
		"integer" : false
	};

	/**
	 *  Return a random value between min and max. 
	 *  @readOnly
	 *  @memberOf Tone.CtrlRandom#
	 *  @type {*}
	 *  @name value
	 */
	Object.defineProperty(Tone.CtrlRandom.prototype, "value", {
		get : function(){
			var min = this.toSeconds(this.min);
			var max = this.toSeconds(this.max);
			var rand = Math.random(); 
			var val =  rand * min + (1 - rand) * max;
			if (this.integer){
				val = Math.floor(val);
			}
			return val;
		}
	});

	return Tone.CtrlRandom;
});