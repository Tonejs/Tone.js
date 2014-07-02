define(["Tone/core/Tone"], function(Tone){

	/**
	 *  Threshold an incoming signal between -1 to 1
	 *
	 *  Set the threshold value such that signal above the value will equal 1, 
	 *  and below will equal 0.
	 *  
	 *  Values below 0.5 will return 0 and values above 0.5 will return 1
	 *  
	 *  @constructor
	 *  @param {number=} thresh threshold value above which the output will equal 1 
	 *                          and below which the output will equal 0
	 *                          @default 0
	 *  @extends {Tone}
	 */
	Tone.Threshold = function(thresh){
		/**
		 *  @type {WaveShaperNode}
		 *  @private
		 */
		this._thresh = this.context.createWaveShaper();

		/**
		 *  @type {WaveShaperNode}
		 */
		this.input = this.output = this._thresh;

		this._setThresh(this.defaultArg(thresh, 0));
	};

	Tone.extend(Tone.Threshold);

	/**
	 *  @param {number} thresh 
	 *  @private
	 */
	Tone.Threshold.prototype._setThresh = function(thresh){
		var curveLength = 1024;
		var curve = new Float32Array(curveLength);
		for (var i = 0; i < curveLength; i++){
			var normalized = (i / (curveLength - 1));
			var val;
			if (normalized < thresh){
				val = 0;
			} else {
				val = 1;
			}
			curve[i] = val;
		}
		this._thresh.curve = curve;
	};

	/**
	 *  dispose method
	 */
	Tone.Threshold.prototype.dispose = function(){
		this._thresh.disconnect();
		this._thresh = null;
	};

	return Tone.Threshold;
});