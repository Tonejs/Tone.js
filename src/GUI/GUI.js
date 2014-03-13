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
	}
	doSlowUpdate();

	function doFastUpdate(){
		global.requestAnimFrame(doFastUpdate);
		//remove from the updates
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
		_onFastUpdate.push(callback);
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
		_onSlowUpdateCallbacks.push(callback);
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


	///////////////////////////////////////////////////////////////////////////
	//	BORROW SOME METHODS
	///////////////////////////////////////////////////////////////////////////

	AudioUnit.GUI.prototype.defaultArg = AudioUnit.prototype.defaultArg;
	AudioUnit.GUI.prototype.equalPowerGain = AudioUnit.prototype.equalPowerGain;
	AudioUnit.GUI.prototype.dbToGain = AudioUnit.prototype.dbToGain;
	AudioUnit.GUI.prototype.gainToDb = AudioUnit.prototype.gainToDb;


	//give it to the window
	global.AudioUnit.GUI = AudioUnit.GUI;
})(window);