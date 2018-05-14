define(["Tone/core/Tone", "Tone/core/Gain", "Tone/core/AudioNode"], function(Tone){

	/**
	 *  @class Tone.Solo lets you isolate a specific audio stream. When
	 *         an instance is set to `solo=true`, it will mute all other instances.
	 *  @extends {Tone.AudioNode}
	 *  @example
	 * var soloA = new Tone.Solo()
	 * var soloB = new Tone.Solo()
	 * soloA.solo = true
	 * //no audio will pass through soloB
	 */
	Tone.Solo = function(){

		var options = Tone.defaults(arguments, ["solo"], Tone.Solo);
		Tone.AudioNode.call(this);

		/**
		 *  The input and output node
		 *  @type  {Tone.Gain}
		 */
		this.input = this.output = new Tone.Gain();

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

	Tone.extend(Tone.Solo, Tone.AudioNode);

	/**
	 *  The defaults
	 *  @type  {Object}
	 *  @static
	 */
	Tone.Solo.defaults = {
		solo : false,
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
			return this._isSoloed();
		},
		set : function(solo){
			if (solo){
				this._addSolo();
			} else {
				this._removeSolo();
			}
			this.context.emit("solo", this);
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
	 * Add this to the soloed array
	 * @private
	 */
	Tone.Solo.prototype._addSolo = function(){
		if (!Tone.isArray(this.context._currentSolo)){
			this.context._currentSolo = [];
		}
		if (!this._isSoloed()){
			this.context._currentSolo.push(this);
		}
	};

	/**
	 * Remove this from the soloed array
	 * @private
	 */
	Tone.Solo.prototype._removeSolo = function(){
		if (this._isSoloed()){
			var index = this.context._currentSolo.indexOf(this);
			this.context._currentSolo.splice(index, 1);
		}
	};

	/**
	 * @return {Boolean} Is this on the soloed array
	 * @private
	 */
	Tone.Solo.prototype._isSoloed = function(){
		if (Tone.isArray(this.context._currentSolo)){
			return this.context._currentSolo.length !== 0 && this.context._currentSolo.indexOf(this) !== -1;
		} else {
			return false;
		}
	};

	/**
	 * @return {Boolean} Returns true if no one is soloed
	 * @private
	 */
	Tone.Solo.prototype._noSolos = function(){
		return !Tone.isArray(this.context._currentSolo) || this.context._currentSolo.length === 0;
	};

	/**
	 *  Solo the current instance and unsolo all other instances.
	 *  @param  {Tone.Solo}  instance  The instance which is being soloed/unsoloed.
	 *  @private
	 */
	Tone.Solo.prototype._soloed = function(){
		if (this._isSoloed()){
			this.input.gain.value = 1;
		} else if (this._noSolos()){
			//no one is soloed
			this.input.gain.value = 1;
		} else {
			this.input.gain.value = 0;
		}
	};

	/**
	 *  Clean up
	 *  @return  {Tone.Solo}  this
	 */
	Tone.Solo.prototype.dispose = function(){
		this.context.off("solo", this._soloBind);
		this._removeSolo();
		this._soloBind = null;
		Tone.AudioNode.prototype.dispose.call(this);
		return this;
	};

	return Tone.Solo;
});
