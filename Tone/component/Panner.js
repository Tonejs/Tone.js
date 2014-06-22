define(["Tone/core/Tone", "Tone/component/DryWet", "Tone/signal/Merge", "Tone/signal/Split"], 
function(Tone){

	/**
	 *  Panner. 
	 *  
	 *  Equal Power Gain L/R Panner. Not 3D
	 *  
	 *  a panner uses a dry/wet knob internally
	 *
	 *  0 = 100% Left
	 *  1 = 100% Right
	 *  
	 *  @constructor
	 *  @extends {Tone}
	 *  @param {number=} initialPan the initail panner value (defaults to 0.5 = center)
	 */
	Tone.Panner = function(initialPan){
		
		Tone.call(this);

		/**
		 *  the dry/wet knob
		 *  @type {Tone.DryWet}
		 *  @private
		 */
		this._dryWet = new Tone.DryWet();
		/**
		 *  @type {Tone.Merge}
		 *  @private
		 */
		this._merger = new Tone.Merge();
		/**
		 *  @type {Tone.Split}
		 *  @private
		 */
		this._splitter = new Tone.Split();
		/**
		 *  the pan control
		 *  @type {Tone.Signal}
		 */	
		this.panControl = this._dryWet.wetness;

		//CONNECTIONS:
		this.input.connect(this._splitter.left);
		this.input.connect(this._splitter.right);
		//left channel is dry, right channel is wet
		this._splitter.left.connect(this._dryWet.dry);
		this._splitter.right.connect(this._dryWet.wet);
		//merge it back together
		this._dryWet.dry.connect(this._merger.left);
		this._dryWet.wet.connect(this._merger.right);
		this._merger.connect(this.output);

		//initial value
		this.setPan(this.defaultArg(initialPan, 0.5));
	};

	Tone.extend(Tone.Panner);

	/**
	 *  set the l/r pan.
	 *  
	 *  0 = 100% left.
	 *  1 = 100% right.
	 *  
	 *  @param {number} pan 0-1
	 *  @param {Tone.Time=} rampTime (optionally) ramp to the pan position
	 */
	Tone.Panner.prototype.setPan = function(pan, rampTime){
		this._dryWet.setWet(pan, rampTime);
	};

	/**
	 *  clean up
	 */
	Tone.Panner.prototype.dispose = function(){
		this._dryWet.dispose();
		this._splitter.dispose();
		this._merger.dispose();
		this.input.disconnect();
		this.output.disconnect();
		this._dryWet = null;
		this._splitter = null;
		this._merger = null;
		this.input = null;
		this.output = null;
	};

	return Tone.Panner;
});