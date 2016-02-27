define(["Tone/core/Tone", "Tone/core/Gain"], function (Tone) {

	/**
	 *  @class Tone.Zero outputs 0's at audio-rate. The reason this has to be
	 *         it's own class is that many browsers optimize out Tone.Signal
	 *         with a value of 0 and will not process nodes further down the graph. 
	 *  @extends {Tone}
	 */
	Tone.Zero = function(){

		/**
		 *  The gain node
		 *  @type  {Tone.Gain}
		 *  @private
		 */
		this._gain = this.input = this.output = new Tone.Gain();

		Tone.Zero._zeros.connect(this._gain);
	};

	Tone.extend(Tone.Zero);

	/**
	 *  clean up
	 *  @return  {Tone.Zero}  this
	 */
	Tone.Zero.prototype.dispose = function(){
		Tone.prototype.dispose.call(this);
		this._gain.dispose();
		this._gain = null;
		return this;
	};

	/**
	 *  Generates a constant output of 0. This is so 
	 *  the processing graph doesn't optimize out this
	 *  segment of the graph. 
	 *  @static
	 *  @private
	 *  @const
	 *  @type {AudioBufferSourceNode}
	 */
	Tone.Zero._zeros = null;

	/**
	 *  initializer function
	 */
	Tone._initAudioContext(function(audioContext){
		var buffer = audioContext.createBuffer(1, 128, audioContext.sampleRate);
		var arr = buffer.getChannelData(0);
		for (var i = 0; i < arr.length; i++){
			arr[i] = 0;
		}
		Tone.Zero._zeros = audioContext.createBufferSource();
		Tone.Zero._zeros.channelCount = 1;
		Tone.Zero._zeros.channelCountMode = "explicit";
		Tone.Zero._zeros.buffer = buffer;
		Tone.Zero._zeros.loop = true;
		Tone.Zero._zeros.start(0);
		Tone.Zero._zeros.noGC();
	});

	return Tone.Zero;
});