(function(){
	///////////////////////////////////////////////////////////////////////////
	//	MASTER OUTPUT
	///////////////////////////////////////////////////////////////////////////

	var Master = function(){
		//extend audio unit
		AudioUnit.call(this);

		this.input.connect(this.output);
		this.output.connect(this.context.destination);
	}

	AudioUnit.extend(Master, AudioUnit);

	AudioUnit.Master = new Master();
})();