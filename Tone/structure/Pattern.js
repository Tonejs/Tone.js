define(["Tone/core/Tone", "Tone/structure/Note", "Tone/structure/Part"], function (Tone) {

	/**
	 *  @class Tone.Pattern arpeggiates between the given notes
	 *         in a number of patterns.
	 *  @extends {Tone}
	 *  @param {Function} callback The callback to invoke with the
	 *                             event.
	 *  @param {Array} notes The notes to arpeggiate over.
	 */
	Tone.Pattern = function(callback, notes){

		/**
		 *  Called back with the current event
		 *  @private
		 *  @type {Function}
		 */
		this._callback = callback;

		/**
		 *  The notes to arpeggiate
		 *  @type {Array}
		 */
		this.notes = notes;

		/**
		 *  The event index
		 *  @type {Array}
		 *  @private
		 */
		this._eventIndex = -1;

		/**
		 *  The note which schedules the notes
		 *  @type {Tone.Note}
		 *  @private
		 */
		this._note = new Tone.Note(this._tick.bind(this));
		this._note.loop = true;
		this._note.loopEnd = "4n";

		/**
		 *  The stepping direction of the notes
		 *  @type  {Number}
		 *  @private
		 */
		this._arpDirection = 1;
	};

	Tone.extend(Tone.Pattern);

	/**
	 *  Start the arpeggio at the given time.
	 *  @param  {Time=}  time  When to start the Arpeggio
	 *  @return  {Tone.Pattern}  this
	 */
	Tone.Pattern.prototype.start = function(time){
		this._note.start(time);
		return this;
	};

	/**
	 *  Stop the arpeggio at the given time.
	 *  @param  {Time=}  time  When to stop the Arpeggio
	 *  @return  {Tone.Pattern}  this
	 */
	Tone.Pattern.prototype.stop = function(time){
		this._note.stop(time);
		return this;
	};

	/**
	 *  Internal function called when the notes should be called
	 *  @param  {Number}  time  The time the event occurs
	 *  @private
	 */
	Tone.Pattern.prototype._tick = function(time){
		if (this._pattern === Tone.Pattern.Type.Random){
			this._eventIndex = Math.floor(Math.random() * this.notes.length);
		} else {
			this._eventIndex += this._arpDirection;
			if (this._pattern === Tone.Pattern.Type.Alternate){
				if (this._eventIndex === 0){
					this._arpDirection = 1;
				} else if (this._eventIndex === this.notes.length - 1){
					this._arpDirection = -1;
				}
			} else if (this._eventIndex < 0){
				this._eventIndex = this.notes.length - 1;
			} else if (this._eventIndex >= this.notes.length){
				this._eventIndex = 0;
			}
		}
		this._callback(time, this.notes[this._eventIndex]);
	};

	/**
	 *  The interval of the notes
	 *  @memberOf Tone.Pattern#
	 *  @type {Time}
	 *  @name interval
	 */
	Object.defineProperty(Tone.Pattern.prototype, "interval", {
		get : function(){
			return this._note.loopEnd;
		},
		set : function(interval){
			this._note.loopEnd = interval;
		}
	});

	/**
	 *  @memberOf Tone.Pattern#
	 *  @type {Time}
	 *  @name pattern
	 */
	Object.defineProperty(Tone.Pattern.prototype, "pattern", {
		get : function(){
			return this._pattern;
		},
		set : function(pattern){
			switch(pattern){
				case Tone.Pattern.Type.Forward : 
					this._arpDirection = 1;
					break;
				case Tone.Pattern.Type.Reverse : 
					this._arpDirection = -1;
					break;
			}
			var hasType = false;
			for (var pattr in Tone.Pattern.Type){
				if (pattern === Tone.Pattern.Type[pattr]){
					hasType = true;
					break;
				}
			}
			if (!hasType){
				throw new Error("Invalid pattern: "+pattern);
			}
			this._pattern = pattern;
		}
	});

	/**
	 *  The arpeggiation patterns
	 *  @type  {Object}
	 *  @enum {String}
	 */
	Tone.Pattern.Type = {
		Forward : "forward",
		Reverse : "reverse",
		Alternate : "alternate",
		Drunk : "drunk",
		Converge : "converge",
		Diverge : "diverge",
		RandomOnce : "randomOnce",
		Random : "random"
	};

	return Tone.Pattern;
});