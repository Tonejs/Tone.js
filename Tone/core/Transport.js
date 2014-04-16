///////////////////////////////////////////////////////////////////////////////
//
//	TRANSPORT
//
//	oscillator-based transport allows for simple musical timing 
//	supports tempo curves and time changes
//	setInterval (repeated events)
//	setTimeout (single timeline event)
//
///////////////////////////////////////////////////////////////////////////////

define(["Tone/core/Tone", "Tone/core/Master"], function(Tone){

	var Transport = function(){

		//components
		this.oscillator = null;
		this.jsNode = this.context.createScriptProcessor(this.bufferSize, 1, 1);
		this.jsNode.onaudioprocess = this._processBuffer.bind(this);


		//privates
		this._timeSignature = 4;//defaults to 4/4
		this._tatum = 12; //subdivisions of the quarter note
		this._ticks = 0; //the number of tatums
		this._upTick = false; // if the wave is on the rise or fall
		this._bpm = 120; //defaults to 120
		//@type {Array.<Transport.Interval>}
		this._intervals = [];
		//@type {Array.<Transport.Timeout>}
		this._timeouts = [];
		this._timeoutProgress = 0;

		//public
		this._loopStart = 0;
		this._loopEnd = this._tatum * 4;
		this.loop = false;
		this.state = Transport.state.stopped;

		//so it doesn't get garbage collected
		this.jsNode.toMaster();
	}

	Tone.extend(Transport);

	///////////////////////////////////////////////////////////////////////////////
	//	INTERNAL METHODS
	///////////////////////////////////////////////////////////////////////////////

	Transport.prototype._processBuffer = function(event){
		var now = this.defaultArg(event.playbackTime, this.now());
		var bufferSize = this.jsNode.bufferSize;
		var endTime = now + this.samplesToSeconds(bufferSize);
		var incomingBuffer = event.inputBuffer.getChannelData(0);
		var upTick = this._upTick;
		for (var i = 0; i < bufferSize; i++){
			var sample = incomingBuffer[i];
			if (sample > 0 && !upTick){
				upTick = true;	
				this._processTick(now + this.samplesToSeconds(i));
			} else if (sample < 0 && upTick){
				upTick = false;
			}
		}
		this._upTick = upTick;
	}

	//@param {number} tickTime
	Transport.prototype._processTick = function(tickTime){
		//do the looping stuff
		var ticks = this._ticks;
		//do the intervals
		this._processIntervals(ticks, tickTime);
		this._processTimeouts(ticks, tickTime);
		this._ticks = ticks + 1;
		if (this.loop){
			if (this._ticks === this._loopEnd){
				this._setTicks(this._loopStart);
			}
		}
	}

	//jump to a specific tick in the timeline
	Transport.prototype._setTicks = function(ticks){
		this._ticks = ticks;
		for (var i = 0; i < this._timeouts.length; i++){
			var timeout = this._timeouts[i];
			if (timeout.callbackTick() >= ticks){
				this._timeoutProgress = i;
				break;
			}
		}
	}

	///////////////////////////////////////////////////////////////////////////////
	//	TIMING
	///////////////////////////////////////////////////////////////////////////////


	//processes and invokes the intervals
	Transport.prototype._processIntervals = function(ticks, time){
		for (var i = 0, len = this._intervals.length; i<len; i++){
			var interval = this._intervals[i];
			if (interval.testCallback(ticks)){
				interval.doCallback(time);
			}
		}
	}

	//processes and invokes the timeouts
	Transport.prototype._processTimeouts = function(ticks, time){
		for (var i = this._timeoutProgress, len = this._timeouts.length; i<len; i++){
			var timeout = this._timeouts[i];
			var callbackTick = timeout.callbackTick();
			if (callbackTick === ticks){
				timeout.doCallback(time);
				//increment the timeoutprogress
				this._timeoutProgress = i + 1;
			} else if (callbackTick > ticks){
				break;
			} 
		}
	}


	//@param {function(number)} callback
	//@param {string} interval (01:02:0.2)
	//@param {Object=} ctx the 'this' object which the 
	//@returns {Transport.Event} the event
	Transport.prototype.setInterval = function(callback, interval, ctx){
		var ticks = this.toTicks(interval);
		ctx = this.defaultArg(ctx, window);
		var timeout = new Transport.Timeout(callback, ctx, ticks, this._ticks);
		this._intervals.push(timeout);
		return timeout;
	}

	//@param {number} intervalId
	//@param {}
	//@returns {boolean} true if the interval was removed
	Transport.prototype.clearInterval = function(rmInterval){
		for (var i = 0; i < this._intervals.length; i++){
			var interval = this._intervals[i];
			if (interval === rmInterval){
				this._intervals.splice(i, 1);
				return true;
			}
		}
		return false;
	}

	//@param {function(number)} callback
	//@param {string} timeout colon seperated (bars:beats)
	//@param {Object=} ctx the 'this' object which the 
	//@returns {number} the timeoutID
	Transport.prototype.setTimeout = function(callback, timeout, ctx){
		var ticks = this.toTicks(timeout);
		ctx = this.defaultArg(ctx, window);
		var timeout = new Transport.Timeout(callback, ctx, ticks, this._ticks);
		//put it in the right spot
		this._addTimeout(timeout);
		return timeout;
	}

	//add an event in the correct position
	Transport.prototype._addTimeout = function(event){
		for (var i = this._timeoutProgress, len = this._timeouts.length; i<len; i++){
			var testEvnt = this._timeouts[i];
			if (testEvnt.callbackTick() > event.callbackTick()){
				this._timeouts.splice(i, 0, event);
				return;
			}
		}
		//otherwise push it on the end
		this._timeouts.push(event);
	}

	//@param {string} timeoutID returned by setTimeout
	Transport.prototype.clearTimeout = function(timeoutID){
		for (var i = 0; i < this._timeouts.length; i++){
			var timeout = this._timeouts[i];
			if (timeout.id === timeoutID){
				this._timeouts.splice(i, 1);
				return true;
			}
		}
		return false;
	}

	//@param {string|number} time
	//@returns {number} the the conversion to ticks
	Transport.prototype.toTicks = function(time){
		//get the seconds
		var seconds = this.toSeconds(time);
		var quarter = this.notationToSeconds("4n");
		var quarters = seconds / quarter;
		var ticks = quarters * this._tatum;
		//quantize to tick value
		return Math.round(ticks);
	}

	//@param {number} ticks
	//@returns {string} progress (measures:beats:sixteenths)
	Transport.prototype.ticksToTransportTime = function(ticks){
		var quarters = ticks / this._tatum;
		var measures = parseInt(quarters / this._timeSignature, 10);
		var sixteenths = parseInt((quarters % 1) * 4, 10);
		quarters = parseInt(quarters, 10) % this._timeSignature;
		var progress = [measures, quarters, sixteenths];
		return progress.join(":");
	}

	//@returns {string} progress (measures:beats:sixteenths)
	Transport.prototype.getTransportTime = function(){
		return this.ticksToTransportTime(this._ticks);
	}

	//jump to a specific measure
	//@param {string} progress
	Transport.prototype.setTransportTime = function(progress){
		var ticks = this.toTicks(progress);
		this._setTicks(ticks);
	}

	///////////////////////////////////////////////////////////////////////////////
	//	START/STOP/PAUSE
	///////////////////////////////////////////////////////////////////////////////

	Transport.prototype.start = function(time){
		if (this.state !== Transport.state.started){
			this.state = Transport.state.started;
			this.upTick = false;
			time = this.defaultArg(time, this.now());
			this.oscillator	= this.context.createOscillator();
			this.oscillator.type = "square";
			this.setBpm(this._bpm);
			this.oscillator.connect(this.jsNode);
			this.oscillator.start(this.toSeconds(time));
		}
	}

	Transport.prototype.stop = function(time){
		if (this.state !== Transport.state.stopped){
			this.state = Transport.state.stopped;
			time = this.defaultArg(time, this.now());
			this.oscillator.stop(this.toSeconds(time));
			this._setTicks(0);
		}
	}

	Transport.prototype.pause = function(time){
		this.state = Transport.state.paused;
		time = this.defaultArg(time, this.now());
		this.oscillator.stop(this.toSeconds(time));
	}

	///////////////////////////////////////////////////////////////////////////////
	//	SETTERS/GETTERS
	///////////////////////////////////////////////////////////////////////////////

	//@param {number} bpm
	//@param {number=} rampTime Optionally speed the tempo up over time
	Transport.prototype.setBpm = function(bpm, rampTime){
		this._bpm = bpm;
		if (this.state === Transport.state.started){
			//convert the bpm to frequency
			var tatumFreq = this.toFrequency(this._tatum.toString() + "n", this._bpm, this._timeSignature);
			var freqVal = 4 * tatumFreq;
			if (!rampTime){
				this.oscillator.frequency.value = freqVal;
			} else {
				this.exponentialRampToValueNow(this.oscillator.frequency, freqVal, rampTime);
			}
		}
	}

	//@returns {number} the current bpm
	Transport.prototype.getBpm = function(){
		//if the oscillator isn't running, return _bpm
		if (this.state === Transport.state.started){
			//convert the current frequency of the oscillator to bpm
			var freq = this.oscillator.frequency.value;
			return 60 * (freq / this._tatum);
		} else {
			return this._bpm;
		}
	}

	//@param {number} numerator
	//@param {number=} denominator
	Transport.prototype.setTimeSignature = function(numerator, denominator){
		denominator = this.defaultArg(denominator, 4);
		this._timeSignature = numerator / (denominator / 4);
	}

	//@returns {number} the time signature
	Transport.prototype.getTimeSignature = function(){
		return this._timeSignature;
	}

	//@param {number|string} startPosition
	Transport.prototype.setLoopStart = function(startPosition){
		this._loopStart = this.toTicks(startPosition);
	}

	//@param {number|string} endPosition
	Transport.prototype.setLoopEnd = function(endPosition){
		this._loopEnd = this.toTicks(endPosition);
	}

	//@enum
	Transport.state = {
		started : "started",
		paused : "paused",
		stopped : "stopped"
	}

	///////////////////////////////////////////////////////////////////////////////
	//
	//	TRANSPORT EVENT
	//
	///////////////////////////////////////////////////////////////////////////////

	//@constructor
	//@param {function(number)} callback
	//@param {object} context
	//@param {number} interval (in ticks)
	//@param {number} startTicks
	//@param {boolean} repeat
	Transport.Timeout = function(callback, context, interval, startTicks){
		this.interval = interval;
		this.start = startTicks;
		this.callback = callback;
		this.context = context;
	}

	Transport.Timeout.prototype.doCallback = function(playbackTime){
		this.callback.call(this.context, playbackTime); 
	}

	Transport.Timeout.prototype.callbackTick = function(){
		return this.start + this.interval;
	}

	Transport.Timeout.prototype.testCallback = function(tick){
		return (tick - this.start) % this.interval === 0;
	}

	//a single transport object
	Tone.Transport = new Transport();

	///////////////////////////////////////////////////////////////////////////////
	//	override Tone's getBpm and getTimeSignature with transport value
	///////////////////////////////////////////////////////////////////////////////

	//@returns {number}
	Tone.prototype.getBpm = function(){
		return Tone.Transport.getBpm();
	}

	//@returns {number}
	Tone.prototype.getTimeSignature = function(){
		return Tone.Transport.getTimeSignature();
	}


	return Tone.Transport;
});
