define(["Tone/core/Tone", "Tone/core/Gain", "Tone/signal/SignalBase"], function(Tone){

	/**
	 *  @class Tone.Zero outputs 0's at audio-rate. The reason this has to be
	 *         it's own class is that many browsers optimize out Tone.Signal
	 *         with a value of 0 and will not process nodes further down the graph.
	 *  @extends {Tone.SignalBase}
	 */
	Tone.Zero = function(){

		Tone.SignalBase.call(this);

		/**
		 *  The gain node
		 *  @type  {Tone.Gain}
		 *  @private
		 */
		this._gain = this.input = this.output = new Tone.Gain();

		this.context.getConstant(0).connect(this._gain);
	};

	Tone.extend(Tone.Zero, Tone.SignalBase);

	/**
	 *  clean up
	 *  @return  {Tone.Zero}  this
	 */
	Tone.Zero.prototype.dispose = function(){
		Tone.SignalBase.prototype.dispose.call(this);
		this._gain.dispose();
		this._gain = null;
		return this;
	};

	return Tone.Zero;
});
