/**
 *  StartAudioContext.js
 *  @author Yotam Mann
 *  @license http://opensource.org/licenses/MIT MIT License
 *  @copyright 2016 Yotam Mann
 */
(function (root, factory) {
	if (typeof define === "function" && define.amd) {
		define([], factory);
	 } else if (typeof module === 'object' && module.exports) {
        module.exports = factory();
	} else {
		root.StartAudioContext = factory();
  }
}(this, function () {

	/**
	 * The StartAudioContext object
	 */
	var StartAudioContext = {
		/**
		 * The audio context passed in by the user
		 * @type {AudioContext}
		 */
		context : null,
		/**
		 * The TapListeners bound to the elements
		 * @type {Array}
		 * @private
		 */
		_tapListeners : [],
		/**
		 * Callbacks to invoke when the audio context is started
		 * @type {Array}
		 * @private
		 */
		_onStarted : [],
	};


	/**
	 * Set the context
	 * @param {AudioContext} ctx
	 * @returns {StartAudioContext}
	 */
	StartAudioContext.setContext = function(ctx){
		StartAudioContext.context = ctx;
		return StartAudioContext;
	};

	/**
	 * Add a tap listener to the audio context
	 * @param  {Array|Element|String|jQuery} element
	 * @returns {StartAudioContext}
	 */
	StartAudioContext.on = function(element){
		if (Array.isArray(element) || (NodeList && element instanceof NodeList)){
			for (var i = 0; i < element.length; i++){
				StartAudioContext.on(element[i]);
			}
		} else if (typeof element === "string"){
			StartAudioContext.on(document.querySelectorAll(element));
		} else if (element.jquery && typeof element.toArray === "function"){
			StartAudioContext.on(element.toArray());
		} else if (Element && element instanceof Element){
			//if it's an element, create a TapListener
			var tap = new TapListener(element, onTap);
			StartAudioContext._tapListeners.push(tap);
		} 
		return StartAudioContext;
	};

	/**
	 * Bind a callback to when the audio context is started. 
	 * @param {Function} cb
	 * @return {StartAudioContext}
	 */
	StartAudioContext.onStarted = function(cb){
		//if it's already started, invoke the callback
		if (StartAudioContext.isStarted()){
			cb();
		} else {
			StartAudioContext._onStarted.push(cb);
		}
		return StartAudioContext;
	};

	/**
	 * returns true if the context is started
	 * @return {Boolean}
	 */
	StartAudioContext.isStarted = function(){
		return (StartAudioContext.context !== null && StartAudioContext.context.state === "running");
	};

	/**
	 * @class  Listens for non-dragging tap ends on the given element
	 * @param {Element} element
	 * @internal
	 */
	var TapListener = function(element){

		this._dragged = false;

		this._element = element;

		this._bindedMove = this._moved.bind(this);
		this._bindedEnd = this._ended.bind(this);

		element.addEventListener("touchmove", this._bindedMove);
		element.addEventListener("touchend", this._bindedEnd);
		element.addEventListener("mouseup", this._bindedEnd);
	};

	/**
	 * drag move event
	 */
	TapListener.prototype._moved = function(e){
		this._dragged = true;
	};

	/**
	 * tap ended listener
	 */
	TapListener.prototype._ended = function(e){
		if (!this._dragged){
			onTap();
		}
		this._dragged = false;
	};

	/**
	 * remove all the bound events
	 */
	TapListener.prototype.dispose = function(){
		this._element.removeEventListener("touchmove", this._bindedMove);
		this._element.removeEventListener("touchend", this._bindedEnd);
		this._element.removeEventListener("mouseup", this._bindedEnd);
		this._bindedMove = null;
		this._bindedEnd = null;
		this._element = null;
	};

	/**
	 * Invoked the first time of the elements is tapped.
	 * Creates a silent oscillator when a non-dragging touchend 
	 * event has been triggered.
	 */
	function onTap(){

		//start the audio context with a silent oscillator
		if (StartAudioContext.context && !StartAudioContext.isStarted()){
			var osc = StartAudioContext.context.createOscillator();
			var silent = StartAudioContext.context.createGain();
			silent.gain.value = 0;
			osc.connect(silent);
			silent.connect(StartAudioContext.context.destination);
			var now = StartAudioContext.context.currentTime;
			osc.start(now);
			osc.stop(now+0.5);
		}

		//dispose all the tap listeners
		if (StartAudioContext._tapListeners){
			for (var i = 0; i < StartAudioContext._tapListeners.length; i++){
				StartAudioContext._tapListeners[i].dispose();
			}
			StartAudioContext._tapListeners = null;
		}
		//the onstarted callbacks
		if (StartAudioContext._onStarted){
			for (var j = 0; j < StartAudioContext._onStarted.length; j++){
				StartAudioContext._onStarted[j]();
			}
			StartAudioContext._onStarted = null;
		}
	}

	return StartAudioContext;
}));