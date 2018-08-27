define(["../core/Tone"], function(Tone){

	if (Tone.supported){
		if (!OscillatorNode.prototype.setPeriodicWave){
			OscillatorNode.prototype.setPeriodicWave = OscillatorNode.prototype.setWaveTable;
		}
		if (!AudioContext.prototype.createPeriodicWave){
			AudioContext.prototype.createPeriodicWave = AudioContext.prototype.createWaveTable;
		}
	}

});
