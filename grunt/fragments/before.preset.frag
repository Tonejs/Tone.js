(function (root) {
	//AMD shim for the presets build
	if (typeof define !== "function" && 
		typeof root.Tone === "function") {
		//define 'define' to invoke the callbacks with Tone
		root.ToneDefinedDefine = true;
		root.define = function(){
			//the last argument is the callback
			var lastArg = arguments[arguments.length - 1];
			//the first argument is the dependencies or name
			if (typeof lastArg === "function"){
				//if it's not the root, pass in the root
				//as the parameter
				lastArg(root.Tone);
			}
		};
	}
} (this));

