(function(){
	///////////////////////////////////////////////////////////////////////////
	//	MASTER OUTPUT
	///////////////////////////////////////////////////////////////////////////

	var Master = function(){
		//extend audio unit
		AudioUnit.call(this);

		//put a hard limiter on the output so we don't blow any eardrums
		this.limiter = this.context.createDynamicsCompressor();
		this.limiter.threshold.value = 0;
		this.limiter.ratio.value = 100;
		this.chain(this.input, this.limiter, this.output, this.context.destination);
	}

	AudioUnit.extend(Master, AudioUnit);

	AudioUnit.Master = new Master();
})();