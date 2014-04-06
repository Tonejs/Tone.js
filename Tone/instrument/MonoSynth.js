
define(["Tone/core/Tone", "Tone/component/Envelope", "Tone/source/Oscillator"], function(Tone){


	Tone.MonoSynth = function(){
		//one oscillator
		this.oscillator = this.context.createOscillator();
		this.glideTime = .01;
		this.filterEnvelope = new Tone.Envelope();
	}

	return Tone.MonoSynth;
})