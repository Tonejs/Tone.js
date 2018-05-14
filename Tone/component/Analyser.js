define(["Tone/core/Tone", "Tone/core/AudioNode", "Tone/shim/AnalyserNode"], function(Tone){

	"use strict";

	/**
	 *  @class  Wrapper around the native Web Audio's
	 *          [AnalyserNode](http://webaudio.github.io/web-audio-api/#idl-def-AnalyserNode).
	 *          Extracts FFT or Waveform data from the incoming signal.
	 *  @extends {Tone.AudioNode}
	 *  @param {String=} type The return type of the analysis, either "fft", or "waveform".
	 *  @param {Number=} size The size of the FFT. Value must be a power of
	 *                       two in the range 32 to 32768.
	 */
	Tone.Analyser = function(){

		var options = Tone.defaults(arguments, ["type", "size"], Tone.Analyser);
		Tone.AudioNode.call(this);

		/**
		 *  The analyser node.
		 *  @private
		 *  @type {AnalyserNode}
		 */
		this._analyser = this.input = this.output = this.context.createAnalyser();

		/**
		 *  The analysis type
		 *  @type {String}
		 *  @private
		 */
		this._type = options.type;

		/**
		 *  The buffer that the FFT data is written to
		 *  @type {TypedArray}
		 *  @private
		 */
		this._buffer = null;

		//set the values initially
		this.size = options.size;
		this.type = options.type;
	};

	Tone.extend(Tone.Analyser, Tone.AudioNode);

	/**
	 *  The default values.
	 *  @type {Object}
	 *  @const
	 */
	Tone.Analyser.defaults = {
		"size" : 1024,
		"type" : "fft",
		"smoothing" : 0.8
	};

	/**
	 *  Possible return types of analyser.getValue()
	 *  @enum {String}
	 */
	Tone.Analyser.Type = {
		Waveform : "waveform",
		FFT : "fft"
	};

	/**
	 *  Run the analysis given the current settings and return the
	 *  result as a TypedArray.
	 *  @returns {TypedArray}
	 */
	Tone.Analyser.prototype.getValue = function(){
		if (this._type === Tone.Analyser.Type.FFT){
			this._analyser.getFloatFrequencyData(this._buffer);
		} else if (this._type === Tone.Analyser.Type.Waveform){
			this._analyser.getFloatTimeDomainData(this._buffer);
		}
		return this._buffer;
	};

	/**
	 *  The size of analysis. This must be a power of two in the range 32 to 32768.
	 *  @memberOf Tone.Analyser#
	 *  @type {Number}
	 *  @name size
	 */
	Object.defineProperty(Tone.Analyser.prototype, "size", {
		get : function(){
			return this._analyser.frequencyBinCount;
		},
		set : function(size){
			this._analyser.fftSize = size * 2;
			this._buffer = new Float32Array(size);
		}
	});

	/**
	 *  The analysis function returned by analyser.getValue(), either "fft" or "waveform".
	 *  @memberOf Tone.Analyser#
	 *  @type {String}
	 *  @name type
	 */
	Object.defineProperty(Tone.Analyser.prototype, "type", {
		get : function(){
			return this._type;
		},
		set : function(type){
			if (type !== Tone.Analyser.Type.Waveform && type !== Tone.Analyser.Type.FFT){
				throw new TypeError("Tone.Analyser: invalid type: "+type);
			}
			this._type = type;
		}
	});

	/**
	 *  0 represents no time averaging with the last analysis frame.
	 *  @memberOf Tone.Analyser#
	 *  @type {NormalRange}
	 *  @name smoothing
	 */
	Object.defineProperty(Tone.Analyser.prototype, "smoothing", {
		get : function(){
			return this._analyser.smoothingTimeConstant;
		},
		set : function(val){
			this._analyser.smoothingTimeConstant = val;
		}
	});

	/**
	 *  Clean up.
	 *  @return  {Tone.Analyser}  this
	 */
	Tone.Analyser.prototype.dispose = function(){
		Tone.AudioNode.prototype.dispose.call(this);
		this._analyser.disconnect();
		this._analyser = null;
		this._buffer = null;
	};

	return Tone.Analyser;
});
