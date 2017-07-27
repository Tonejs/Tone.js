// Adds the register preload method to Tone.js
// simply include this after Tone.js and p5.js

if (!Tone && !p5){
	throw new Error("p5.js and Tone.js need to be loaded first");
}

(function(){
	Tone.registeredPreload = function(callback){
		return function(){
			callback();
		};
	};

	var originalToneBufferLoad = Tone.Buffer.load;

	//overwrite load function
	Tone.Buffer.load = function (url, callback) {
		var handle = Tone.registeredPreload();
		return originalToneBufferLoad(url).then(function(buffer){
			handle();
			callback(buffer);
		});
	};

	p5.prototype.registerPreloadMethod("registeredPreload", Tone.Buffer.load);
}());