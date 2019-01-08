define(["../core/Tone", "../source/Source", "../source/Oscillator",
	"../signal/Multiply", "../core/Gain"], function(Tone){

	"use strict";

	/**
	 *  @class Tone.FatOscillator
	 *
	 *  @extends {Tone.Source}
	 *  @constructor
	 *  @param {Frequency} frequency The starting frequency of the oscillator.
	 *  @param {String} type The type of the carrier oscillator.
	 *  @param {String} modulationType The type of the modulator oscillator.
	 *  @example
	 * //a sine oscillator frequency-modulated by a square wave
	 * var fmOsc = new Tone.FatOscillator("Ab3", "sine", "square").toMaster().start();
	 */
	Tone.FatOscillator = function(){

		var options = Tone.defaults(arguments, ["frequency", "type", "spread"], Tone.FatOscillator);
		Tone.Source.call(this, options);

		/**
		 *  The oscillator's frequency
		 *  @type {Frequency}
		 *  @signal
		 */
		this.frequency = new Tone.Signal(options.frequency, Tone.Type.Frequency);

		/**
		 *  The detune control signal.
		 *  @type {Cents}
		 *  @signal
		 */
		this.detune = new Tone.Signal(options.detune, Tone.Type.Cents);

		/**
		 *  The array of oscillators
		 *  @type {Array}
		 *  @private
		 */
		this._oscillators = [];

		/**
		 *  The total spread of the oscillators
		 *  @type  {Cents}
		 *  @private
		 */
		this._spread = options.spread;

		/**
		 *  The type of the oscillator
		 *  @type {String}
		 *  @private
		 */
		this._type = options.type;

		/**
		 *  The phase of the oscillators
		 *  @type {Degrees}
		 *  @private
		 */
		this._phase = options.phase;

		/**
		 *  The partials array
		 *  @type {Array}
		 *  @private
		 */
		this._partials = options.partials;

		/**
		 *  The number of partials to use
		 *  @type {Number}
		 *  @private
		 */
		this._partialCount = options.partialCount;

		//set the count initially
		this.count = options.count;
		this._readOnly(["frequency", "detune"]);
	};

	Tone.extend(Tone.FatOscillator, Tone.Source);

	/**
	 *  default values
	 *  @static
	 *  @type {Object}
	 *  @const
	 */
	Tone.FatOscillator.defaults = {
		"frequency" : 440,
		"detune" : 0,
		"phase" : 0,
		"spread" : 20,
		"count" : 3,
		"type" : "sawtooth",
		"partials" : [],
		"partialCount" : 0
	};

	/**
	 *  start the oscillator
	 *  @param  {Time} [time=now]
	 *  @private
	 */
	Tone.FatOscillator.prototype._start = function(time){
		time = this.toSeconds(time);
		this._forEach(function(osc){
			osc.start(time);
		});
	};

	/**
	 *  stop the oscillator
	 *  @param  {Time} [time=now]
	 *  @private
	 */
	Tone.FatOscillator.prototype._stop = function(time){
		time = this.toSeconds(time);
		this._forEach(function(osc){
			osc.stop(time);
		});
	};

	/**
	 *  restart the oscillator
	 *  @param  {Time} time (optional) timing parameter
	 *  @private
	 */
	Tone.FatOscillator.prototype.restart = function(time){
		time = this.toSeconds(time);
		this._forEach(function(osc){
			osc.restart(time);
		});
	};

	/**
	 *  Iterate over all of the oscillators
	 *  @param  {Function}  iterator  The iterator function
	 *  @private
	 */
	Tone.FatOscillator.prototype._forEach = function(iterator){
		for (var i = 0; i < this._oscillators.length; i++){
			iterator.call(this, this._oscillators[i], i);
		}
	};

	/**
	 * The type of the carrier oscillator
	 * @memberOf Tone.FatOscillator#
	 * @type {string}
	 * @name type
	 */
	Object.defineProperty(Tone.FatOscillator.prototype, "type", {
		get : function(){
			return this._type;
		},
		set : function(type){
			this._type = type;
			this._forEach(function(osc){
				osc.type = type;
			});
		}
	});

	/**
	 * The detune spread between the oscillators. If "count" is
	 * set to 3 oscillators and the "spread" is set to 40,
	 * the three oscillators would be detuned like this: [-20, 0, 20]
	 * for a total detune spread of 40 cents.
	 * @memberOf Tone.FatOscillator#
	 * @type {Cents}
	 * @name spread
	 */
	Object.defineProperty(Tone.FatOscillator.prototype, "spread", {
		get : function(){
			return this._spread;
		},
		set : function(spread){
			this._spread = spread;
			if (this._oscillators.length > 1){
				var start = -spread/2;
				var step = spread / (this._oscillators.length - 1);
				this._forEach(function(osc, i){
					osc.detune.value = start + step * i;
				});
			}
		}
	});

	/**
	 * The number of detuned oscillators
	 * @memberOf Tone.FatOscillator#
	 * @type {Number}
	 * @name count
	 */
	Object.defineProperty(Tone.FatOscillator.prototype, "count", {
		get : function(){
			return this._oscillators.length;
		},
		set : function(count){
			count = Math.max(count, 1);
			if (this._oscillators.length !== count){
				//dispose the previous oscillators
				this._forEach(function(osc){
					osc.dispose();
				});
				this._oscillators = [];
				for (var i = 0; i < count; i++){
					var osc = new Tone.Oscillator();
					if (this.type === Tone.Oscillator.Type.Custom){
						osc.partials = this._partials;
					} else {
						osc.type = this._type;
					}
					osc.partialCount = this._partialCount;
					osc.phase = this._phase + (i / count) * 360;
					osc.volume.value = -6 - count*1.1;
					this.frequency.connect(osc.frequency);
					this.detune.connect(osc.detune);
					osc.connect(this.output);
					this._oscillators[i] = osc;
				}
				//set the spread
				this.spread = this._spread;
				if (this.state === Tone.State.Started){
					this._forEach(function(osc){
						osc.start();
					});
				}
			}
		}
	});

	/**
	 * The phase of the oscillator in degrees.
	 * @memberOf Tone.FatOscillator#
	 * @type {Number}
	 * @name phase
	 */
	Object.defineProperty(Tone.FatOscillator.prototype, "phase", {
		get : function(){
			return this._phase;
		},
		set : function(phase){
			this._phase = phase;
			this._forEach(function(osc){
				osc.phase = phase;
			});
		}
	});

	/**
	 * The oscillator type without the partialsCount appended to the end
	 * @memberOf Tone.FatOscillator#
	 * @type {string}
	 * @name baseType
	 * @example
	 * osc.type = 'sine2'
	 * osc.baseType //'sine'
	 * osc.partialCount = 2
	 */
	Object.defineProperty(Tone.FatOscillator.prototype, "baseType", {
		get : function(){
			return this._oscillators[0].baseType;
		},
		set : function(baseType){
			this._forEach(function(osc){
				osc.baseType = baseType;
			});
			this._type = this._oscillators[0].type;
		}
	});

	/**
	 * The partials of the carrier waveform. A partial represents
	 * the amplitude at a harmonic. The first harmonic is the
	 * fundamental frequency, the second is the octave and so on
	 * following the harmonic series.
	 * Setting this value will automatically set the type to "custom".
	 * The value is an empty array when the type is not "custom".
	 * @memberOf Tone.FatOscillator#
	 * @type {Array}
	 * @name partials
	 * @example
	 * osc.partials = [1, 0.2, 0.01];
	 */
	Object.defineProperty(Tone.FatOscillator.prototype, "partials", {
		get : function(){
			return this._oscillators[0].partials;
		},
		set : function(partials){
			this._partials = partials;
			this._type = Tone.Oscillator.Type.Custom;
			this._forEach(function(osc){
				osc.partials = partials;
			});
		}
	});

	/**
	 * 'partialCount' offers an alternative way to set the number of used partials. 
	 * When partialCount is 0, the maximum number of partials are used when representing
	 * the waveform using the periodicWave. When 'partials' is set, this value is 
	 * not settable, but equals the length of the partials array.
	 * @memberOf Tone.FatOscillator#
	 * @type {Number}
	 * @name partialCount
	 */
	Object.defineProperty(Tone.FatOscillator.prototype, "partialCount", {
		get : function(){
			return this._oscillators[0].partialCount;
		},
		set : function(partialCount){
			this._partialCount = partialCount;
			this._forEach(function(osc){
				osc.partialCount = partialCount;
			});
			this._type = this._oscillators[0].type;
		}
	});

	/**
	 *  Clean up.
	 *  @return {Tone.FatOscillator} this
	 */
	Tone.FatOscillator.prototype.dispose = function(){
		Tone.Source.prototype.dispose.call(this);
		this._writable(["frequency", "detune"]);
		this.frequency.dispose();
		this.frequency = null;
		this.detune.dispose();
		this.detune = null;
		this._forEach(function(osc){
			osc.dispose();
		});
		this._oscillators = null;
		this._partials = null;
		return this;
	};

	return Tone.FatOscillator;
});
