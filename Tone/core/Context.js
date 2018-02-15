define(["Tone/core/Tone", "Tone/core/Emitter", "Tone/core/Timeline", "Tone/shim/AudioContext"], function(Tone){

	/**
	 *  @class Wrapper around the native AudioContext.
	 *  @extends {Tone.Emitter}
	 *  @param {AudioContext=} context optionally pass in a context
	 */
	Tone.Context = function(){

		Tone.Emitter.call(this);

		var options = Tone.defaults(arguments, ["context"], Tone.Context);

		if (!options.context){
			options.context = new window.AudioContext();
			if (!options.context){
				throw new Error("could not create AudioContext. Possibly too many AudioContexts running already.");
			}
		}
		this._context = options.context;
		// extend all of the methods
		for (var prop in this._context){
			this._defineProperty(this._context, prop);
		}

		/**
		 *  The default latency hint
		 *  @type  {String}
		 *  @private
		 */
		this._latencyHint = options.latencyHint;

		/**
		 *  An object containing all of the constants AudioBufferSourceNodes
		 *  @type  {Object}
		 *  @private
		 */
		this._constants = {};

		///////////////////////////////////////////////////////////////////////
		// WORKER
		///////////////////////////////////////////////////////////////////////

		/**
		 *  The amount of time events are scheduled
		 *  into the future
		 *  @type  {Number}
		 */
		this.lookAhead = options.lookAhead;

		/**
		 *  A reference to the actual computed update interval
		 *  @type  {Number}
		 *  @private
		 */
		this._computedUpdateInterval = 0;

		/**
		 *  A reliable callback method
		 *  @private
		 *  @type  {Ticker}
		 */
		this._ticker = new Ticker(this.emit.bind(this, "tick"), options.clockSource, options.updateInterval);

		///////////////////////////////////////////////////////////////////////
		// TIMEOUTS
		///////////////////////////////////////////////////////////////////////

		/**
		 *  All of the setTimeout events.
		 *  @type  {Tone.Timeline}
		 *  @private
		 */
		this._timeouts = new Tone.Timeline();

		/**
		 *  The timeout id counter
		 *  @private
		 *  @type {Number}
		 */
		this._timeoutIds = 0;

		this.on("tick", this._timeoutLoop.bind(this));

	};

	Tone.extend(Tone.Context, Tone.Emitter);
	Tone.Emitter.mixin(Tone.Context);

	/**
	 * defaults
	 * @static
	 * @type {Object}
	 */
	Tone.Context.defaults = {
		"clockSource" : "worker",
		"latencyHint" : "interactive",
		"lookAhead" : 0.1,
		"updateInterval" : 0.03
	};

	/**
	 *  Define a property on this Tone.Context.
	 *  This is used to extend the native AudioContext
	 *  @param  {AudioContext}  context
	 *  @param  {String}  prop
	 *  @private
	 */
	Tone.Context.prototype._defineProperty = function(context, prop){
		if (Tone.isUndef(this[prop])){
			Object.defineProperty(this, prop, {
				get : function(){
					if (typeof context[prop] === "function"){
						return context[prop].bind(context);
					} else {
						return context[prop];
					}
				},
				set : function(val){
					context[prop] = val;
				}
			});
		}
	};

	/**
	 *  The current audio context time
	 *  @return  {Number}
	 */
	Tone.Context.prototype.now = function(){
		return this._context.currentTime + this.lookAhead;
	};

	/**
	 *  Promise which is invoked when the context is running.
	 *  Tries to resume the context if it's not started.
	 *  @return  {Promise}
	 */
	Tone.Context.prototype.ready = function(){
		return new Promise(function(done){
			if (this._context.state === "running"){
				done();
			} else {
				this._context.resume().then(function(){
					done();
				});
			}
		}.bind(this));
	};

	/**
	 *  Promise which is invoked when the context is running.
	 *  Tries to resume the context if it's not started.
	 *  @return  {Promise}
	 */
	Tone.Context.prototype.close = function(){
		return this._context.close().then(function(){
			Tone.Context.emit("close", this);
		}.bind(this));
	};

	/**
	 *  Generate a looped buffer at some constant value.
	 *  @param  {Number}  val
	 *  @return  {BufferSourceNode}
	 */
	Tone.Context.prototype.getConstant = function(val){
		if (this._constants[val]){
			return this._constants[val];
		} else {
			var buffer = this._context.createBuffer(1, 128, this._context.sampleRate);
			var arr = buffer.getChannelData(0);
			for (var i = 0; i < arr.length; i++){
				arr[i] = val;
			}
			var constant = this._context.createBufferSource();
			constant.channelCount = 1;
			constant.channelCountMode = "explicit";
			constant.buffer = buffer;
			constant.loop = true;
			constant.start(0);
			this._constants[val] = constant;
			return constant;
		}
	};

	/**
	 *  The private loop which keeps track of the context scheduled timeouts
	 *  Is invoked from the clock source
	 *  @private
	 */
	Tone.Context.prototype._timeoutLoop = function(){
		var now = this.now();
		while (this._timeouts && this._timeouts.length && this._timeouts.peek().time <= now){
			this._timeouts.shift().callback();
		}
	};

	/**
	 *  A setTimeout which is gaurenteed by the clock source.
	 *  Also runs in the offline context.
	 *  @param  {Function}  fn       The callback to invoke
	 *  @param  {Seconds}    timeout  The timeout in seconds
	 *  @returns {Number} ID to use when invoking Tone.Context.clearTimeout
	 */
	Tone.Context.prototype.setTimeout = function(fn, timeout){
		this._timeoutIds++;
		var now = this.now();
		this._timeouts.add({
			callback : fn,
			time : now + timeout,
			id : this._timeoutIds
		});
		return this._timeoutIds;
	};

	/**
	 *  Clears a previously scheduled timeout with Tone.context.setTimeout
	 *  @param  {Number}  id  The ID returned from setTimeout
	 *  @return  {Tone.Context}  this
	 */
	Tone.Context.prototype.clearTimeout = function(id){
		this._timeouts.forEach(function(event){
			if (event.id === id){
				this.remove(event);
			}
		});
		return this;
	};

	/**
	 *  How often the Web Worker callback is invoked.
	 *  This number corresponds to how responsive the scheduling
	 *  can be. Context.updateInterval + Context.lookAhead gives you the
	 *  total latency between scheduling an event and hearing it.
	 *  @type {Number}
	 *  @memberOf Tone.Context#
	 *  @name updateInterval
	 */
	Object.defineProperty(Tone.Context.prototype, "updateInterval", {
		get : function(){
			return this._ticker.updateInterval;
		},
		set : function(interval){
			this._ticker.updateInterval = interval;
		}
	});

	/**
	 *  What the source of the clock is, either "worker" (Web Worker [default]),
	 *  "timeout" (setTimeout), or "offline" (none).
	 *  @type {String}
	 *  @memberOf Tone.Context#
	 *  @name clockSource
	 */
	Object.defineProperty(Tone.Context.prototype, "clockSource", {
		get : function(){
			return this._ticker.type;
		},
		set : function(type){
			this._ticker.type = type;
		}
	});

	/**
	 *  The type of playback, which affects tradeoffs between audio
	 *  output latency and responsiveness.
	 *
	 *  In addition to setting the value in seconds, the latencyHint also
	 *  accepts the strings "interactive" (prioritizes low latency),
	 *  "playback" (prioritizes sustained playback), "balanced" (balances
	 *  latency and performance), and "fastest" (lowest latency, might glitch more often).
	 *  @type {String|Seconds}
	 *  @memberOf Tone.Context#
	 *  @name latencyHint
	 *  @example
	 * //set the lookAhead to 0.3 seconds
	 * Tone.context.latencyHint = 0.3;
	 */
	Object.defineProperty(Tone.Context.prototype, "latencyHint", {
		get : function(){
			return this._latencyHint;
		},
		set : function(hint){
			var lookAhead = hint;
			this._latencyHint = hint;
			if (Tone.isString(hint)){
				switch (hint){
					case "interactive" :
						lookAhead = 0.1;
						this._context.latencyHint = hint;
						break;
					case "playback" :
						lookAhead = 0.8;
						this._context.latencyHint = hint;
						break;
					case "balanced" :
						lookAhead = 0.25;
						this._context.latencyHint = hint;
						break;
					case "fastest" :
						this._context.latencyHint = "interactive";
						lookAhead = 0.01;
						break;
				}
			}
			this.lookAhead = lookAhead;
			this.updateInterval = lookAhead/3;
		}
	});

	/**
	 *  Unlike other dispose methods, this returns a Promise
	 *  which executes when the context is closed and disposed
	 *  @returns {Promise} this
	 */
	Tone.Context.prototype.dispose = function(){
		return this.close().then(function(){
			Tone.Emitter.prototype.dispose.call(this);
			this._ticker.dispose();
			this._ticker = null;
			this._timeouts.dispose();
			this._timeouts = null;
			for (var con in this._constants){
				this._constants[con].disconnect();
			}
			this._constants = null;
		}.bind(this));
	};

	/**
	 * @class A class which provides a reliable callback using either
	 *        a Web Worker, or if that isn't supported, falls back to setTimeout.
	 * @private
	 */
	var Ticker = function(callback, type, updateInterval){

		/**
		 * Either "worker" or "timeout"
		 * @type {String}
		 * @private
		 */
		this._type = type;

		/**
		 * The update interval of the worker
		 * @private
		 * @type {Number}
		 */
		this._updateInterval = updateInterval;

		/**
		 * The callback to invoke at regular intervals
		 * @type {Function}
		 * @private
		 */
		this._callback = Tone.defaultArg(callback, Tone.noOp);

		//create the clock source for the first time
		this._createClock();
	};

	/**
	 * The possible ticker types
	 * @private
	 * @type {Object}
	 */
	Ticker.Type = {
		Worker : "worker",
		Timeout : "timeout",
		Offline : "offline"
	};

	/**
	 *  Generate a web worker
	 *  @return  {WebWorker}
	 *  @private
	 */
	Ticker.prototype._createWorker = function(){

		//URL Shim
		window.URL = window.URL || window.webkitURL;

		var blob = new Blob([
			//the initial timeout time
			"var timeoutTime = "+(this._updateInterval * 1000).toFixed(1)+";" +
			//onmessage callback
			"self.onmessage = function(msg){" +
			"	timeoutTime = parseInt(msg.data);" +
			"};" +
			//the tick function which posts a message
			//and schedules a new tick
			"function tick(){" +
			"	setTimeout(tick, timeoutTime);" +
			"	self.postMessage('tick');" +
			"}" +
			//call tick initially
			"tick();"
		]);
		var blobUrl = URL.createObjectURL(blob);
		var worker = new Worker(blobUrl);

		worker.onmessage = this._callback.bind(this);

		this._worker = worker;
	};

	/**
	 * Create a timeout loop
	 * @private
	 */
	Ticker.prototype._createTimeout = function(){
		this._timeout = setTimeout(function(){
			this._createTimeout();
			this._callback();
		}.bind(this), this._updateInterval * 1000);
	};

	/**
	 * Create the clock source.
	 * @private
	 */
	Ticker.prototype._createClock = function(){
		if (this._type === Ticker.Type.Worker){
			try {
				this._createWorker();
			} catch (e){
				// workers not supported, fallback to timeout
				this._type = Ticker.Type.Timeout;
				this._createClock();
			}
		} else if (this._type === Ticker.Type.Timeout){
			this._createTimeout();
		}
	};

	/**
	 * @memberOf Ticker#
	 * @type {Number}
	 * @name updateInterval
	 * @private
	 */
	Object.defineProperty(Ticker.prototype, "updateInterval", {
		get : function(){
			return this._updateInterval;
		},
		set : function(interval){
			this._updateInterval = Math.max(interval, 128/44100);
			if (this._type === Ticker.Type.Worker){
				this._worker.postMessage(Math.max(interval * 1000, 1));
			}
		}
	});

	/**
	 * The type of the ticker, either a worker or a timeout
	 * @memberOf Ticker#
	 * @type {Number}
	 * @name type
	 * @private
	 */
	Object.defineProperty(Ticker.prototype, "type", {
		get : function(){
			return this._type;
		},
		set : function(type){
			this._disposeClock();
			this._type = type;
			this._createClock();
		}
	});

	/**
	 * Clean up the current clock source
	 * @private
	 */
	Ticker.prototype._disposeClock = function(){
		if (this._timeout){
			clearTimeout(this._timeout);
			this._timeout = null;
		}
		if (this._worker){
			this._worker.terminate();
			this._worker.onmessage = null;
			this._worker = null;
		}
	};

	/**
	 * Clean up
	 * @private
	 */
	Ticker.prototype.dispose = function(){
		this._disposeClock();
		this._callback = null;
	};

	/**
	 *  Shim all connect/disconnect and some deprecated methods which are still in
	 *  some older implementations.
	 *  @private
	 */
	Tone.getContext(function(){

		var nativeConnect = AudioNode.prototype.connect;
		var nativeDisconnect = AudioNode.prototype.disconnect;

		//replace the old connect method
		function toneConnect(B, outNum, inNum){
			if (B.input){
				inNum = Tone.defaultArg(inNum, 0);
				if (Tone.isArray(B.input)){
					return this.connect(B.input[inNum]);
				} else {
					return this.connect(B.input, outNum, inNum);
				}
			} else {
				try {
					if (B instanceof AudioNode){
						nativeConnect.call(this, B, outNum, inNum);
						return B;
					} else {
						nativeConnect.call(this, B, outNum);
						return B;
					}
				} catch (e){
					throw new Error("error connecting to node: "+B+"\n"+e);
				}
			}
		}

		//replace the old disconnect method
		function toneDisconnect(B, outNum, inNum){
			if (B && B.input && Tone.isArray(B.input)){
				inNum = Tone.defaultArg(inNum, 0);
				this.disconnect(B.input[inNum], outNum, 0);
			} else if (B && B.input){
				this.disconnect(B.input, outNum, inNum);
			} else {
				try {
					nativeDisconnect.apply(this, arguments);
				} catch (e){
					throw new Error("error disconnecting node: "+B+"\n"+e);
				}
			}
		}

		if (AudioNode.prototype.connect !== toneConnect){
			AudioNode.prototype.connect = toneConnect;
			AudioNode.prototype.disconnect = toneDisconnect;
		}
	});

	// set the audio context initially, and if one is not already created
	if (Tone.supported && !Tone.initialized){
		Tone.context = new Tone.Context();

		// log on first initialization
		// allow optional silencing of this log
		if (!window.TONE_SILENCE_VERSION_LOGGING){
			// eslint-disable-next-line no-console
			console.log("%c * Tone.js " + Tone.version + " * ", "background: #000; color: #fff");
		}
	} else if (!Tone.supported){
		// eslint-disable-next-line no-console
		console.warn("This browser does not support Tone.js");
	}

	return Tone.Context;
});
