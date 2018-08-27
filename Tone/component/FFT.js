define(["../core/Tone", "../component/Analyser", "../core/AudioNode"], function(Tone){

	/**
	 *  @class  Get the current waveform data of the connected audio source.
	 *  @extends {Tone.AudioNode}
	 *  @param {Number=} size The size of the FFT. Value must be a power of
	 *                       two in the range 32 to 32768.
	 */
	Tone.FFT = function(){

		var options = Tone.defaults(arguments, ["size"], Tone.FFT);
		options.type = Tone.Analyser.Type.FFT;
		Tone.AudioNode.call(this);

		/**
		 *  The analyser node.
		 *  @private
		 *  @type {Tone.Analyser}
		 */
		this._analyser = this.input = this.output = new Tone.Analyser(options);
	};

	Tone.extend(Tone.FFT, Tone.AudioNode);

	/**
	 *  The default values.
	 *  @type {Object}
	 *  @const
	 */
	Tone.FFT.defaults = {
		"size" : 1024
	};

	/**
	 *  Gets the waveform of the audio source. Returns the waveform data
	 *  of length [size](#size) as a Float32Array with values between -1 and 1.
	 *  @returns {TypedArray}
	 */
	Tone.FFT.prototype.getValue = function(){
		return this._analyser.getValue();
	};

	/**
	 *  The size of analysis. This must be a power of two in the range 32 to 32768.
	 *  @memberOf Tone.FFT#
	 *  @type {Number}
	 *  @name size
	 */
	Object.defineProperty(Tone.FFT.prototype, "size", {
		get : function(){
			return this._analyser.size;
		},
		set : function(size){
			this._analyser.size = size;
		}
	});

	/**
	 *  Clean up.
	 *  @return  {Tone.FFT}  this
	 */
	Tone.FFT.prototype.dispose = function(){
		Tone.AudioNode.prototype.dispose.call(this);
		this._analyser.dispose();
		this._analyser = null;
	};

	return Tone.FFT;
});
