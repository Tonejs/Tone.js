define(["Tone/core/Tone", "Tone/core/Emitter", "Tone/core/Timeline"], function (Tone) {

	/**
	 *  shim
	 *  @private
	 */
	if (!window.hasOwnProperty("AudioContext") && window.hasOwnProperty("webkitAudioContext")){
		window.AudioContext = window.webkitAudioContext;
	}

	/**
	 *  @class Wrapper around the native AudioContext.
	 *  @extends {Tone.Emitter}
	 *  @param {AudioContext=} context optionally pass in a context
	 */
	Tone.Context = function(context){

		Tone.Emitter.call(this);

		if (!context){
			context = new window.AudioContext();
		}
		this._context = context;
		// extend all of the methods
		for (var prop in this._context){
			this._defineProperty(this._context, prop);
		}

		/**
		 *  The default latency hint
		 *  @type  {String}
		 *  @private
		 */
		this._latencyHint = "interactive";

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
		 *  @private
		 */
		this._lookAhead = 0.1;

		/**
		 *  How often the update look runs
		 *  @type  {Number}
		 *  @private
		 */
		this._updateInterval = this._lookAhead/3;

		/**
		 *  A reference to the actual computed update interval
		 *  @type  {Number}
		 *  @private
		 */
		this._computedUpdateInterval = 0;

		/**
		 *  The web worker which is used to update Tone.Clock
		 *  @private
		 *  @type  {WebWorker}
		 */
		this._worker = this._createWorker();

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
		return this._context.currentTime;
	};

	/**
	 *  Generate a web worker
	 *  @return  {WebWorker}
	 *  @private
	 */
	Tone.Context.prototype._createWorker = function(){
		
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

		worker.addEventListener("message", function(){
			// tick the clock
			this.emit("tick");
		}.bind(this));

		//lag compensation
		worker.addEventListener("message", function(){
			var now = this.now();
			if (Tone.isNumber(this._lastUpdate)){
				var diff = now - this._lastUpdate;
				this._computedUpdateInterval = Math.max(diff, this._computedUpdateInterval * 0.97);
			}
			this._lastUpdate = now;
		}.bind(this));

		return worker;
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
		while(this._timeouts && this._timeouts.length && this._timeouts.peek().time <= now){
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
	 *  This is the time that the clock is falling behind
	 *  the scheduled update interval. The Context automatically
	 *  adjusts for the lag and schedules further in advance.
	 *  @type {Number}
	 *  @memberOf Tone.Context
	 *  @name lag
	 *  @static
	 *  @readOnly
	 */
	Object.defineProperty(Tone.Context.prototype, "lag", {
		get : function(){
			var diff = this._computedUpdateInterval - this._updateInterval;
			diff = Math.max(diff, 0);
			return diff;
		}
	});

	/**
	 *  The amount of time in advance that events are scheduled.
	 *  The lookAhead will adjust slightly in response to the 
	 *  measured update time to try to avoid clicks.
	 *  @type {Number}
	 *  @memberOf Tone.Context
	 *  @name lookAhead
	 *  @static
	 */
	Object.defineProperty(Tone.Context.prototype, "lookAhead", {
		get : function(){
			return this._lookAhead;
		},
		set : function(lA){
			this._lookAhead = lA;
		}
	});

	/**
	 *  How often the Web Worker callback is invoked.
	 *  This number corresponds to how responsive the scheduling
	 *  can be. Context.updateInterval + Context.lookAhead gives you the
	 *  total latency between scheduling an event and hearing it.
	 *  @type {Number}
	 *  @memberOf Tone.Context
	 *  @name updateInterval
	 *  @static
	 */
	Object.defineProperty(Tone.Context.prototype, "updateInterval", {
		get : function(){
			return this._updateInterval;
		},
		set : function(interval){
			this._updateInterval = Math.max(interval, Tone.prototype.blockTime);
			this._worker.postMessage(Math.max(interval * 1000, 1));
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
	 *  @static
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
				switch(hint){
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
						lookAhead = 0.01;
						break;
				}
			}
			this.lookAhead = lookAhead;
			this.updateInterval = lookAhead/3;
		}
	});

	/**
	 *  Clean up
	 *  @returns {Tone.Context} this
	 */
	Tone.Context.prototype.dispose = function(){
		Tone.Emitter.prototype.dispose.call(this);
		this._worker = null;
		this._timeouts.dispose();
		this._timeouts = null;
		for(var con in this._constants){
			this._constants[con].disconnect();
		}
		this._constants = null;
		this.close();
		return this;
	};

	/**
	 *  Shim all connect/disconnect and some deprecated methods which are still in
	 *  some older implementations.
	 *  @private
	 */
	function shimConnect(){

		var nativeConnect = AudioNode.prototype.connect;
		var nativeDisconnect = AudioNode.prototype.disconnect;

		//replace the old connect method
		function toneConnect(B, outNum, inNum){
			if (B.input){
				if (Array.isArray(B.input)){
					if (Tone.isUndef(inNum)){
						inNum = 0;
					}
					this.connect(B.input[inNum]);
				} else {
					this.connect(B.input, outNum, inNum);
				}
			} else {
				try {
					if (B instanceof AudioNode){
						nativeConnect.call(this, B, outNum, inNum);
					} else {
						nativeConnect.call(this, B, outNum);
					}
				} catch (e) {
					throw new Error("error connecting to node: "+B+"\n"+e);
				}
			}
		}

		//replace the old disconnect method
		function toneDisconnect(B, outNum, inNum){
			if (B && B.input && Array.isArray(B.input)){
				if (Tone.isUndef(inNum)){
					inNum = 0;
				}
				this.disconnect(B.input[inNum], outNum, inNum);
			} else if (B && B.input){
				this.disconnect(B.input, outNum, inNum);
			} else {
				try {
					nativeDisconnect.apply(this, arguments);
				} catch (e) {
					throw new Error("error disconnecting node: "+B+"\n"+e);
				}
			}
		}

		if (AudioNode.prototype.connect !== toneConnect){
			AudioNode.prototype.connect = toneConnect;
			AudioNode.prototype.disconnect = toneDisconnect;
		}
	}

	// set the audio context initially
	if (Tone.supported){
		shimConnect();
		Tone.context = new Tone.Context();
	} else {
		console.warn("This browser does not support Tone.js");
	}

	return Tone.Context;
});