define(["Tone/core/Tone", "Tone/component/Analyser", "Tone/core/AudioNode"], function(Tone){

	  "use strict";
  
	  /**
	   *  @class  Tone.Meter gets the Peak or [RMS](https://en.wikipedia.org/wiki/Root_mean_square)
	   *          of an input signal with some averaging applied. It can also get the raw
	   *          value of the input signal.
	   *
	   *  @constructor
	   *  @extends {Tone.AudioNode}
	   *  @param {Number} smoothing The amount of smoothing applied between frames.
	   *  @param {'rms' | 'peak'} type Calculation method of dB value, defaults to RMS
	   *  @example
	   * var meter = new Tone.Meter();
	   * var mic = new Tone.UserMedia().open();
	   * //connect mic to the meter
	   * mic.connect(meter);
	   * //the current level of the mic input in decibels
	   * var level = meter.getValue();
	   */
	  Tone.Meter = function(){

		var options = Tone.defaults(arguments, ["smoothing"], Tone.Meter);
		Tone.AudioNode.call(this);
  
		/**
		 *  The analyser node which computes the levels.
		 *  @private
		 *  @type  {Tone.Analyser}
		 */
		this.input = this.output = this._analyser = new Tone.Analyser("waveform", 1024);
  
		/**
		 *  The amount of carryover between the current and last frame.
		 *  Only applied meter for "level" type.
		 *  @type  {Number}
		 */
		this.smoothing = options.smoothing;
  
		/**
		 * Calculation method used to get the dB value
		 * @type {'rms' | 'peak'}
		 */
		this.type = options.type;
	  };
  
	  Tone.extend(Tone.Meter, Tone.AudioNode);
  
	  /**
	   * Calculation methods available for dB value, default is RMS
	   * @enum {String}
	   */
	  Tone.Meter.Type = {
		RMS : "rms",
		Peak : "peak"
	  };
  
	  /**
	   *  The defaults
	   *  @type {Object}
	   *  @static
	   *  @const
	   */
	  Tone.Meter.defaults = {
		"smoothing" : 0.8,
		"type" : Tone.Meter.Type.RMS
	  };
  
	  /**
	   *  Get the current decibel value of the incoming signal
	   *  @returns {Decibels}
	   */
	  Tone.Meter.prototype.getLevel = function(){
		var values = this._analyser.getValue();
  
		switch (this.type){
		  case Tone.Meter.Type.RMS:
			var peakFloatValue = this.getRmsFloatValue(values);
			return this.convertFloatToDb(peakFloatValue);
		  case Tone.Meter.Type.Peak:
			var peakFloatValue = this.getPeakFloatValue(values);
			return this.convertFloatToDb(peakFloatValue);
		  default:
			// Sanity check, should always be cause when setting type
			throw new TypeError("Tone.Meter: invalid type: " + this.type);
		}
	  };
  
	  /**
	   *  Get the signal value of the incoming signal
	   *  @returns {Number}
	   */
	  Tone.Meter.prototype.getValue = function(){
		var value = this._analyser.getValue();
		return value[0];
	  };
  
	  /**
	   * Converts a float based amplitude value to it's equivalent db value
	   * https://en.wikipedia.org/wiki/Decibel#Conversions
	   *
	   * @param {Number} float The float amplitude ratio value to convert to a db value
	   * @returns {Number} dB equivalent of given float value
	   */
	  Tone.Meter.prototype.convertFloatToDb = function(float){
		return 20.0 * (Math.log(float) / Math.log(10.0));
	  };
  
	  /**
	   * Gets the peak value from a Float32Array, uses absolute values so
	   * negative values are counted towards the peak.
	   *
	   * @param {Float32Array} values Float32Array with amplitude ratio readings
	   * @returns {Number}
	   */
	  Tone.Meter.prototype.getPeakFloatValue = function(values){
		var peak = 0;
		for (var i = 0; i < values.length; i++){
		  var value = Math.abs(values[i]);
		  if (value > peak) {
			peak = value;
		  }
		}
		return peak;
	  };
  
	  /**
	   * Gets the [RMS](https://en.wikipedia.org/wiki/Root_mean_square) value from a Float32Array
	   *
	   * @param {Float32Array} values Float32Array with amplitude ratio readings
	   * @returns {Number}
	   */
	  Tone.Meter.prototype.getRmsFloatValue = function(values){
		var totalSquared = 0;
		for (var i = 0; i < values.length; i++){
		  var value = values[i];
		  totalSquared += value * value;
		}
		return Math.sqrt(totalSquared / values.length);
	  };
  
	  /**
	   * A value from 0 -> 1 where 0 represents no time averaging with the last analysis frame.
	   * @memberOf Tone.Meter#
	   * @type {Number}
	   * @name smoothing
	   * @readOnly
	   */
	  Object.defineProperty(Tone.Meter.prototype, "smoothing", {
		get : function(){
		  return this._analyser.smoothing;
		},
		set : function(val){
		  this._analyser.smoothing = val;
		}
	  });
  
	  /**
	   * Either 'rms' or 'peak', determines calculation method of getValue
	   * @memberOf Tone.Meter#
	   * @type {'rms' | 'peak'}
	   * @name type
	   */
	  Object.defineProperty(Tone.Meter.prototype, "type", {
		get : function(){
		  return this._type;
		},
		set : function(type){
		  if (type !== Tone.Meter.Type.RMS && type !== Tone.Meter.Type.Peak){
			throw new TypeError("Tone.Meter: invalid type: " + type);
		  }
		  this._type = type;
		}
	  });
  
	  /**
	   *  Clean up.
	   *  @returns {Tone.Meter} this
	   */
	  Tone.Meter.prototype.dispose = function(){
		Tone.AudioNode.prototype.dispose.call(this);
		this._analyser.dispose();
		this._analyser = null;
		return this;
	  };
  
	  return Tone.Meter;
});
  