define(["Tone/core/Tone", "Tone/shim/AudioContext"], function(Tone){

	if (Tone.supported){

		//fixes safari only bug which is still present in 11
		var ua = navigator.userAgent.toLowerCase();
		var isSafari = ua.includes("safari") && !ua.includes("chrome");
		if (isSafari){

			var WaveShaperNode = function(context){

				this._internalNode = this.input = this.output = context._native_createWaveShaper();

				this._curve = null;

				for (var prop in this._internalNode){
					this._defineProperty(this._internalNode, prop);
				}
			};

			Object.defineProperty(WaveShaperNode.prototype, "curve", {
				get : function(){
					return this._curve;
				},
				set : function(curve){
					this._curve = curve;
					var array = new Float32Array(curve.length+1);
					array.set(curve, 1);
					array[0] = curve[0];
					this._internalNode.curve = array;
				}
			});

			WaveShaperNode.prototype._defineProperty = function(context, prop){
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

			AudioContext.prototype._native_createWaveShaper = AudioContext.prototype.createWaveShaper;
			AudioContext.prototype.createWaveShaper = function(){
				return new WaveShaperNode(this);
			};
		}
	}

});
