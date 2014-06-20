define(["Tone/core/Tone", "Tone/core/Transport", "Tone/signal/Signal", "Tone/source/Source"], 
function(Tone){

	/**
	 *  Oscillator
	 *
	 *  Oscilator with start, pause, stop and sync to Transport
	 *
	 *  @constructor
	 *  @extends {Tone.Source}
	 *  @param {number|string=} freq starting frequency
	 *  @param {string=} type type of oscillator (sine|square|triangle|sawtooth)
	 */
	Tone.Oscillator = function(freq, type){
		Tone.Source.call(this);

		/**
		 *  the main oscillator
		 *  @type {OscillatorNode}
		 */
		this.oscillator = this.context.createOscillator();
		/**
		 *  the frequency control signal
		 *  @type {Tone.Signal}
		 */
		this.frequency = new Tone.Signal(this.defaultArg(this.toFrequency(freq), 440));

		/**
		 *  @type {function()}
		 */
		this.onended = function(){};

		//connections
		this.oscillator.connect(this.output);
		//setup
		this.oscillator.type = this.defaultArg(type, "sine");
	};

	Tone.extend(Tone.Oscillator, Tone.Source);

	/**
	 *  start the oscillator
	 *  
	 *  @param  {Tone.Time} time 
	 */
	Tone.Oscillator.prototype.start = function(time){
		if (this.state === Tone.Source.State.STOPPED){
			this.state = Tone.Source.State.STARTED;
			//get previous values
			var type = this.oscillator.type;
			var detune = this.oscillator.detune.value;
			//new oscillator with previous values
			this.oscillator = this.context.createOscillator();
			this.oscillator.type = type;
			this.oscillator.detune.value = detune;
			//connect the control signal to the oscillator frequency
			this.oscillator.connect(this.output);
			this.frequency.connect(this.oscillator.frequency);
			this.oscillator.frequency.value = 0;
			//start the oscillator
			this.oscillator.start(this.toSeconds(time));
			this.oscillator.onended = this._onended.bind(this);
		}
	};

	/**
	 *  stop the oscillator
	 *  @param  {Tone.Time=} time (optional) timing parameter
	 */
	Tone.Oscillator.prototype.stop = function(time){
		if (this.state === Tone.Source.State.STARTED){
			if (!time){
				this.state = Tone.Source.State.STOPPED;
			}
			this.oscillator.stop(this.toSeconds(time));
		}
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
		if (this.state !== Tone.Source.State.SYNCED){
			this.state = Tone.Source.State.SYNCED;
			Tone.Transport.sync(this);
			Tone.Transport.syncSignal(this.frequency);
		}
	};

	/**
	 *  unsync the oscillator from the Transport
	 */
	Tone.Oscillator.prototype.unsync = function(){
		if (this.state === Tone.Source.State.SYNCED){
			Tone.Transport.unsync(this);
			this.frequency.unsync();
		}
	};

	/**
	 *  exponentially ramp the frequency of the oscillator over the rampTime
	 *  
	 *  @param {Tone.Time}	val
	 *  @param {Tone.Time=} rampTime when the oscillator will arrive at the frequency
	 */
	Tone.Oscillator.prototype.setFrequency = function(val, rampTime){
		if (rampTime){
			this.frequency.exponentialRampToValueAtTime(this.toFrequency(val), this.toSeconds(rampTime));
		} else {
			this.frequency.setValue(this.toFrequency(val));
		}
	};

	/**
	 *  set the oscillator type
	 *  
	 *  @param {string} type (sine|square|triangle|sawtooth)
	 */
	Tone.Oscillator.prototype.setType = function(type){
		this.oscillator.type = type;
	};

	/**
	 *  internal on end call
	 *  @private
	 */
	Tone.Oscillator.prototype._onended = function(){
		this.state = Tone.Source.State.STOPPED;
		this.onended();
	};

	/**
	 *  dispose and disconnect
	 */
	Tone.Oscillator.prototype.dispose = function(){
		if (this.oscillator !== null){
			this.oscillator.disconnect();
			this.oscillator = null;
		}
		this.frequency.dispose();
		this.frequency = null;
		this.output.disconnect();
		this.output = null;
	};

	return Tone.Oscillator;
});