
	//UMD
	if ( typeof define === "function" && define.amd ) {
		define(function() {
			return Tone;
		});
	} else if (typeof module === "object") {
		module.exports = Tone;
 	} else {
		root.Tone = Tone;
	}
} (this));