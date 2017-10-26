define(["Tone/core/Tone", "Tone/signal/WaveShaper", "Tone/component/Merge", "Tone/signal/Zero",
	"Tone/component/Split", "Tone/core/Gain", "Tone/signal/Signal", "Tone/core/Context"], function(Tone){

	if (Tone.supported && !window.StereoPannerNode){

		/**
		 * @class Shimmed StereoPannerNode
		 * @param  {AudioContext} context
		 * @private
		 */
		var StereoPannerNode = function(context){

			/**
			 * The audio context
			 * @type {AudioContext}
			 */
			this.context = context;

			/**
			 * The left/right panning. [-1, 1]
			 * @type {AudioRange}
			 * @signal
			 */
			this.pan = new Tone.Signal(0, Tone.Type.AudioRange);

			/**
			 * Equal power scaling of the right gain
			 * @type {Tone.WaveShaper}
			 */
			var rightWaveShaper = new Tone.WaveShaper(function(val){
				return Tone.equalPowerScale((val+1)/2);
			}, 4096);

			/**
			 * Equal power scaling of the left gain
			 * @type {Tone.WaveShaper}
			 * @private
			 */
			var leftWaveShaper = new Tone.WaveShaper(function(val){
				return Tone.equalPowerScale(1 - (val+1)/2);
			}, 4096);

			/**
			 * The left gain value
			 * @type {Tone.Gain}
			 * @private
			 */
			var leftGain = new Tone.Gain();

			/**
			 * The right gain value
			 * @type {Tone.Gain}
			 * @private
			 */
			var rightGain = new Tone.Gain();

			/**
			 * Split the incoming signal
			 * @type {Tone.Split}
			 * @private
			 */
			var split = this.input = new Tone.Split();

			/**
			 * Keeps the waveshapers from optimizing 0s
			 * @type {Tone.Zero}
			 * @private
			 */
			var zero = new Tone.Zero();
			zero.fan(rightWaveShaper, leftWaveShaper);

			/**
			 * Merge the outgoing signal
			 * @type {Tone.Merge}
			 * @private
			 */
			var merge = this.output = new Tone.Merge();

			//connections
			split.left.chain(leftGain, merge.left);
			split.right.chain(rightGain, merge.right);
			this.pan.chain(leftWaveShaper, leftGain.gain);
			this.pan.chain(rightWaveShaper, rightGain.gain);
		};

		StereoPannerNode.prototype.disconnect = function(){
			this.output.disconnect.apply(this.output, arguments);
		};

		StereoPannerNode.prototype.connect = function(){
			this.output.connect.apply(this.output, arguments);
		};

		//add it to the AudioContext
		AudioContext.prototype.createStereoPanner = function(){
			return new StereoPannerNode(this);
		};
		Tone.Context.prototype.createStereoPanner = function(){
			return new StereoPannerNode(this);
		};
	}

});
