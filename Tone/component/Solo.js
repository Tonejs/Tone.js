define(["Tone/core/Tone", "Tone/core/Gain"], function (Tone) {

	/**
	 *  @class Tone.Solo lets you isolate a specific audio stream. When
	 *         an instance is set to `solo=true`, it will mute all other instances.
	 *  @extends {Tone}
	 *  @example
	 * var soloA = new Tone.Solo()
	 * var soloB = new Tone.Solo()
	 * soloA.solo = true
	 * //no audio will pass through soloB
	 */
	Tone.Solo = function(){

		var options = Tone.defaults(arguments, ["solo"], Tone.Solo);
		Tone.call(this);

		/**
		 *  The input and output node
		 *  @type  {Tone.Gain}
		 */
		this.input = this.output = new Tone.Gain();

		/**
		 *  Holds the current solo information
		 *  @type  {Boolean}
		 *  @private
		 */
		this._solo = false;

		/**
		 *  A bound _soloed method
		 *  @type  {Function}
		 *  @private
		 */
		this._soloBind = this._soloed.bind(this);

		//listen for solo events class-wide. 
		this.context.on("solo", this._soloBind);
		//set initially
		this.solo = options.solo;
	};

	Tone.extend(Tone.Solo);

	/**
	 *  The defaults
	 *  @type  {Object}
	 *  @static
	 */
	Tone.Solo.defaults = {
		solo: false,
	};

	/**
	 *  Isolates this instance and mutes all other instances of Tone.Solo. 
	 *  Only one instance can be soloed at a time. A soloed
	 *  instance will report `solo=false` when another instance is soloed.
	 *  @memberOf Tone.Solo#
	 *  @type {Boolean}
	 *  @name solo
	 */
	Object.defineProperty(Tone.Solo.prototype, "solo", {
		get : function(){
			return this._solo;
		},
		set : function(solo){
			this._solo = solo;
			if (solo){
				this.context._currentSolo = this;
				this.context.emit("solo", this);
			} else if (this.context._currentSolo === this){
				this.context._currentSolo = null;
				this.context.emit("solo", this);
			} else if (this.context._currentSolo){
				this._soloed();
			}
		}
	});

	/**
	 *  If the current instance is muted, i.e. another instance is soloed
	 *  @memberOf Tone.Solo#
	 *  @type {Boolean}
	 *  @name muted
	 *  @readOnly
	 */
	Object.defineProperty(Tone.Solo.prototype, "muted", {
		get : function(){
			return this.input.gain.value === 0;
		}
	});

	/**
	 *  Solo the current instance and unsolo all other instances.
	 *  @param  {Tone.Solo}  instance  The instance which is being soloed/unsoloed.
	 *  @private
	 */
	Tone.Solo.prototype._soloed = function(){
		if (this.context._currentSolo){
			if (this.context._currentSolo !== this){
				this._solo = false;
				this.input.gain.value = 0;
			} else {
				this.input.gain.value = 1;
			}
		} else {
			this.input.gain.value = 1;
		}
	};

	/**
	 *  Clean up
	 *  @return  {Tone.Solo}  this
	 */
	Tone.Solo.prototype.dispose = function(){
		Tone.prototype.dispose.call(this);
		this.context.off("solo", this._soloBind);
		this._soloBind = null;
		return this;
	};

	return Tone.Solo;
});