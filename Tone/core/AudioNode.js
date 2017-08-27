define(["Tone/core/Tone", "Tone/core/Context"], function (Tone) {

	/**
	 *  @class Tone.AudioNode is a base class for classes which process audio.
	 *         AudioNodes have inputs and outputs.
	 *  @param	{AudioContext=} context	The audio context to use with the class
	 *  @extends {Tone}
	 */
	Tone.AudioNode = function(){
		Tone.call(this);

		//use the default context if one is not passed in
		var options = Tone.defaults(arguments, ["context"], {
			"context" : Tone.context
		});

		/**
		 * The AudioContext of this instance
		 * @private
		 * @type {AudioContext}
		 */
		this._context = options.context;
	};

	Tone.extend(Tone.AudioNode);

	/**
	 * Get the audio context belonging to this instance.
	 * @type {AudioNode}
	 * @memberOf Tone.AudioNode#
	 * @name context
	 * @readOnly
	 */
	Object.defineProperty(Tone.AudioNode.prototype, "context", {
		get : function(){
			return this._context;
		}
	});

	/**
	 *  Create input and outputs for this object.
	 *  @param  {Number}  [input=0]   The number of inputs
	 *  @param  {Number}  [outputs=0]  The number of outputs
	 *  @return  {Tone}  this
	 *  @private
	 */
	Tone.AudioNode.prototype.createInsOuts = function(inputs, outputs){

		if (inputs === 1){
			this.input = this.context.createGain();
		} else if (inputs > 1){
			this.input = new Array(inputs);
		}

		if (outputs === 1){
			this.output = this.context.createGain();
		} else if (outputs > 1){
			this.output = new Array(outputs);
		}
	};

	/**
	 *  The number of inputs feeding into the AudioNode.
	 *  For source nodes, this will be 0.
	 *  @memberOf Tone#
	 *  @type {Number}
	 *  @name numberOfInputs
	 *  @readOnly
	 */
	Object.defineProperty(Tone.AudioNode.prototype, "numberOfInputs", {
		get : function(){
			if (this.input){
				if (Tone.isArray(this.input)){
					return this.input.length;
				} else {
					return 1;
				}
			} else {
				return 0;
			}
		}
	});

	/**
	 *  The number of outputs coming out of the AudioNode.
	 *  @memberOf Tone#
	 *  @type {Number}
	 *  @name numberOfOutputs
	 *  @readOnly
	 */
	Object.defineProperty(Tone.AudioNode.prototype, "numberOfOutputs", {
		get : function(){
			if (this.output){
				if (Tone.isArray(this.output)){
					return this.output.length;
				} else {
					return 1;
				}
			} else {
				return 0;
			}
		}
	});

	/**
	 * Dispose and disconnect
	 * @return {Tone.AudioNode} this
	 */
	Tone.AudioNode.prototype.dispose = function () {
		if (!Tone.isUndef(this.input)){
			if (this.input instanceof AudioNode){
				this.input.disconnect();
			}
			this.input = null;
		}
		if (!Tone.isUndef(this.output)){
			if (this.output instanceof AudioNode){
				this.output.disconnect();
			}
			this.output = null;
		}
		this._context = null;
		return this;
	};

	return Tone.AudioNode;
});
