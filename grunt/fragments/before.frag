(function (root) {
	// Tone.js can run with or without requirejs
	//
	// this anonymous function checks to see if the 'define'
	// method exists, if it does not (and there is not already
	// a function called Tone) it will create a function called
	// 'define'. 'define' will invoke the 'core' module and attach
	// its return value to the root. for all other modules
	// Tone will be passed in as the argument.
	if (typeof define !== "function" && 
		typeof root.Tone !== "function") {
		//define 'define' to invoke the callbacks with Tone
		var define = function(){
			//the last argument is the callback
			var lastArg = arguments[arguments.length - 1];
			//the first argument is the dependencies or name
			var firstArg = arguments[0];
			if (firstArg === "Tone/core/Tone"){
				//create the root object
				root.Tone = lastArg();
			} else if (typeof lastArg === "function"){
				//if it's not the root, pass in the root
				//as the parameter
				lastArg(root.Tone);
			}
		};
	}