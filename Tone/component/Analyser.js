define(["Tone/core/Tone"], function (Tone) {

	"use strict";

	/**
	 *  @class  Wrapper around the native Web Audio's 
	 *          [AnalyserNode](http://webaudio.github.io/web-audio-api/#idl-def-AnalyserNode).
	 *          Extracts FFT or Waveform data from the incoming signal.
	 *  @extends {Tone}
	 *  @param {String=} type The return type of the analysis, either "fft", or "waveform". 
	 *  @param {Number=} size The size of the FFT. Value must be a power of 
	 *                       two in the range 32 to 32768.
	 */
	Tone.Analyser = function(){

		var options = this.optionsObject(arguments, ["type", "size"], Tone.Analyser.defaults);

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
		 *  The return type of the analysis
		 *  @type {String}
		 *  @private
		 */
		this._returnType = options.returnType;

		/**
		 *  The buffer that the FFT data is written to
		 *  @type {TypedArray}
		 *  @private
		 */
		this._buffer = null;

		//set the values initially
		this.size = options.size;
		this.type = options.type;
		this.returnType = options.returnType;
		this.minDecibels = options.minDecibels;
		this.maxDecibels = options.maxDecibels;
	};

	Tone.extend(Tone.Analyser);

	/**
	 *  The default values.
	 *  @type {Object}
	 *  @const
	 */
	Tone.Analyser.defaults = {
		"size" : 1024,
		"returnType" : "byte",
		"type" : "fft",
		"smoothing" : 0.8,
		"maxDecibels" : -30,
		"minDecibels" : -100
	};

	/**
	 *  Possible return types of Tone.Analyser.analyse()
	 *  @enum {String}
	 */
	Tone.Analyser.Type = {
		Waveform : "waveform",
		FFT : "fft"
	};

	/**
	 *  Possible return types of Tone.Analyser.analyse(). 
	 *  byte values are between [0,255]. float values are between 
	 *  [-1, 1] when the type is set to "waveform" and between 
	 *  [minDecibels,maxDecibels] when the type is "fft".
	 *  @enum {String}
	 */
	Tone.Analyser.ReturnType = {
		Byte : "byte",
		Float : "float"
	};

	/**
	 *  Run the analysis given the current settings and return the 
	 *  result as a TypedArray. 
	 *  @returns {TypedArray}
	 */
	Tone.Analyser.prototype.analyse = function(){
		if (this._type === Tone.Analyser.Type.FFT){
			if (this._returnType === Tone.Analyser.ReturnType.Byte){
				this._analyser.getByteFrequencyData(this._buffer);
			} else {
				this._analyser.getFloatFrequencyData(this._buffer);
			}
		} else if (this._type === Tone.Analyser.Type.Waveform){
			if (this._returnType === Tone.Analyser.ReturnType.Byte){
				this._analyser.getByteTimeDomainData(this._buffer);
			} else {
				if (this.isFunction(AnalyserNode.prototype.getFloatTimeDomainData)){
					this._analyser.getFloatTimeDomainData(this._buffer);
				} else {
					var uint8 = new Uint8Array(this._buffer.length);
					this._analyser.getByteTimeDomainData(uint8);
					//referenced https://github.com/mohayonao/get-float-time-domain-data 
					// POLYFILL
					for (var i = 0; i < uint8.length; i++){
						this._buffer[i] = (uint8[i] - 128) * 0.0078125;
					}
				}
			}
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
			this.type = this._type;
		}
	});

	/**
	 *  The return type of Tone.Analyser.analyse(), either "byte" or "float". 
	 *  When the type is set to "byte" the range of values returned in the array
	 *  are between 0-255. "float" values are between 
	 *  [-1, 1] when the type is set to "waveform" and between 
	 *  [minDecibels,maxDecibels] when the type is "fft".
	 *  @memberOf Tone.Analyser#
	 *  @type {String}
	 *  @name type
	 */
	Object.defineProperty(Tone.Analyser.prototype, "returnType", {
		get : function(){
			return this._returnType;
		},
		set : function(type){
			if (type === Tone.Analyser.ReturnType.Byte){
				this._buffer = new Uint8Array(this._analyser.frequencyBinCount);
			} else if (type === Tone.Analyser.ReturnType.Float){
				this._buffer = new Float32Array(this._analyser.frequencyBinCount);
			} else {
				throw new TypeError("Tone.Analayser: invalid return type: "+type);
			}
			this._returnType = type;
		}
	});

	/**
	 *  The analysis function returned by Tone.Analyser.analyse(), either "fft" or "waveform". 
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
	 *  The smallest decibel value which is analysed by the FFT. 
	 *  @memberOf Tone.Analyser#
	 *  @type {Decibels}
	 *  @name minDecibels
	 */
	Object.defineProperty(Tone.Analyser.prototype, "minDecibels", {
		get : function(){
			return this._analyser.minDecibels;
		},
		set : function(val){
			this._analyser.minDecibels = val;
		}
	});

	/**
	 *  The largest decibel value which is analysed by the FFT. 
	 *  @memberOf Tone.Analyser#
	 *  @type {Decibels}
	 *  @name maxDecibels
	 */
	Object.defineProperty(Tone.Analyser.prototype, "maxDecibels", {
		get : function(){
			return this._analyser.maxDecibels;
		},
		set : function(val){
			this._analyser.maxDecibels = val;
		}
	});

	/**
	 *  Clean up.
	 *  @return  {Tone.Analyser}  this
	 */
	Tone.Analyser.prototype.dispose = function(){
		Tone.prototype.dispose.call(this);
		this._analyser.disconnect();
		this._analyser = null;
		this._buffer = null;
	};

	return Tone.Analyser;
});