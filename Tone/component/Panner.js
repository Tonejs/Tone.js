define(["Tone/core/Tone", "Tone/component/CrossFade", "Tone/component/Merge", "Tone/component/Split", 
	"Tone/signal/Signal", "Tone/signal/AudioToGain", "Tone/signal/Zero"], 
function(Tone){

	"use strict";

	/**
	 *  @class  Tone.Panner is an equal power Left/Right Panner and does not
	 *          support 3D. Panner uses the StereoPannerNode when available. 
	 *  
	 *  @constructor
	 *  @extends {Tone}
	 *  @param {NormalRange} [initialPan=0] The initail panner value (defaults to 0 = center)
	 *  @example
	 *  //pan the input signal hard right. 
	 *  var panner = new Tone.Panner(1);
	 */
	Tone.Panner = function(initialPan){

		if (this._hasStereoPanner){

			/**
			 *  the panner node
			 *  @type {StereoPannerNode}
			 *  @private
			 */
			this._panner = this.input = this.output = this.context.createStereoPanner();

			/**
			 *  The pan control. -1 = hard left, 1 = hard right. 
			 *  @type {NormalRange}
			 *  @signal
			 */	
			this.pan = this._panner.pan;
			
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
			 *  The pan control. -1 = hard left, 1 = hard right. 
			 *  @type {AudioRange}
			 *  @signal
			 */	
			this.pan = new Tone.Signal(0, Tone.Type.AudioRange);

			/**
			 *  always sends 0
			 *  @type {Tone.Zero}
			 *  @private
			 */
			this._zero = new Tone.Zero();

			/**
			 *  The analog to gain conversion
			 *  @type  {Tone.AudioToGain}
			 *  @private
			 */
			this._a2g = new Tone.AudioToGain();

			//CONNECTIONS:
			this._zero.connect(this._a2g);
			this.pan.chain(this._a2g, this._crossFade.fade);
			//left channel is a, right channel is b
			this._splitter.connect(this._crossFade, 0, 0);
			this._splitter.connect(this._crossFade, 1, 1);
			//merge it back together
			this._crossFade.a.connect(this._merger, 0, 0);
			this._crossFade.b.connect(this._merger, 0, 1);
		}
		//initial value
		this.pan.value = this.defaultArg(initialPan, 0);
		this._readOnly("pan");
	};

	Tone.extend(Tone.Panner);

	/**
	 *  indicates if the panner is using the new StereoPannerNode internally
	 *  @type  {boolean}
	 *  @private
	 */
	Tone.Panner.prototype._hasStereoPanner = Tone.prototype.isFunction(Tone.context.createStereoPanner);

	/**
	 *  Clean up.
	 *  @returns {Tone.Panner} this
	 */
	Tone.Panner.prototype.dispose = function(){
		Tone.prototype.dispose.call(this);
		this._writable("pan");
		if (this._hasStereoPanner){
			this._panner.disconnect();
			this._panner = null;
			this.pan = null;
		} else {
			this._zero.dispose();
			this._zero = null;
			this._crossFade.dispose();
			this._crossFade = null;
			this._splitter.dispose();
			this._splitter = null;
			this._merger.dispose();
			this._merger = null;
			this.pan.dispose();
			this.pan = null;
			this._a2g.dispose();
			this._a2g = null;
		}
		return this;
	};

	return Tone.Panner;
});