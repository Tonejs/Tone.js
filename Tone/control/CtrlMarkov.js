define(["../core/Tone"], function(Tone){

	"use strict";

	/**
	 *  @class Tone.CtrlMarkov represents a Markov Chain where each call
	 *         to Tone.CtrlMarkov.next will move to the next state. If the next
	 *         state choice is an array, the next state is chosen randomly with
	 *         even probability for all of the choices. For a weighted probability
	 *         of the next choices, pass in an object with "state" and "probability" attributes. 
	 *         The probabilities will be normalized and then chosen. If no next options
	 *         are given for the current state, the state will stay there. 
	 *  @extends {Tone}
	 *  @example
	 * var chain = new Tone.CtrlMarkov({
	 * 	"beginning" : ["end", "middle"],
	 * 	"middle" : "end"
	 * });
	 * chain.value = "beginning";
	 * chain.next(); //returns "end" or "middle" with 50% probability
	 *
	 *  @example
	 * var chain = new Tone.CtrlMarkov({
	 * 	"beginning" : [{"value" : "end", "probability" : 0.8}, 
	 * 					{"value" : "middle", "probability" : 0.2}],
	 * 	"middle" : "end"
	 * });
	 * chain.value = "beginning";
	 * chain.next(); //returns "end" with 80% probability or "middle" with 20%.
	 *  @param {Object} values An object with the state names as the keys
	 *                         and the next state(s) as the values. 
	 */
	Tone.CtrlMarkov = function(values, initial){

		Tone.call(this);

		/**
		 *  The Markov values with states as the keys
		 *  and next state(s) as the values. 
		 *  @type {Object}
		 */
		this.values = Tone.defaultArg(values, {});
		
		/**
		 *  The current state of the Markov values. The next
		 *  state will be evaluated and returned when Tone.CtrlMarkov.next
		 *  is invoked.
		 *  @type {String}
		 */
		this.value = Tone.defaultArg(initial, Object.keys(this.values)[0]);
	};

	Tone.extend(Tone.CtrlMarkov);

	/**
	 *  Returns the next state of the Markov values. 
	 *  @return  {String}
	 */
	Tone.CtrlMarkov.prototype.next = function(){
		if (this.values.hasOwnProperty(this.value)){
			var next = this.values[this.value];
			if (Tone.isArray(next)){
				var distribution = this._getProbDistribution(next);
				var rand = Math.random();
				var total = 0;
				for (var i = 0; i < distribution.length; i++){
					var dist = distribution[i];
					if (rand > total && rand < total + dist){
						var chosen = next[i];
						if (Tone.isObject(chosen)){
							this.value = chosen.value;
						} else {
							this.value = chosen;
						}
					}
					total += dist;
				}
			} else {
				this.value = next;
			}
		} 
		return this.value;
	};

	/**
	 *  Choose randomly from an array weighted options in the form 
	 *  {"state" : string, "probability" : number} or an array of values
	 *  @param  {Array}  options 
	 *  @return  {Array}  The randomly selected choice
	 *  @private
	 */
	Tone.CtrlMarkov.prototype._getProbDistribution = function(options){
		var distribution = [];
		var total = 0;
		var needsNormalizing = false;
		for (var i = 0; i < options.length; i++){
			var option = options[i];
			if (Tone.isObject(option)){
				needsNormalizing = true;
				distribution[i] = option.probability;
			} else {
				distribution[i] = 1 / options.length;
			}
			total += distribution[i];
		}
		if (needsNormalizing){
			//normalize the values
			for (var j = 0; j < distribution.length; j++){
				distribution[j] = distribution[j] / total;
			}
		}
		return distribution;
	};

	/**
	 *  Clean up
	 *  @return  {Tone.CtrlMarkov}  this
	 */
	Tone.CtrlMarkov.prototype.dispose = function(){
		this.values = null;
	};

	return Tone.CtrlMarkov;
});
