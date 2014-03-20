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

	//@constructor
	//@param {string=} elementType
	Tone.GUI = function(container, type){
		this.element = this.createElement(type);
		this._fastUpdateID = null;
		this._slowUpdateID = null;
		this.appendChild(container, this.element);
	}

	//BORROW SOME METHODS FROM TONE
	Tone.extend(Tone.GUI, Tone);

	///////////////////////////////////////////////////////////////////////////
	//	PRIVATE
	///////////////////////////////////////////////////////////////////////////

	//@private
	//@type {Array<Tone.GUI>}
	var _onFastUpdateCallbacks = [];

	//@private
	//@type {Array<Tone.GUI>}
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
	Tone.GUI.prototype.onAnimationFrame = function(callback, ctx){
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
	Tone.GUI.prototype.onSlowUpdate = function(callback, ctx){
		var id = getNextID();
		var callbackObj = {
			callback : callback,
			context : this.defaultArg(ctx, global),
			id : id
		}
		_onSlowUpdateCallbacks.push(callbackObj);
	}

	Tone.GUI.prototype.remove = function(){
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

	Tone.GUI.prototype.removeChildren = function(){
		if (this.element){
			var child;
			while (child = this.element.firstChild) {
				this.element.removeChild(child);
			}
		}
	}

	//@param {Element} container
	//@param {Element} element
	Tone.GUI.prototype.appendChild = function(container, element){
		this._getElement(container).appendChild(this._getElement(element));
	}

	//@param {string=} type
	Tone.GUI.prototype.createElement = function(type){
		type = this.defaultArg(type, "div");
		return document.createElement(type);
	}

	//@param {Element} element
	//@param {Element} unwraps jquery if necessary
	Tone.GUI.prototype._getElement = function(el){
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
	Tone.GUI.prototype.setClass = function(element, className){
		this._getElement(element).className = className;
	}

	//@param {string} str
	Tone.GUI.prototype.setLabel = function(str){
		if (this.label && this.label instanceof HTMLElement){
			this.label.textContent = str;
		}
	}


	//give it to the window
	global.Tone.GUI = Tone.GUI;
})(window);