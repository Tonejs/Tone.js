AudioUnit.GUI = function(){
	this._allGUIs.push(this);
	this.hello = "hiHI";
}

AudioUnit.GUI.prototype._allGUIs = [];

AudioUnit.GUI.prototype._doUpdate = function(){
	requestAnimationFrame(this.doUpdate.bind(this));
	for (var i = 0; i < this._allGUIs.length; i++){
		
	}
}

AudioUnit.GUI.prototype.dispose = function(){
	//remove the element

	//remove it from GUIs
}