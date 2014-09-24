define(["Tone/core/Tone", "Tone/instrument/Sampler", "Tone/instrument/Instrument"], 
function(Tone){

	"use strict";

	/**
	 *  @class Aggregates multiple Tone.Samplers into a single instrument.
	 *         Pass in a mapping of names to sample urls and an optional 
	 *         callback to invoke when all of the samples are loaded. 
	 *
	 *  @example
	 *  var sampler = new Tone.MultiSampler({
	 *  	"kick" : "../audio/BD.mp3",
	 *  	"snare" : "../audio/SD.mp3",
	 *  	"hat" : "../audio/hh.mp3"
	 *  }, onload);
	 *  //once loaded...
	 *  sampler.triggerAttack("kick");
	 *
	 *  @constructor
	 *  @extends {Tone.Instrument}
	 *  @param {Object} samples the samples used in this
	 *  @param {function} onload the callback to invoke when all 
	 *                           of the samples have been loaded
	 */
	Tone.MultiSampler = function(samples, onload){

	 	Tone.Instrument.call(this);

	 	/**
	 	 *  the array of voices
	 	 *  @type {Tone.Sampler}
	 	 */
		this.samples = {};

		//make the samples
		this._createSamples(samples, onload);
	};

	Tone.extend(Tone.MultiSampler, Tone.Instrument);

	/**
	 *  creates all of the samples and tracks their loading
	 *  
	 *  @param   {Object} samples the samples
	 *  @param   {function} onload  the onload callback
	 *  @private
	 */
	Tone.MultiSampler.prototype._createSamples = function(samples, onload){
		//object which tracks the number of loaded samples
		var loadCounter = {
			total : 0,
			loaded : 0
		};
		//get the count
		for (var s in samples){
			if (typeof samples[s] === "string"){
				loadCounter.total++;
			}
		}
		//the function to invoke when a sample is loaded
		var onSampleLoad = function(){
			loadCounter.loaded++;
			if (loadCounter.loaded === loadCounter.total){
				if (onload){
					onload();
				}
			}
		};
		for (var samp in samples){
			var url = samples[samp];
			var sampler = new Tone.Sampler(url, onSampleLoad);
			sampler.connect(this.output);
			this.samples[samp] = sampler;
		}
	};

	/**
	 *  start a sample
	 *  
	 *  @param  {string} sample the note name to start
	 *  @param {Tone.Time=} [time=now] the time when the note should start
	 *  @param {number} [velocity=1] the velocity of the note
	 */
	Tone.MultiSampler.prototype.triggerAttack = function(sample, time, velocity){
		if (this.samples.hasOwnProperty(sample)){
			this.samples[sample].triggerAttack(0, time, velocity);
		}
	};

	/**
	 *  start the release portion of the note
	 *  
	 *  @param  {string} sample the note name to release
	 *  @param {Tone.Time=} [time=now] the time when the note should release
	 */
	Tone.MultiSampler.prototype.triggerRelease = function(sample, time){
		if (this.samples.hasOwnProperty(sample)){
			this.samples[sample].triggerRelease(time);
		}
	};

	/**
	  *  start the release portion of the note
	  *  
	  *  @param  {string} sample the note name to release
	  *  @param {Tone.Time} duration the duration of the note
	  *  @param {Tone.Time} [time=now] the time when the note should start
	  *  @param {number} [velocity=1] the velocity of the note
	  */
	Tone.MultiSampler.prototype.triggerAttackRelease = function(sample, duration, time, velocity){
		if (this.samples.hasOwnProperty(sample)){
			time = this.toSeconds(time);
			duration = this.toSeconds(duration);
			var samp = this.samples[sample];
			samp.triggerAttack(0, time, velocity);
			samp.triggerRelease(time + duration);
		}
	};

	/**
	 *  sets all the samplers with these settings
	 *  @param {object} params the parameters to be applied 
	 *                         to all internal samplers
	 */
	Tone.MultiSampler.prototype.set = function(params){
		for (var samp in this.samples){
			this.samples[samp].set(params);
		}
	};

	/**
	 *  set volume method borrowed form {@link Tone.Source}
	 *  @function
	 */
	Tone.MultiSampler.prototype.setVolume = Tone.Source.prototype.setVolume;

	/**
	 *  clean up
	 */
	Tone.MultiSampler.prototype.dispose = function(){
		Tone.Instrument.prototype.dispose.call(this);
		for (var samp in this.samples){
			this.samples[samp].dispose();
			this.samples[samp] = null;
		}
		this.samples = null;
	};

	return Tone.MultiSampler;
});
