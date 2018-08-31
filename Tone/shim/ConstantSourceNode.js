define(["../core/Tone", "../shim/AudioContext", "../shim/BufferSourceNode",
	"../core/Context", "../core/Gain"], function(Tone){

	if (Tone.supported && !Tone.global.AudioContext.prototype.createConstantSource){

		var ConstantSourceNode = function(context){
			this.context = context;

			var buffer = context.createBuffer(1, 128, context.sampleRate);
			var arr = buffer.getChannelData(0);
			for (var i = 0; i < arr.length; i++){
				arr[i] = 1;
			}

			this._bufferSource = context.createBufferSource();
			this._bufferSource.channelCount = 1;
			this._bufferSource.channelCountMode = "explicit";
			this._bufferSource.buffer = buffer;
			this._bufferSource.loop = true;

			var gainNode = this._output = context.createGain();
			this.offset = gainNode.gain;

			this._bufferSource.connect(gainNode);
		};

		ConstantSourceNode.prototype.start = function(time){
			this._bufferSource.start(time);
			return this;
		};

		ConstantSourceNode.prototype.stop = function(time){
			this._bufferSource.stop(time);
			return this;
		};

		ConstantSourceNode.prototype.connect = function(){
			this._output.connect.apply(this._output, arguments);
			return this;
		};

		ConstantSourceNode.prototype.disconnect = function(){
			this._output.disconnect.apply(this._output, arguments);
			return this;
		};

		AudioContext.prototype.createConstantSource = function(){
			return new ConstantSourceNode(this);
		};

		Tone.Context.prototype.createConstantSource = function(){
			return new ConstantSourceNode(this);
		};
	}
});
