///////////////////////////////////////////////////////////////////////////////
//
//	MASTER OUTPUT
//
//	a single master output
//	adds a toMaster method on AudioNodes and components
///////////////////////////////////////////////////////////////////////////////


define(["Tone/core/Tone"], function(Tone){

	var Master = function(){
		//extend audio unit
		Tone.call(this);

		//put a hard limiter on the output so we don't blow any eardrums
		this.limiter = this.context.createDynamicsCompressor();
		this.limiter.threshold.value = 0;
		this.limiter.ratio.value = 20;
		this.chain(this.input, this.limiter, this.output, this.context.destination);
	}

	Tone.extend(Master);

	///////////////////////////////////////////////////////////////////////////
	//	Add toMaster methods
	///////////////////////////////////////////////////////////////////////////

	//@param {AudioNode|Tone=} unit
	Tone.prototype.toMaster = function(){
		this.connect(Tone.Master);
	}

	AudioNode.prototype.toMaster = function(){
		this.connect(Tone.Master);
	}

	//a single master output
	Tone.Master = new Master();

	return Tone.Master;
})