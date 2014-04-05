//dependencies Tone, Envelope, Noise, LFO

Tone.MonoSynth = function(){
	//one oscillator
	this.oscillator = this.context.createOscillator();
	this.glideTime = .01;
	this.filterEnvelope = new Tone.Envelope();
}