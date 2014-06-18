define(["Tone/core/Tone", "Tone/core/Master"], function(Tone){

	/**
	 *  Record an input into an array or AudioBuffer
	 *
	 *  it is limited in that the recording length needs to be known beforehand
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
		 *  @private
		 *  @type {number}
		 */
		this._recordBufferOffset = 0;

		//connect it up
		this.input.connect(this._jsNode);
		//pass thru audio
		this.input.connect(this.output);
		//so it doesn't get garbage collected
		this._jsNode.toMaster();
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
		if (this._recordBuffers[0] === null || this._recordBuffers[0].length - this._recordBufferOffset === 0){
			return;
		}
		var input = event.inputBuffer;
		var totalWrittenToBuffer = 0;
		var recordBufferLength = this._recordBuffers[0].length;
		for (var channelNum = 0; channelNum < input.numberOfChannels; channelNum++){
			var bufferOffset = this._recordBufferOffset;
			var channel = input.getChannelData(channelNum);
			var bufferLen = channel.length;
			if (recordBufferLength - bufferOffset > bufferLen){
				this._recordBuffers[channelNum].set(channel, bufferOffset);
				totalWrittenToBuffer += bufferLen;
			} else {
				for (var i = 0; i < bufferLen; i++) {
					if (recordBufferLength > bufferOffset){
						this._recordBuffers[channelNum][bufferOffset] = channel[i];
						bufferOffset++;
						totalWrittenToBuffer++;
					} else {
						break;
					}
				}
			}
		}
		this._recordBufferOffset += totalWrittenToBuffer / input.numberOfChannels;
	};

	/**
	 *  Record for a certain period of time
	 *  
	 *  will clear the internal buffer before starting
	 *  
	 *  @param  {Tone.Time} time 
	 */
	Tone.Recorder.prototype.record = function(time){
		this.clear();
		var recordBufferLength = this.toSamples(time);
		for (var i = 0; i < this.channels; i++){
			this._recordBuffers[i] = new Float32Array(recordBufferLength);
		}
	};

	/**
	 *  clears the recording buffer
	 */
	Tone.Recorder.prototype.clear = function(){
		for (var i = 0; i < this.channels; i++){
			this._recordBuffers[i] = null;
		}
		this._recordBufferOffset = 0;
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


	return Tone.Recorder;
});