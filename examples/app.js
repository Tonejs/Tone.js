
function playNote() {
	var synth = new Tone.Synth().toMaster();
	synth.triggerAttackRelease("C4", "8n");
}


