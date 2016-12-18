define(["Tone/core/Tone", "Tone/event/Loop", "Tone/control/CtrlPattern"], function (Tone) {

	/**
	 *  @class Tone.Pattern arpeggiates between the given notes
	 *         in a number of patterns. See Tone.CtrlPattern for
	 *         a full list of patterns.
	 *  @example
	 * var pattern = new Tone.Pattern(function(time, note){
	 *   //the order of the notes passed in depends on the pattern
	 * }, ["C2", "D4", "E5", "A6"], "upDown");
	 *  @extends {Tone.Loop}
	 *  @param {Function} callback The callback to invoke with the
	 *                             event.
	 *  @param {Array} values The values to arpeggiate over.
	 */
	Tone.Pattern = function(){

		var options = this.optionsObject(arguments, ["callback", "values", "pattern"], Tone.Pattern.defaults);

		Tone.Loop.call(this, options);

		/**
		 *  The pattern manager
		 *  @type {Tone.CtrlPattern}
		 *  @private
		 */
		this._pattern = new Tone.CtrlPattern({
			"values" : options.values, 
			"type" : options.pattern,
			"index" : options.index
		});
		
	};

	Tone.extend(Tone.Pattern, Tone.Loop);

	/**
	 *  The defaults
	 *  @const
	 *  @type  {Object}
	 */
	Tone.Pattern.defaults = {
		"pattern" : Tone.CtrlPattern.Type.Up,
		"values" : [],
	};

	/**
	 *  Internal function called when the notes should be called
	 *  @param  {Number}  time  The time the event occurs
	 *  @private
	 */
	Tone.Pattern.prototype._tick = function(time){
		this.callback(time, this._pattern.value);
		this._pattern.next();
	};

	/**
	 *  The current index in the values array.
	 *  @memberOf Tone.Pattern#
	 *  @type {Positive}
	 *  @name index
	 */
	Object.defineProperty(Tone.Pattern.prototype, "index", {
		get : function(){
			return this._pattern.index;
		},
		set : function(i){
			this._pattern.index = i;
		}
	});

	/**
	 *  The array of events.
	 *  @memberOf Tone.Pattern#
	 *  @type {Array}
	 *  @name values
	 */
	Object.defineProperty(Tone.Pattern.prototype, "values", {
		get : function(){
			return this._pattern.values;
		},
		set : function(vals){
			this._pattern.values = vals;
		}
	});

	/**
	 *  The current value of the pattern.
	 *  @memberOf Tone.Pattern#
	 *  @type {*}
	 *  @name value
	 *  @readOnly
	 */
	Object.defineProperty(Tone.Pattern.prototype, "value", {
		get : function(){
			return this._pattern.value;
		}
	});

	/**
	 *  The pattern type. See Tone.CtrlPattern for the full list of patterns.
	 *  @memberOf Tone.Pattern#
	 *  @type {String}
	 *  @name pattern
	 */
	Object.defineProperty(Tone.Pattern.prototype, "pattern", {
		get : function(){
			return this._pattern.type;
		},
		set : function(pattern){
			this._pattern.type = pattern;
		}
	});

	/**
	 *  Clean up
	 *  @return  {Tone.Pattern}  this
	 */
	Tone.Pattern.prototype.dispose = function(){
		Tone.Loop.prototype.dispose.call(this);
		this._pattern.dispose();
		this._pattern = null;
	};

	return Tone.Pattern;
});