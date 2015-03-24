define(["Tone/core/Tone", "Tone/component/CrossFade", "Tone/component/Merge", 
	"Tone/component/Split", "Tone/signal/Signal", "Tone/signal/WaveShaper"], 
function(Tone){

	"use strict";

	/**
	 *  Panner. 
	 *  
	 *  @class  Equal Power Gain L/R Panner. Not 3D. 
	 *          0 = 100% Left
	 *          1 = 100% Right
	 *  
	 *  @constructor
	 *  @extends {Tone}
	 *  @param {number} [initialPan=0.5] the initail panner value (defaults to 0.5 = center)
	 *  @example
	 *  var panner = new Tone.Panner(1);
	 *  // ^ pan the input signal hard right. 
	 */
	Tone.Panner = function(initialPan){

		Tone.call(this);

		/**
		 *  indicates if the panner is using the new StereoPannerNode internally
		 *  @type  {boolean}
		 *  @private
		 */
		this._hasStereoPanner = this.isFunction(this.context.createStereoPanner);

		if (this._hasStereoPanner){

			/**
			 *  the panner node
			 *  @type {StereoPannerNode}
			 *  @private
			 */
			this._panner = this.input = this.output = this.context.createStereoPanner();

			/**
			 *  the pan control
			 *  @type {Tone.Signal}
			 */	
			this.pan = new Tone.Signal(0, Tone.Signal.Units.Normal);

			/**
			 *  scale the pan signal to between -1 and 1
			 *  @type {Tone.WaveShaper}
			 *  @private
			 */
			this._scalePan = new Tone.WaveShaper([-1, -1, 1]);

			//connections
			this.pan.chain(this._scalePan, this._panner.pan);
			
		} else {

			/**
			 *  the dry/wet knob
			 *  @type {Tone.CrossFade}
			 *  @private
			 */
			this._crossFade = new Tone.CrossFade();
			
			/**
			 *  @type {Tone.Merge}
			 *  @private
			 */
			this._merger = this.output = new Tone.Merge();
			
			/**
			 *  @type {Tone.Split}
			 *  @private
			 */
			this._splitter = this.input = new Tone.Split();
			
			/**
			 *  the pan control
			 *  @type {Tone.Signal}
			 */	
			this.pan = this._crossFade.fade;

			//CONNECTIONS:
			//left channel is a, right channel is b
			this._splitter.connect(this._crossFade, 0, 0);
			this._splitter.connect(this._crossFade, 1, 1);
			//merge it back together
			this._crossFade.a.connect(this._merger, 0, 0);
			this._crossFade.b.connect(this._merger, 0, 1);
		}

		//initial value
		this.pan.value = this.defaultArg(initialPan, 0.5);
	};

	Tone.extend(Tone.Panner);

	/**
	 *  clean up
	 *  @returns {Tone.Panner} `this`
	 */
	Tone.Panner.prototype.dispose = function(){
		Tone.prototype.dispose.call(this);
		if (this._hasStereoPanner){
			this._panner.disconnect();
			this._panner = null;
			this.pan.dispose();
			this.pan = null;
			this._scalePan.dispose();
			this._scalePan = null;
		} else {
			this._crossFade.dispose();
			this._crossFade = null;
			this._splitter.dispose();
			this._splitter = null;
			this._merger.dispose();
			this._merger = null;
			this.pan = null;
		}
		return this;
	};

	return Tone.Panner;
});