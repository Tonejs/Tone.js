define(["Tone/core/Tone", "Tone/signal/Switch", "Tone/signal/Negate", "Tone/signal/LessThan"], function(Tone){

	/**
	 *  @class return the absolute value of an incoming signal
	 *
	 *  @constructor
	 *  @extends {Tone}
	 */
	Tone.Abs = function(){
		Tone.call(this);

		/**
		 *  @type {Tone.LessThan}
		 *  @private
		 */
		this._ltz = new Tone.LessThan(0);

		/**
		 *  @type {Tone.Switch}
		 *  @private
		 */
		this._switch = new Tone.Switch(2);
		
		/**
		 *  @type {Tone.Negate}
		 *  @private
		 */
		this._negate = new Tone.Negate();

		//two signal paths, positive and negative
		this.input.connect(this._switch, 0, 0);
		this.input.connect(this._negate);
		this._negate.connect(this._switch, 0, 1);
		this._switch.connect(this.output);
		
		//the control signal
		this.chain(this.input, this._ltz, this._switch.gate);
	};

	Tone.extend(Tone.Abs);

	/**
	 *  dispose method
	 */
	Tone.Abs.prototype.dispose = function(){
		this._switch.dispose();
		this._ltz.dispose();
		this._negate.dispose();
		this.input.disconnect();
		this.output.disconnect();
		this._switch = null;
		this._ltz = null;
		this._negate = null;
		this.input = null;
		this.output = null;
	}; 

	return Tone.Abs;
});