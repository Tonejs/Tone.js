define(["Tone/core/Tone", "Tone/core/Transport", "Tone/signal/Signal", "Tone/source/Source"], 
function(Tone){

	/**
	 *  Oscillator
	 *
	 *  Oscilator with start, pause, stop and sync to Transport
	 *
	 *  @constructor
	 *  @extends {Tone.Source}
	 *  @param {number=} freq starting frequency
	 *  @param {string=} type type of oscillator (sine|square|triangle|sawtooth)
	 */
	Tone.Oscillator = function(freq, type){

		//components
		this.output = this.context.createGain();
		this.oscillator = this.context.createOscillator();
		this.control = new Tone.Signal(this.defaultArg(this.toFrequency(freq), 440));

		//connections
		this.oscillator.connect(this.output);

		//parameters
		this.oscillator.type = this.defaultArg(type, "sine");
		this.isSynced = false;
	};

	Tone.extend(Tone.Oscillator, Tone.Source);

	/**
	 *  start the oscillator
	 *  
	 *  @param  {Tone.Time} time 
	 */
	Tone.Oscillator.prototype.start = function(time){
		//get previous values
		var type = this.oscillator.type;
		var detune = this.oscillator.frequency.value;
		//new oscillator with previous values
		this.oscillator = this.context.createOscillator();
		this.oscillator.type = type;
		this.oscillator.detune.value = detune;
		//connect the control signal to the oscillator frequency
		this.oscillator.connect(this.output);
		this.control.connect(this.oscillator.frequency);
		this.oscillator.frequency.value = 0;
		//start the oscillator
		this.oscillator.start(this.toSeconds(time));
	};

	/**
	 *  Sync the oscillator to the transport
	 *
	 *  the current ratio between the oscillator and the Transport BPM
	 *  is fixed and any change to the Transport BPM will change this
	 *  oscillator in that same ratio
	 *
	 *  Transport start/pause/stop will also start/pause/stop the oscillator
	 */
	Tone.Oscillator.prototype.sync = function(){
		Tone.Transport.sync(this, this.control);
	};

	/**
	 *  unsync the oscillator from the Transport
	 */
	Tone.Oscillator.prototype.unsync = function(){
		Tone.Transport.unsync(this);
		this.control.unsync();
	};

	/**
	 *  stop the oscillator
	 *  @param  {Tone.Time=} time (optional) timing parameter
	 */
	Tone.Oscillator.prototype.stop = function(time){
		this.oscillator.stop(this.toSeconds(time));
	};

	/**
	 *  exponentially ramp the frequency of the oscillator over the rampTime
	 *  
	 *  @param {number}	     val      the frequency
	 *  @param {Tone.Time} rampTime when the oscillator will arrive at the frequency
	 */
	Tone.Oscillator.prototype.setFrequency = function(val, rampTime){
		this.control.exponentialRampToValueAtTime(this.toFrequency(val), this.toSeconds(rampTime));
	};

	/**
	 *  set the oscillator type
	 *  
	 *  @param {string} type (sine|square|triangle|sawtooth)
	 */
	Tone.Oscillator.prototype.setType = function(type){
		this.oscillator.type = type;
	};

	return Tone.Oscillator;
});