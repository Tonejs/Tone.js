define(["Tone/core/Tone", "Tone/component/Analyser"], function(Tone){

	"use strict";

	/**
	 *  @class  Tone.Meter gets the [RMS](https://en.wikipedia.org/wiki/Root_mean_square)
	 *          of an input signal with some averaging applied. 
	 *          It can also get the raw value of the signal or the value in dB. For signal 
	 *          processing, it's better to use Tone.Follower which will produce an audio-rate 
	 *          envelope follower instead of needing to poll the Meter to get the output.
	 *          <br><br>
	 *          Meter was inspired by [Chris Wilsons Volume Meter](https://github.com/cwilso/volume-meter/blob/master/volume-meter.js).
	 *
	 *  @constructor
	 *  @extends {Tone}
	 *  @param {number} [channels=1] number of channels being metered
	 *  @param {number} [smoothing=0.8] amount of smoothing applied to the volume
	 *  @param {number} [clipMemory=0.5] number in seconds that a "clip" should be remembered
	 *  @example
	 * var meter = new Tone.Meter();
	 * var mic = new Tone.Microphone().start();
	 * //connect mic to the meter
	 * mic.connect(meter);
	 * //use getLevel or getDb 
	 * //to access meter level
	 * meter.getLevel();
	 */
	Tone.Meter = function(){

		var options = this.optionsObject(arguments, ["type", "smoothing"], Tone.Meter.defaults);
		
		/**
		 *  @private
		 *  Hold the type of the Meter
		 *  @type  {String}
		 */
		this._type = options.type;

		/**
		 *  The analyser node which computes the levels.
		 *  @private
		 *  @type  {Tone.Analyser}
		 */
		this.input = this.output = this._analyser = new Tone.Analyser("fft", 32);

		// set some ranges
		this._analyser.minDecibels = -120;
		this._analyser.maxDecibels = 10;
		this._analyser.returnType = "float";

		this.type = options.type;
		this.smoothing = options.smoothing;
	};

	Tone.extend(Tone.Meter);

	/**
	 *  @private
	 *  @enum {String}
	 */
	Tone.Meter.Type = {
		Level : "level",
		Signal : "signal"
	};

	/**
	 *  The defaults
	 *  @type {Object}
	 *  @static
	 *  @const
	 */
	Tone.Meter.defaults = {
		"smoothing" : 0.8,
		"type" : Tone.Meter.Type.Level
	};

	/**
	 * The smoothing which is applied meter (only for "level" type)
	 * @memberOf Tone.Meter#
	 * @type {NormalRange}
	 * @name smoothing
	 */
	Object.defineProperty(Tone.Meter.prototype, "smoothing", {
		get : function(){
			return this._analyser.smoothingTimeConstant;
		},
		set : function(smoothing){
			this._analyser.smoothingTimeConstant = smoothing;
		},
	});

	/**
	 * The type of the meter, either "level" or "signal". 
	 * A level meter will return the volume level of the 
	 * inpute signal and a value meter will return
	 * the signal value of the input. 
	 * @memberOf Tone.Meter#
	 * @type {String}
	 * @name type
	 */
	Object.defineProperty(Tone.Meter.prototype, "type", {
		get : function(){
			return this._type;
		},
		set : function(type){
			this._type = type;
			if (type === Tone.Meter.Type.Level){
				this._analyser.type = "fft";
			} else if (type === Tone.Meter.Type.Signal){
				this._analyser.type = "waveform";
			}
		},
	});

	/**
	 * The current value of the meter.
	 * @memberOf Tone.Meter#
	 * @type {Number}
	 * @name value
	 * @readOnly
	 */
	Object.defineProperty(Tone.Meter.prototype, "value", {
		get : function(){
			var analysis = this._analyser.analyse();
			if (this._type === Tone.Meter.Type.Level){
				var max = -Infinity;
				for (var i = 0; i < analysis.length; i++){
					max = Math.max(analysis[i], max);
				}
				//scale [-100,0] to [0, 1]
				var min = this._analyser.minDecibels;
				if (max < min){
					return 0;
				} else {
					return (max - min) / -min;
				}
			} else {
				return analysis[0];
			}
		},
	});

	/**
	 *  Clean up.
	 *  @returns {Tone.Meter} this
	 */
	Tone.Meter.prototype.dispose = function(){
		Tone.prototype.dispose.call(this);
		this._analyser.dispose();
		this._analyser = null;
		return this;
	};

	return Tone.Meter;
});