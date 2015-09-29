	//UMD
	if ( typeof define === "function" && define.amd ) {
		define( "Tone", [], function() {
			return Tone;
		});
	} else if (typeof module === "object") {
		module.exports = Tone;
 	} else {
		root.Tone = Tone;
	}


	///////////////////////////////////////////////////////////////////////////
	//	P5 SHIM
	///////////////////////////////////////////////////////////////////////////

	Tone.registeredPreload = function(callback){
		return function(){
			callback();
		}
	};

	//overwrite load function
    Tone.Buffer.load = function (url, callback) {
    	var handle = Tone.registeredPreload();
        var request = new XMLHttpRequest();
        request.open("GET", url, true);
        request.responseType = "arraybuffer";
        // decode asynchronously
        request.onload = function () {
            Tone.context.decodeAudioData(request.response, function (buff) {
                if (!buff) {
                    throw new Error("could not decode audio data:" + url);
                }
                callback(buff);
	        	handle();
            });
        };
        //send the request
        request.send();
        return request;
    };

	p5.prototype.registerPreloadMethod("registeredPreload", Tone);
	

} (this));