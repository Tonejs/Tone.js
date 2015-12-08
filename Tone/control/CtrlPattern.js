define(["Tone/core/Tone"], function (Tone) {

	"use strict";

	/**
	 *  @class Generate patterns from an array of values.
	 *         Has a number of arpeggiation and randomized
	 *         selection patterns. 
	 *           <ul>
	 *  	        <li>"up" - cycles upward</li>
	 *  			<li>"down" - cycles downward</li>
	 *  			<li>"upDown" - up then and down</li>
	 *  			<li>"downUp" - cycles down then and up</li>
	 *  			<li>"alternateUp" - jump up two and down one</li>
	 *  			<li>"alternateDown" - jump down two and up one</li>
	 *  			<li>"random" - randomly select an index</li>
	 *  			<li>"randomWalk" - randomly moves one index away from the current position</li>
	 *  			<li>"randomOnce" - randomly select an index without repeating until all values have been chosen.</li>
	 *     		</ul>
	 *  @param  {Array}  values   An array of options to choose from.
	 *  @param  {Tone.CtrlPattern.Type=}  type  The name of the pattern.
	 *  @extends {Tone}
	 */
	Tone.CtrlPattern = function(){

		var options = this.optionsObject(arguments, ["values", "type"], Tone.CtrlPattern.defaults);

		/**
		 *  The array of values to arpeggiate over
		 *  @type {Array}
		 */
		this.values = options.values;
		
		/**
		 *  The current position in the values array
		 *  @type  {Number}
		 */
		this.index = 0;

		/**
		 *  The type placeholder
		 *  @type {Tone.CtrlPattern.Type}
		 *  @private
		 */
		this._type = null;

		/**
		 *  Shuffled values for the RandomOnce type
		 *  @type {Array}
		 *  @private
		 */
		this._shuffled = null;

		/**
		 *  The direction of the movement
		 *  @type {String}
		 *  @private
		 */
		this._direction = null;

		this.type = options.type;
	};

	Tone.extend(Tone.CtrlPattern);

	/**
	 *  The Control Patterns
	 *  @type  {Object}
	 *  @static
	 */
	Tone.CtrlPattern.Type = {
		Up : "up",
		Down : "down",
		UpDown : "upDown",
		DownUp : "downUp",
		AlternateUp : "alternateUp",
		AlternateDown : "alternateDown",
		Random : "random",
		RandomWalk : "randomWalk",
		RandomOnce : "randomOnce",
	};

	/**
	 *  The default values. 
	 *  @type  {Object}
	 */
	Tone.CtrlPattern.defaults = {
		"type" : Tone.CtrlPattern.Type.Up,
		"values" : []
	};

	/**
	 *  The value at the current index of the pattern.
	 *  @readOnly
	 *  @memberOf Tone.CtrlPattern#
	 *  @type {*}
	 *  @name value
	 */
	Object.defineProperty(Tone.CtrlPattern.prototype, "value", {
		get : function(){
			//some safeguards
			if (this.values.length === 0){
				return;
			} else if (this.values.length === 1){
				return this.values[0];
			} 
			this.index = Math.min(this.index, this.values.length - 1);
			var val = this.values[this.index];
			if (this.type === Tone.CtrlPattern.Type.RandomOnce){
				if (this.values.length !== this._shuffled.length){
					this._shuffleValues();
				}
				val = this.values[this._shuffled[this.index]];
			}
			return val;
		}
	});


	/**
	 *  The pattern used to select the next
	 *  item from the values array
	 *  @memberOf Tone.CtrlPattern#
	 *  @type {Tone.CtrlPattern.Type}
	 *  @name type
	 */
	Object.defineProperty(Tone.CtrlPattern.prototype, "type", {
		get : function(){
			return this._type;
		},
		set : function(type){
			this._type = type;
			this._shuffled = null;

			//the first index
			if (this._type === Tone.CtrlPattern.Type.Up ||
					this._type === Tone.CtrlPattern.Type.UpDown || 
					this._type === Tone.CtrlPattern.Type.RandomOnce ||
					this._type === Tone.CtrlPattern.Type.AlternateUp){
				this.index = 0;
			} else if (this._type === Tone.CtrlPattern.Type.Down ||
					this._type === Tone.CtrlPattern.Type.DownUp || 
					this._type === Tone.CtrlPattern.Type.AlternateDown){
				this.index = this.values.length - 1;
			}

			//the direction
			if (this._type === Tone.CtrlPattern.Type.UpDown || 
					this._type === Tone.CtrlPattern.Type.AlternateUp){
				this._direction = Tone.CtrlPattern.Type.Up;
			} else if (this._type === Tone.CtrlPattern.Type.DownUp || 
					this._type === Tone.CtrlPattern.Type.AlternateDown){
				this._direction = Tone.CtrlPattern.Type.Down;
			}

			//randoms
			if (this._type === Tone.CtrlPattern.Type.RandomOnce){
				this._shuffleValues();
			} else if (this._type === Tone.CtrlPattern.Random){
				this.index = Math.floor(Math.random() * this.values.length);
			}
		}
	});

	/**
	 *  Return the next value given the current position
	 *  and pattern.
	 *  @return {*} The next value
	 */
	Tone.CtrlPattern.prototype.next = function(){
		
		var type = this.type;

		//choose the next index
		if (type === Tone.CtrlPattern.Type.Up){
			this.index++;
			if (this.index >= this.values.length){
				this.index = 0;
			}
		} else if (type === Tone.CtrlPattern.Type.Down){
			this.index--;
			if (this.index < 0){
				this.index = this.values.length - 1;
			}
		} else if (type === Tone.CtrlPattern.Type.UpDown ||
					type === Tone.CtrlPattern.Type.DownUp){
			if (this._direction === Tone.CtrlPattern.Type.Up){
				this.index++;
			} else {
				this.index--;
			}
			if (this.index < 0){
				this.index = 1;
				this._direction = Tone.CtrlPattern.Type.Up;
			} else if (this.index >= this.values.length){
				this.index = this.values.length - 2;
				this._direction = Tone.CtrlPattern.Type.Down;
			}
		} else if (type === Tone.CtrlPattern.Type.Random){
			this.index = Math.floor(Math.random() * this.values.length);
		} else if (type === Tone.CtrlPattern.Type.RandomWalk){
			if (Math.random() < 0.5){
				this.index--;
				this.index = Math.max(this.index, 0);
			} else {
				this.index++;
				this.index = Math.min(this.index, this.values.length - 1);
			}
		} else if (type === Tone.CtrlPattern.Type.RandomOnce){
			this.index++;
			if (this.index >= this.values.length){
				this.index = 0;
				//reshuffle the values for next time
				this._shuffleValues();
			}
		} else if (type === Tone.CtrlPattern.Type.AlternateUp){
			if (this._direction === Tone.CtrlPattern.Type.Up){
				this.index += 2;
				this._direction = Tone.CtrlPattern.Type.Down;
			} else {
				this.index -= 1;
				this._direction = Tone.CtrlPattern.Type.Up;
			}
			if (this.index >= this.values.length){
				this.index = 0;
				this._direction = Tone.CtrlPattern.Type.Up;
			}
		} else if (type === Tone.CtrlPattern.Type.AlternateDown){
			if (this._direction === Tone.CtrlPattern.Type.Up){
				this.index += 1;
				this._direction = Tone.CtrlPattern.Type.Down;
			} else {
				this.index -= 2;
				this._direction = Tone.CtrlPattern.Type.Up;
			}
			if (this.index < 0){
				this.index = this.values.length - 1;
				this._direction = Tone.CtrlPattern.Type.Down;
			}
		}
		return this.value;
	};

	/**
	 *  Shuffles the values and places the results into the _shuffled
	 *  @private
	 */
	Tone.CtrlPattern.prototype._shuffleValues = function(){
		var copy = [];
		this._shuffled = [];
		for (var i = 0; i < this.values.length; i++){
			copy[i] = i;
		}
		while(copy.length > 0){
			var randVal = copy.splice(Math.floor(copy.length * Math.random()), 1);
			this._shuffled.push(randVal[0]);
		}
	};

	/**
	 *  Clean up
	 *  @returns {Tone.CtrlPattern} this
	 */
	Tone.CtrlPattern.prototype.dispose = function(){
		this._shuffled = null;
		this.values = null;
	};

	return Tone.CtrlPattern;
});