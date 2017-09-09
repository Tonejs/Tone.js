define(["Tone/core/Tone", "Tone/core/Context"], function (Tone) {

	/**
	 *  @class Tone.AudioNode is the base class for classes which process audio.
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
	 * @type {Tone.Context}
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
	 *  @return  {Tone.AudioNode}  this
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
	 *  connect the output of a ToneNode to an AudioParam, AudioNode, or ToneNode
	 *  @param  {Tone | AudioParam | AudioNode} unit
	 *  @param {number} [outputNum=0] optionally which output to connect from
	 *  @param {number} [inputNum=0] optionally which input to connect to
	 *  @returns {Tone.AudioNode} this
	 */
	Tone.AudioNode.prototype.connect = function(unit, outputNum, inputNum){
		if (Tone.isArray(this.output)){
			outputNum = Tone.defaultArg(outputNum, 0);
			this.output[outputNum].connect(unit, 0, inputNum);
		} else {
			this.output.connect(unit, outputNum, inputNum);
		}
		return this;
	};

	/**
	 *  disconnect the output
	 *  @param {Number|AudioNode} output Either the output index to disconnect
	 *                                   if the output is an array, or the
	 *                                   node to disconnect from.
	 *  @returns {Tone.AudioNode} this
	 */
	Tone.AudioNode.prototype.disconnect = function(destination, outputNum, inputNum){
		if (Tone.isArray(this.output)){
			if (Tone.isNumber(destination)){
				this.output[destination].disconnect();
			} else {
				outputNum = Tone.defaultArg(outputNum, 0);
				this.output[outputNum].disconnect(destination, 0, inputNum);
			}
		} else {
			this.output.disconnect.apply(this.output, arguments);
		}
	};

	/**
	 *  Connect the output of this node to the rest of the nodes in series.
	 *  @example
	 *  //connect a node to an effect, panVol and then to the master output
	 *  node.chain(effect, panVol, Tone.Master);
	 *  @param {...AudioParam|Tone|AudioNode} nodes
	 *  @returns {Tone.AudioNode} this
	 *  @private
	 */
	Tone.AudioNode.prototype.chain = function(){
		var currentUnit = this;
		for (var i = 0; i < arguments.length; i++){
			var toUnit = arguments[i];
			currentUnit.connect(toUnit);
			currentUnit = toUnit;
		}
		return this;
	};

	/**
	 *  connect the output of this node to the rest of the nodes in parallel.
	 *  @param {...AudioParam|Tone|AudioNode} nodes
	 *  @returns {Tone.AudioNode} this
	 *  @private
	 */
	Tone.AudioNode.prototype.fan = function(){
		for (var i = 0; i < arguments.length; i++){
			this.connect(arguments[i]);
		}
		return this;
	};

	if (window.AudioNode){
		//give native nodes chain and fan methods
		AudioNode.prototype.chain = Tone.AudioNode.prototype.chain;
		AudioNode.prototype.fan = Tone.AudioNode.prototype.fan;
	}

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
