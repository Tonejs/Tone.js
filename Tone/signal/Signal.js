define(["Tone/core/Tone", "Tone/signal/WaveShaper", "Tone/type/Type", "Tone/core/Param",
	"Tone/shim/ConstantSourceNode", "Tone/core/Gain"], function(Tone){

	"use strict";

	/**
	 *  @class  A signal is an audio-rate value. Tone.Signal is a core component of the library.
	 *          Unlike a number, Signals can be scheduled with sample-level accuracy. Tone.Signal
	 *          has all of the methods available to native Web Audio
	 *          [AudioParam](http://webaudio.github.io/web-audio-api/#the-audioparam-interface)
	 *          as well as additional conveniences. Read more about working with signals
	 *          [here](https://github.com/Tonejs/Tone.js/wiki/Signals).
	 *
	 *  @constructor
	 *  @extends {Tone.Param}
	 *  @param {Number|AudioParam} [value] Initial value of the signal. If an AudioParam
	 *                                     is passed in, that parameter will be wrapped
	 *                                     and controlled by the Signal.
	 *  @param {string} [units=Number] unit The units the signal is in.
	 *  @example
	 * var signal = new Tone.Signal(10);
	 */
	Tone.Signal = function(){

		var options = Tone.defaults(arguments, ["value", "units"], Tone.Signal);
		Tone.Param.call(this, options);

		/**
		* When a signal is connected to another signal or audio param,
		* this signal becomes a proxy for it
		* @type {Array}
		* @private
		*/
		this._proxies = [];

		/**
		* Indicates if the constant source was started or not
		* @private
		* @type {Boolean}
		*/
		this._sourceStarted = false;

		/**
		 * The constant source node which generates the signal
		 * @type {ConstantSourceNode}
		 * @private
		 */
		this._constantSource = this.context.createConstantSource();
		this._param = this._constantSource.offset;
		this.value = options.value;

		/**
		 * The node where the constant signal value is scaled.
		 * @type {GainNode}
		 * @private
		 */
		this.output = this._constantSource;

		/**
		 * The node where the value is set.
		 * @type {Tone.Param}
		 * @private
		 */
		this.input = this._param = this.output.offset;
	};

	Tone.extend(Tone.Signal, Tone.Param);

	/**
	 *  The default values
	 *  @type  {Object}
	 *  @static
	 *  @const
	 */
	Tone.Signal.defaults = {
		"value" : 0,
		"units" : Tone.Type.Default,
		"convert" : true,
	};

	/**
	 *  When signals connect to other signals or AudioParams,
	 *  they take over the output value of that signal or AudioParam.
	 *  For all other nodes, the behavior is the same as a default <code>connect</code>.
	 *
	 *  @override
	 *  @param {AudioParam|AudioNode|Tone.Signal|Tone} node
	 *  @param {number} [outputNumber=0] The output number to connect from.
	 *  @param {number} [inputNumber=0] The input number to connect to.
	 *  @returns {Tone.Signal} this
	 *  @method
	 */
	Tone.Signal.prototype.connect = function(node){
		//this is an optimization where this node will forward automations
		//to connected nodes without any signal if possible.
		if (this._isParam(node) && !this._sourceStarted){
			this._proxies.push(node);
			node.overridden = true;
			this._applyAutomations(node);
		} else {
			Tone.SignalBase.prototype.connect.apply(this, arguments);
			if (!this._sourceStarted){
				this._sourceStarted = true;
				this._constantSource.start(0);
			}
		}
		return this;
	};

	/**
	 * Takes a node as an argument and returns if it is a Param or AudioParam
	 * @param  {*} node The node to test
	 * @return {Boolean}
	 * @private
	 */
	Tone.Signal.prototype._isParam = function(node){
		return (Tone.Param && Tone.Param === node.constructor) ||
				node instanceof AudioParam;
	};

	/**
	 * Discard the optimization and connect all of the proxies
	 * @private
	 */
	Tone.Signal.prototype._connectProxies = function(){
		if (!this._sourceStarted){
			this._sourceStarted = true;
			this._constantSource.start(0);
		}
		this._proxies.forEach(function(proxy){
			Tone.SignalBase.prototype.connect.call(this, proxy);
			if (proxy._proxies){
				proxy._connectProxies();
			}
		}.bind(this));
	};

	/**
	 * Invoked when a node is connected to this
	 * @param  {AudioNode} from
	 * @private
	 */
	Tone.Signal.prototype._onConnect = function(from){
		if (!this._isParam(from)){
			//connect all the proxies
			this._connectProxies();
		}
	};

	/**
	 * Apply all the current automations to the given parameter
	 * @param  {AudioParam} param
	 * @private
	 */
	Tone.Signal.prototype._applyAutomations = function(param){
		var now = this.context.currentTime;
		param.cancelScheduledValues(now);
		var currentVal = this.getValueAtTime(now);
		param.setValueAtTime(currentVal, now);
		this._events.forEachFrom(now, function(event){
			param[event.type](event.value, event.time, event.constant);
		});
	};

	/**
	 * Disconnect from the given node or all nodes if no param is given.
	 * @param  {AudioNode|AudioParam} node
	 * @return {Tone.Signal}      this
	 */
	Tone.Signal.prototype.disconnect = function(node){
		if (this._proxies.includes(node)){
			var index = this._proxies.indexOf(node);
			this._proxies.splice(index, 1);
		} else if (!node){
			//no argument, disconnect everything
			this._proxies = [];
		}
		return Tone.SignalBase.prototype.disconnect.apply(this, arguments);
	};

	/**
	 * Return the current signal value at the given time.
	 * @param  {Time} time When to get the signal value
	 * @return {Number}
	 */
	Tone.Signal.prototype.getValueAtTime = function(time){
		if (this._param.getValueAtTime){
			return this._param.getValueAtTime(time);
		} else {
			return Tone.Param.prototype.getValueAtTime.call(this, time);
		}
	};

	//wrap all of the automation methods
	["setValueAtTime", "linearRampToValueAtTime", "exponentialRampToValueAtTime", "setTargetAtTime"]
		.forEach(function(method){
			var previousMethod = Tone.Signal.prototype[method];
			Tone.Signal.prototype[method] = function(){
				var args = arguments;
				previousMethod.apply(this, arguments);
				args[0] = this._fromUnits(args[0]);
				args[1] = this.toSeconds(args[1]);
				//apply it to the proxies
				this._proxies.forEach(function(signal){
					signal[method].apply(signal, args);
				});
			};
		});
	["cancelScheduledValues", "cancelAndHoldAtTime"]
		.forEach(function(method){
			var previousMethod = Tone.Signal.prototype[method];
			Tone.Signal.prototype[method] = function(){
				var args = arguments;
				previousMethod.apply(this, arguments);
				args[0] = this.toSeconds(args[0]);
				//apply it to the proxies
				this._proxies.forEach(function(signal){
					signal[method].apply(signal, args);
				});
			};
		});

	/**
	 *  dispose and disconnect
	 *  @returns {Tone.Signal} this
	 */
	Tone.Signal.prototype.dispose = function(){
		Tone.Param.prototype.dispose.call(this);
		this._constantSource.disconnect();
		this._constantSource = null;
		this._proxies = null;
		return this;
	};

	return Tone.Signal;
});
