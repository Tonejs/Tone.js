
	//requirejs compatibility
	if ( typeof define === "function" && define.amd ) {
		define( "Tone", [], function() {
			return Tone;
		});
	} else {
		root.Tone = Tone;
	}
} (this));