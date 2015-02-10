define(["Tone/core/Tone", "Tone/core/Master"], function(Tone){

	"use strict";

	/**
	 *  @class  Record an input into an array or AudioBuffer. 
	 *          it is limited in that the recording length needs to be known beforehand. 
	 *          Mostly used internally for testing. 
	 *
	 *  @constructor
	 *  @extends {Tone}
	 *  @param {number} channels 
	 */
	Tone.Recorder = function(channels){
		
		Tone.call(this);

		/**
		 *  the number of channels in the recording
		 *  @type {number}
		 */
		this.channels = this.defaultArg(channels, 1);

		/**
		 *  @private
		 *  @type {ScriptProcessorNode}
		 */
		this._jsNode = this.context.createScriptProcessor(this.bufferSize, this.channels, 1);
		this._jsNode.onaudioprocess = this._audioprocess.bind(this);

		/**
		 *  Float32Array for each channel
		 *  @private
		 *  @type {Array<Float32Array>}
		 */
		this._recordBuffers = new Array(this.channels);

		/**
		 *  @type {number}
		 *  @private
		 */
		this._recordStartSample = 0;

		/**
		 *  @type {number}
		 *  @private
		 */
		this._recordEndSample = 0;

		/**
		 *  @type {number}
		 *  @private
		 */
		this._recordDuration = 0;

		/**
		 *  @type {RecordState}
		 */
		this.state = RecordState.STOPPED;

		/** 
		 *  @private
		 *  @type {number}
		 */
		this._recordBufferOffset = 0;

		/** 
		 *  callback invoked when the recording is over
		 *  @private
		 *  @type {function(Float32Array)}
		 */
		this._callback = function(){};

		//connect it up
		this.input.connect(this._jsNode);
		//pass thru audio
		this.input.connect(this.output);
		//so it doesn't get garbage collected
		this._jsNode.noGC();
		//clear it to start
		this.clear();
	};

	Tone.extend(Tone.Recorder);

	/**
	 *  internal method called on audio process
	 *  
	 *  @private
	 *  @param   {AudioProcessorEvent} event 
	 */
	Tone.Recorder.prototype._audioprocess = function(event){
		if (this.state === RecordState.STOPPED){
			return;
		} else if (this.state === RecordState.RECORDING){
			//check if it's time yet
			var now = this.defaultArg(event.playbackTime, this.now());
			var processPeriodStart = this.toSamples(now);
			var bufferSize = this._jsNode.bufferSize;
			var processPeriodEnd = processPeriodStart + bufferSize;
			var bufferOffset, len;
			if (processPeriodStart > this._recordEndSample){
				this.state = RecordState.STOPPED;
				this._callback(this._recordBuffers);
			} else if (processPeriodStart > this._recordStartSample) {
				bufferOffset = 0;
				len = Math.min(this._recordEndSample - processPeriodStart, bufferSize);
				this._recordChannels(event.inputBuffer, bufferOffset, len, bufferSize);
			} else if (processPeriodEnd > this._recordStartSample) {
				len = processPeriodEnd - this._recordStartSample;
				bufferOffset = bufferSize - len;
				this._recordChannels(event.inputBuffer, bufferOffset, len, bufferSize);
			} 

		}
	};

	/**
	 *  record an input channel
	 *  @param   {AudioBuffer} inputBuffer        
	 *  @param   {number} from  
	 *  @param   {number} to  
	 *  @private
	 */
	Tone.Recorder.prototype._recordChannels = function(inputBuffer, from, to, bufferSize){
		var offset = this._recordBufferOffset;
		var buffers = this._recordBuffers;
		for (var channelNum = 0; channelNum < inputBuffer.numberOfChannels; channelNum++){
			var channel = inputBuffer.getChannelData(channelNum);
			if ((from === 0) && (to === bufferSize)){
				//set the whole thing
				this._recordBuffers[channelNum].set(channel, offset);
			} else {
				for (var i = from; i < from + to; i++){
					var zeroed = i - from; 
					buffers[channelNum][zeroed + offset] = channel[i];				
				}
			}
		}
		this._recordBufferOffset += to;
	};	

	/**
	 *  Record for a certain period of time
	 *  
	 *  will clear the internal buffer before starting
	 *  
	 *  @param  {Tone.Time} duration 
	 *  @param  {Tone.Time} wait the wait time before recording
	 *  @param {function(Float32Array)} callback the callback to be invoked when the buffer is done recording
	 *  @returns {Tone.Recorder} `this`
	 */
	Tone.Recorder.prototype.record = function(duration, startTime, callback){
		if (this.state === RecordState.STOPPED){
			this.clear();
			this._recordBufferOffset = 0;
			startTime = this.defaultArg(startTime, 0);
			this._recordDuration = this.toSamples(duration);
			this._recordStartSample = this.toSamples("+"+startTime);
			this._recordEndSample = this._recordStartSample + this._recordDuration;
			for (var i = 0; i < this.channels; i++){
				this._recordBuffers[i] = new Float32Array(this._recordDuration);
			}
			this.state = RecordState.RECORDING;
			this._callback = this.defaultArg(callback, function(){});
		}
		return this;
	};

	/**
	 *  clears the recording buffer
	 *  @returns {Tone.PanVol} `this`
	 */
	Tone.Recorder.prototype.clear = function(){
		for (var i = 0; i < this.channels; i++){
			this._recordBuffers[i] = null;
		}
		this._recordBufferOffset = 0;
		return this;
	};


	/**
	 *  true if there is nothing in the buffers
	 *  @return {boolean} 
	 */
	Tone.Recorder.prototype.isEmpty = function(){
		return this._recordBuffers[0] === null;
	};

	/**
	 *  @return {Array<Float32Array>}
	 */
	Tone.Recorder.prototype.getFloat32Array = function(){
		if (this.isEmpty()){
			return null;
		} else {
			return this._recordBuffers;
		}
	};

	/**
	 *  @return {AudioBuffer}
	 */
	Tone.Recorder.prototype.getAudioBuffer = function(){
		if (this.isEmpty()){
			return null;
		} else {
			var audioBuffer = this.context.createBuffer(this.channels, this._recordBuffers[0].length, this.context.sampleRate);
			for (var channelNum = 0; channelNum < audioBuffer.numberOfChannels; channelNum++){
				var channel = audioBuffer.getChannelData(channelNum);
				channel.set(this._recordBuffers[channelNum]);
			}
			return audioBuffer;
		}
	};

	/**
	 *  clean up
	 *  @returns {Tone.PanVol} `this`
	 */
	Tone.Recorder.prototype.dispose = function(){
		Tone.prototype.dispose.call(this);
		this._jsNode.disconnect();
		this._jsNode.onaudioprocess = undefined;
		this._jsNode = null;
		this._recordBuffers = null;
		return this;
	};

	/**
	 *  @enum {string}
	 */
	var RecordState = {
		STOPPED : "stopped",
		SCHEDULED : "scheduled",
		RECORDING : "recording"
	};

	return Tone.Recorder;
});