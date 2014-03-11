///////////////////////////////////////////////////////////////////////////////
//
//	WEB AUDIO
//
///////////////////////////////////////////////////////////////////////////////

(function(global){

	//ALIAS
	if (!global.AudioContext){
		global.AudioContext = global.webkitAudioContext;
	} 

	var audioContext;
	if (global.AudioContext){
		audioContext = new global.AudioContext();
	}

	///////////////////////////////////////////////////////////////////////////
	//	WEB AUDIO
	///////////////////////////////////////////////////////////////////////////
	var WebAudio = function(){
		this.context = audioContext;
	}

	//inherit all of the methods from audioContext
	for (var fn in audioContext){
		WebAudio.prototype[fn] = function(){
			var closedFn = fn;
			return function(){
				return audioContext[closedFn].apply(audioContext, arguments);
			}
		}();
	}

	//other attributes
	var attributes = ["sampleRate", "currentTime", "destination", "listener"];
	for (var i = 0; i < attributes.length; i++){
		Object.defineProperty(WebAudio.prototype, attributes[i], function(){
			var closedAttr = attributes[i];
			return {
				get : function(){
					return audioContext[closedAttr];
				}
			}
		}());
	}

	//ALIASES
	WebAudio.prototype.output = WebAudio.prototype.destination;
	//now == currentTime;
	Object.defineProperty(WebAudio.prototype, "now", {
		get : function(){
			return audioContext["currentTime"];
		}
	});

	///////////////////////////////////////////////////////////////////////////
	//	SHIMS
	///////////////////////////////////////////////////////////////////////////
	if (typeof WebAudio.prototype.createGain !== "function"){
		WebAudio.prototype.createGain = audioContext.createGainNode;
	}
	if (typeof WebAudio.prototype.createDelay !== "function"){
		WebAudio.prototype.createDelay = audioContext.createDelayNode;
	}
	//normalize buffer source API
	WebAudio.prototype.createBufferSource = function(){
		var source = audioContext.createBufferSource();
		if (typeof source.start !== "function"){
			source.start = source.noteGrainOn;
		}
		if (typeof source.stop !== "function"){
			source.stop = source.noteOff;
		}
		return source;
	}
	//normalize oscillator API
	WebAudio.prototype.createOscillator = function(){
		var oscillator = audioContext.createOscillator();
		if (typeof oscillator.start !== "function"){
			oscillator.start = oscillator.noteOn;
		}
		if (typeof oscillator.stop !== "function"){
			oscillator.stop = oscillator.noteOff;
		}
		return oscillator;
	}

	///////////////////////////////////////////////////////////////////////////
	//	DEFAULTS
	///////////////////////////////////////////////////////////////////////////

	WebAudio.prototype.fadeTime  = .001; //1ms
	WebAudio.prototype.bufferSize = 1024;

	///////////////////////////////////////////////////////////////////////////
	//	METHODS
	///////////////////////////////////////////////////////////////////////////

	WebAudio.prototype.isSupported = function(){
		return audioContext !== undefined;
	}
	
	//A extends B
	WebAudio.prototype.extend = function(A, B){
		A.prototype = new B();
		A.prototype.constructor = A;
	}

	//make it global
	global.WebAudio = new WebAudio();
})(window);
