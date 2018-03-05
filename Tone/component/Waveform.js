define(["Tone/core/Tone", "Tone/component/Analyser", "Tone/core/AudioNode"], function(Tone){

	/**
	 *  @class  Get the current waveform data of the connected audio source.
	 *  @extends {Tone.AudioNode}
	 *  @param {Number=} size The size of the FFT. Value must be a power of
	 *                       two in the range 32 to 32768.
	 */
	Tone.Waveform = function(){

		var options = Tone.defaults(arguments, ["size"], Tone.Waveform);
		options.type = Tone.Analyser.Type.Waveform;
		Tone.AudioNode.call(this);

		/**
		 *  The analyser node.
		 *  @private
		 *  @type {Tone.Analyser}
		 */
		this._analyser = this.input = this.output = new Tone.Analyser(options);
	};

	Tone.extend(Tone.Waveform, Tone.AudioNode);

	/**
	 *  The default values.
	 *  @type {Object}
	 *  @const
	 */
	Tone.Waveform.defaults = {
		"size" : 1024
	};

	/**
	 *  Gets the waveform of the audio source. Returns the waveform data
	 *  of length [size](#size) as a Float32Array with values between -1 and 1.
	 *  @returns {TypedArray}
	 */
	Tone.Waveform.prototype.getValue = function(){
		return this._analyser.getValue();
	};

	/**
	 *  The size of analysis. This must be a power of two in the range 32 to 32768.
	 *  @memberOf Tone.Waveform#
	 *  @type {Number}
	 *  @name size
	 */
	Object.defineProperty(Tone.Waveform.prototype, "size", {
		get : function(){
			return this._analyser.size;
		},
		set : function(size){
			this._analyser.size = size;
		}
	});
	/**
	 *  Clean up.
	 *  @return  {Tone.Waveform}  this
	 */
	Tone.Waveform.prototype.dispose = function(){
		Tone.AudioNode.prototype.dispose.call(this);
		this._analyser.dispose();
		this._analyser = null;
	};

	return Tone.Waveform;
});
