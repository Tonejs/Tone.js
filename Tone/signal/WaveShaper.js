define(["Tone/core/Tone", "Tone/signal/SignalBase"], function(Tone){

	"use strict";

	/**
	 *  @class Wraps the WaveShaperNode
	 *
	 *  @extends {Tone.SignalBase}
	 *  @constructor
	 *  @param {function(number, number)|Array|number} mapping the function used to define the values. 
	 *                                    The mapping function should take two arguments: 
	 *                                    the first is the value at the current position 
	 *                                    and the second is the array position. 
	 *                                    If the argument is an array, that array will be
	 *                                    set as the wave shapping function
	 *  @param {number} [bufferLen=1024] the length of the WaveShaperNode buffer.
	 *  @example
	 *  var timesTwo = new Tone.WaveShaper(function(val){
	 *  	return val * 2;
	 *  }, 2048);
	 */
	Tone.WaveShaper = function(mapping, bufferLen){

		/**
		 *  the waveshaper
		 *  @type {WaveShaperNode}
		 *  @private
		 */
		this._shaper = this.input = this.output = this.context.createWaveShaper();

		/**
		 *  the waveshapers curve
		 *  @type {Float32Array}
		 *  @private
		 */
		this._curve = null;

		if (Array.isArray(mapping)){
			this.curve = mapping;
		} else if (isFinite(mapping) || this.isUndef(mapping)){
			this._curve = new Float32Array(this.defaultArg(mapping, 1024));
		} else if (this.isFunction(mapping)){
			this._curve = new Float32Array(this.defaultArg(bufferLen, 1024));
			this.setMap(mapping);
		} 
	};

	Tone.extend(Tone.WaveShaper, Tone.SignalBase);

	/**
	 *  uses a mapping function to set the value of the curve
	 *  @param {function(number, number)} mapping the function used to define the values. 
	 *                                    The mapping function should take two arguments: 
	 *                                    the first is the value at the current position 
	 *                                    and the second is the array position
	 *  @returns {Tone.WaveShaper} `this`
	 */
	Tone.WaveShaper.prototype.setMap = function(mapping){
		for (var i = 0, len = this._curve.length; i < len; i++){
			var normalized = (i / (len)) * 2 - 1;
			this._curve[i] = mapping(normalized, i);
		}
		this._shaper.curve = this._curve;
		return this;
	};

	/**
	 * The array to set as the waveshaper curve
	 * @memberOf Tone.WaveShaper#
	 * @type {Array}
	 * @name curve
	 */
	Object.defineProperty(Tone.WaveShaper.prototype, "curve", {
		get : function(){
			return this._shaper.curve;
		},
		set : function(mapping){
			//fixes safari WaveShaperNode bug
			if (this._isSafari()){
				var first = mapping[0];
				mapping.unshift(first);	
			}
			this._curve = new Float32Array(mapping);
			this._shaper.curve = this._curve;
		}
	});

	/**
	 * The oversampling. Can either be "none", "2x" or "4x"
	 * @memberOf Tone.WaveShaper#
	 * @type {string}
	 * @name curve
	 */
	Object.defineProperty(Tone.WaveShaper.prototype, "oversample", {
		get : function(){
			return this._shaper.oversample;
		},
		set : function(oversampling){
			this._shaper.oversample = oversampling;
		}
	});

	/**
	 *  returns true if the browser is safari
	 *  @return  {boolean} 
	 *  @private
	 */
	Tone.WaveShaper.prototype._isSafari = function(){
		var ua = navigator.userAgent.toLowerCase(); 
		return ua.indexOf("safari") !== -1 && ua.indexOf("chrome") === -1;
	};

	/**
	 *  clean up
	 *  @returns {Tone.WaveShaper} `this`
	 */
	Tone.WaveShaper.prototype.dispose = function(){
		Tone.prototype.dispose.call(this);
		this._shaper.disconnect();
		this._shaper = null;
		this._curve = null;
		return this;
	};

	return Tone.WaveShaper;
});