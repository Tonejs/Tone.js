//paul irish polyfill
window.requestAnimFrame = (function(){
  return  window.requestAnimationFrame       ||
          window.webkitRequestAnimationFrame ||
          window.mozRequestAnimationFrame    ||
          function( callback ){
            window.setTimeout(callback, 1000 / 60);
          };
})();

///////////////////////////////////////////////////////////////////////////////
//
//	GUI
//
// 	base class for GUI
///////////////////////////////////////////////////////////////////////////////

(function(global){

	AudioUnit.GUI = function(){
		this.element = null;
		this._fastUpdateID = null;
		this._slowUpdateID = null;
	}

	///////////////////////////////////////////////////////////////////////////
	//	PRIVATE
	///////////////////////////////////////////////////////////////////////////

	//@private
	//@type {Array<AudioUnit.GUI>}
	var _onFastUpdateCallbacks = [];

	//@private
	//@type {Array<AudioUnit.GUI>}
	var _onSlowUpdateCallbacks = [];

	//@private
	//@type {number}
	var IdIndex = 0;

	//@returns {number}
	function getNextID(){
		IdIndex++;
		return IdIndex.toString();
	}

	function doSlowUpdate(){
		setTimeout(doSlowUpdate, 250);
		for (var i = 0; i < _onSlowUpdateCallbacks.length; i++){
			var cback = _onSlowUpdateCallbacks[i];
			cback.callback.call(cback.context);
		}
	}
	doSlowUpdate();

	function doFastUpdate(){
		global.requestAnimFrame(doFastUpdate);
		for (var i = 0; i < _onFastUpdateCallbacks.length; i++){
			var cback = _onFastUpdateCallbacks[i];
			cback.callback.call(cback.context);
		}
	}
	doFastUpdate();

	///////////////////////////////////////////////////////////////////////////
	//	CLASS METHODS
	///////////////////////////////////////////////////////////////////////////

	//callback gets envoked at 60fps
	//@param {function()} callback
	//@param {Object} ctx (the "this" object)
	AudioUnit.GUI.prototype.onAnimationFrame = function(callback, ctx){
		var id = getNextID();
		var callbackObj = {
			callback : callback,
			context : this.defaultArg(ctx, global),
			id : id
		}
		_onFastUpdateCallbacks.push(callbackObj);
	}

	//callback gets envoked at 60fps
	//@param {function()} callback
	//@param {Object} ctx (the "this" object)
	AudioUnit.GUI.prototype.onSlowUpdate = function(callback, ctx){
		var id = getNextID();
		var callbackObj = {
			callback : callback,
			context : this.defaultArg(ctx, global),
			id : id
		}
		_onSlowUpdateCallbacks.push(callbackObj);
	}

	AudioUnit.GUI.prototype.remove = function(){
		if (this.element !== null){
			this.removeChildren();
			this.element.remove();
		}
		//remove from the updates
		for (var i = 0; i < _onSlowUpdateCallbacks.length; i++){
			if (_onSlowUpdateCallbacks[i].id === this._slowUpdateID){
				_onSlowUpdateCallbacks.splice(i, 1);
			}	
		}
		for (var i = 0; i < _onFastUpdateCallbacks.length; i++){
			if (_onFastUpdateCallbacks[i].id === this._fastUpdateID){
				_onFastUpdateCallbacks.splice(i, 1);
			}	
		}

	}

	///////////////////////////////////////////////////////////////////////////
	//	UTILITIES
	///////////////////////////////////////////////////////////////////////////

	AudioUnit.GUI.prototype.removeChildren = function(){
		if (this.element){
			var child;
			while (child = this.element.firstChild) {
				this.element.removeChild(child);
			}
		}
	}

	//@param {Element} container
	//@param {Element} element
	AudioUnit.GUI.prototype.appendChild = function(container, element){
		this._getElement(container).appendChild(this._getElement(element));
	}

	//@param {string=} type
	AudioUnit.GUI.prototype.createElement = function(type){
		type = this.defaultArg(type, "div");
		return document.createElement(type);
	}

	//@param {Element} element
	//@param {Element} unwraps jquery if necessary
	AudioUnit.GUI.prototype._getElement = function(el){
		if (typeof jQuery !== 'undefined' && el instanceof jQuery){
			return el[0];
		} else if (el.element && meterGui.element instanceof HTMLElement){
			return el.element
		} else {
			return el;
		}
	}

	//@param {Element} element
	//@param {string} className
	AudioUnit.GUI.prototype.setClass = function(element, className){
		this._getElement(element).className = className;
	}

	//@param {string} str
	AudioUnit.GUI.prototype.setLabel = function(str){
		if (this.label && this.label instanceof HTMLElement){
			this.label.textContent = str;
		}
	}


	///////////////////////////////////////////////////////////////////////////
	//	BORROW SOME METHODS
	///////////////////////////////////////////////////////////////////////////

	AudioUnit.GUI.prototype.defaultArg = AudioUnit.prototype.defaultArg;
	AudioUnit.GUI.prototype.equalPowerGain = AudioUnit.prototype.equalPowerGain;
	AudioUnit.GUI.prototype.dbToGain = AudioUnit.prototype.dbToGain;
	AudioUnit.GUI.prototype.gainToDb = AudioUnit.prototype.gainToDb;
	AudioUnit.GUI.prototype.gainToLogScale = AudioUnit.prototype.gainToLogScale;
	AudioUnit.GUI.prototype.gainToPowScale = AudioUnit.prototype.gainToPowScale;
	AudioUnit.GUI.prototype.interpolate = AudioUnit.prototype.interpolate;
	AudioUnit.GUI.prototype.normalize = AudioUnit.prototype.normalize;


	//give it to the window
	global.AudioUnit.GUI = AudioUnit.GUI;
})(window);