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

define(["core/Tone"], function(Tone){

	//@param {number=} bpm
	//@param {number=} timeSignature (over 4);
	Tone.Transport = function(bpm, timeSignature){

		//components
		this.oscillator = null;
		this.jsNode = this.context.createScriptProcessor(this.bufferSize, 1, 1);
		this.jsNode.onaudioprocess = this._processBuffer.bind(this);
		this.timeSignature = this.defaultArg(timeSignature, 4);

		//privates
		this._tatum = 12; //subdivisions of the quarter note
		this._ticks = 0; //the number of tatums
		this._upTick = false; // if the wave is on the rise or fall
		this._bpm = bpm;

		//@type {Array.<Tone.Transport.Interval>}
		this._intervals = [];
		//@type {Array.<Tone.Transport.Timeout>}
		this._timeouts = [];
		this._timeoutProgress = 0;

		this.loopStart = 0;
		this.loopEnd = this._tatum * 4;
		this.loop = false;

		this.state = Tone.Transport.state.stopped;

		//so it doesn't get garbage collected
		this.jsNode.connect(Tone.Master);
	}

	Tone.extend(Tone.Transport, Tone);

	///////////////////////////////////////////////////////////////////////////////
	//	INTERNAL METHODS
	///////////////////////////////////////////////////////////////////////////////

	Tone.Transport.prototype._processBuffer = function(event){
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
	Tone.Transport.prototype._processTick = function(tickTime){
		//do the looping stuff
		var ticks = this._ticks;
		//do the intervals
		this._processIntervals(ticks, tickTime);
		this._processTimeouts(ticks, tickTime);
		this._ticks = ticks + 1;
		if (this.loop){
			if (this._ticks === this.loopEnd){
				this._setTicks(this.loopStart);
			}
		}
	}

	//jump to a specific tick in the timeline
	Tone.Transport.prototype._setTicks = function(ticks){
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
	Tone.Transport.prototype._processIntervals = function(ticks, time){
		for (var i = 0, len = this._intervals.length; i<len; i++){
			var interval = this._intervals[i];
			if (interval.testCallback(ticks)){
				interval.doCallback(time);
			}
		}
	}

	//processes and invokes the timeouts
	Tone.Transport.prototype._processTimeouts = function(ticks, time){
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
	//@returns {Tone.Transport.Event} the event
	Tone.Transport.prototype.setInterval = function(callback, interval, ctx){
		var ticks = this.progressToTicks(interval);
		ctx = this.defaultArg(ctx, window);
		var timeout = new Tone.Transport.Timeout(callback, ctx, ticks, this._ticks);
		this._intervals.push(timeout);
		return timeout;
	}

	//@param {number} intervalId
	//@param {}
	//@returns {boolean} true if the interval was removed
	Tone.Transport.prototype.clearInterval = function(rmInterval){
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
	Tone.Transport.prototype.setTimeout = function(callback, timeout, ctx){
		var ticks = this.progressToTicks(timeout);
		ctx = this.defaultArg(ctx, window);
		var timeout = new Tone.Transport.Timeout(callback, ctx, ticks, this._ticks);
		//put it in the right spot
		this._addTimeout(timeout);
		return timeout;
	}

	//add an event in the correct position
	Tone.Transport.prototype._addTimeout = function(event){
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
	Tone.Transport.prototype.clearTimeout = function(timeoutID){
		for (var i = 0; i < this._timeouts.length; i++){
			var timeout = this._timeouts[i];
			if (timeout.id === timeoutID){
				this._timeouts.splice(i, 1);
				return true;
			}
		}
		return false;
	}

	//@param {string} measures (measures:beats:sixteenths)
	//@returns {number} the the conversion to ticks
	Tone.Transport.prototype.progressToTicks = function(progress){
		var measures = 0;
		var quarters = 0;
		var sixteenths = 0;
		if (typeof progress === "number"){
			quarters = progress;
		} else if (typeof progress === "string"){
			if (this.isNotation(progress)){
				quarters = this.notationToBeat(progress);
			} else {
				var split = progress.split(":");
				if (split.length === 2){
					measures = parseFloat(split[0]);
					quarters = parseFloat(split[1]);
				} else if (split.length === 1){
					quarters = parseFloat(split[0]);
				} else if (split.length === 3){
					measures = parseFloat(split[0]);
					quarters = parseFloat(split[1]);
					sixteenths = parseFloat(split[2]);
				}
			}
		}
		var ticks = (measures * this.timeSignature + quarters + sixteenths / 4) * this._tatum;
		//quantize to tick value
		return Math.round(ticks);
	}

	//@param {number} ticks
	//@returns {string} progress (measures:beats:sixteenths)
	Tone.Transport.prototype.ticksToProgress = function(ticks){
		var quarters = ticks / this._tatum;
		var measures = parseInt(quarters / this.timeSignature, 10);
		var sixteenths = parseInt((quarters % 1) * 4, 10);
		quarters = parseInt(quarters, 10) % this.timeSignature;
		var progress = [measures, quarters, sixteenths];
		return progress.join(":");
	}

	//@returns {string} progress (measures:beats:sixteenths)
	Tone.Transport.prototype.getProgress = function(){
		return this.ticksToProgress(this._ticks);
	}

	//jump to a specific measure
	//@param {string} progress
	Tone.Transport.prototype.setProgress = function(progress){
		var ticks = this.progressToTicks(progress);
		this._setTicks(ticks);
	}

	///////////////////////////////////////////////////////////////////////////////
	//	START/STOP/PAUSE
	///////////////////////////////////////////////////////////////////////////////

	Tone.Transport.prototype.start = function(time){
		if (this.state !== Tone.Transport.state.playing){
			this.state = Tone.Transport.state.playing;
			this.upTick = false;
			time = this.defaultArg(time, this.now());
			this.oscillator	= this.context.createOscillator();
			this.oscillator.type = "square";
			this.setTempo(this._bpm);
			this.oscillator.connect(this.jsNode);
			this.oscillator.start(time);
		}
	}

	Tone.Transport.prototype.stop = function(time){
		if (this.state !== Tone.Transport.state.stopped){
			this.state = Tone.Transport.state.stopped;
			time = this.defaultArg(time, this.now());
			this.oscillator.stop(time);
			this._setTicks(0);
		}
	}

	Tone.Transport.prototype.pause = function(time){
		this.state = Tone.Transport.state.paused;
		time = this.defaultArg(time, this.now());
		this.oscillator.stop(time);
	}

	///////////////////////////////////////////////////////////////////////////////
	//	TEMPO CONTROLS
	///////////////////////////////////////////////////////////////////////////////

	//@param {number} bpm
	//@param {number=} rampTime Optionally speed the tempo up over time
	Tone.Transport.prototype.setTempo = function(bpm, rampTime){
		this._bpm = bpm;
		if (this.state === Tone.Transport.state.playing){
			//convert the bpm to frequency
			var freqVal = 4 / this.notationTime(this._tatum.toString() + "n", this._bpm);
			if (!rampTime){
				this.oscillator.frequency.value = freqVal;
			} else {
				this.exponentialRampToValue(this.oscillator.frequency, freqVal, rampTime);
			}
		}
	}

	//@returns {number} the current bpm
	Tone.Transport.prototype.getTempo = function(){
		//if the oscillator isn't running, return _bpm
		if (this.state === Tone.Transport.state.playing){
			//convert the current frequency of the oscillator to bpm
			var freq = this.oscillator.frequency.value;
		} else {
			return this._bpm;
		}
	}

	//@param {Array.<number>} noteValues
	//@param {string} subdivision
	//@returns {Array.<number>} the 
	Tone.Transport.prototype.quantize = function(noteValues, subdivision, percentage){

	}

	//@enum
	Tone.Transport.state = {
		playing : "playing",
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
	Tone.Transport.Timeout = function(callback, context, interval, startTicks){
		this.interval = interval;
		this.start = startTicks;
		this.callback = callback;
		this.context = context;
	}

	Tone.Transport.Timeout.prototype.doCallback = function(playbackTime){
		this.callback.call(this.context, playbackTime); 
	}

	Tone.Transport.Timeout.prototype.callbackTick = function(){
		return this.start + this.interval;
	}

	Tone.Transport.Timeout.prototype.testCallback = function(tick){
		return (tick - this.start) % this.interval === 0;
	}

	return Tone.Transport;
});
