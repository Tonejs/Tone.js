/**
 *  Pass in a MIDI File as the command line argument to this Node.js
 *  script and it will output a js file in the same directory. 
 *
 *  @example
 *  node MidiToScore.js mySong.mid
 */

var midiFileParser = require("midi-file-parser");
var fs = require("fs");

var file = fs.readFileSync(process.argv[2], "binary");

var midi = midiFileParser(file);

var output = {};

var tempo = 120;
var ticksPerBeat = midi.header.ticksPerBeat;
var timeSignature = [4, 4];
var microsecondsPerBeat = 60000000 / tempo;

//parse the tracks
for (var i = 0; i < midi.tracks.length; i++) {
	var data = midi.tracks[i];
	var trackName = "track"+i;
	var trackNotes = [];
	var currentTime = 0;
	for (var j = 0; j < data.length; j++) {
		//meta tag stuff
		var evnt = data[j];
		if (evnt.type === "meta"){
			if (evnt.subtype === "timeSignature"){
				timeSignature[0] = evnt.numerator;
				timeSignature[1] = evnt.denominator;
			} else if (evnt.subtype === "setTempo"){
				tempo = 60000000 / evnt.microsecondsPerBeat;
				microsecondsPerBeat = evnt.microsecondsPerBeat;
			} else if (evnt.subtype === "trackName"){
				trackName = evnt.text;
			}
		} else {
			if (evnt.subtype === "noteOn" || evnt.subtype === "noteOff"){
				currentTime += evnt.deltaTime;
				var time = deltaTimeToMeter(currentTime);
				var note = midiToNote(evnt.noteNumber);
				var velocity = evnt.velocity / 127;
				if (evnt.subtype === "noteOff"){
					velocity = 0;
				} 
				trackNotes.push([time, note, velocity.toFixed(2)]);
			} 
		}
	}
	output[trackName] = trackNotes;
}

output.tempo = tempo;
output.timeSignature = timeSignature;

//write it to the output file
fs.writeFileSync(process.argv[2]+".js", JSON.stringify(output));

function deltaTimeToMeter(deltaTime){
	var timeSigValue = timeSignature[0] / (timeSignature[1] / 4);
	// return deltaTime;
	var quarters = deltaTime / ticksPerBeat;
	var measures = Math.floor(quarters / timeSigValue);
	var sixteenths = (quarters % 1) * 4;
	quarters = Math.floor(quarters) % timeSigValue;
	var progress = [measures, quarters, sixteenths];
	return progress.join(":");
}



function midiToNote(noteNum){
	var noteIndexToNote = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
	var octave = Math.floor(noteNum / 12) - 2;
	var note = noteNum % 12;
	return noteIndexToNote[note] + octave;
}