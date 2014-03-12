WebAudio.GUI = WebAudio.GUI || {};

WebAudio.GUI.Meter = function(container, meter, height){
	this.meter = meter;
	setInterval(this.update.bind(this), 200);
	this.element = document.createElement("div");
	container.appendChild(this.element);
	//some light styling
	this.element.style.fontFamily = "monospace";
	this.element.style.whiteSpace = "pre";
}

WebAudio.GUI.Meter.prototype.update = function(){
	var text = this.drawBars(this.meter.volume, 40);
	// text += gainToDb(leftVol).toFixed(1);
	// text += gainToDb(rightVol).toFixed(1);
	this.element.textContent = text;
	if (this.meter.isClipped()){
		this.element.style.color = "red";
	} else {
		this.element.style.color = "inherit";
	}
}

WebAudio.GUI.Meter.prototype.slowUpdate = function(){
	this.meterNumbers = "";
}


WebAudio.GUI.Meter.prototype.drawBars = function(volumes, segments){
	var text = [];
	for (var channel = 0; channel < volumes.length; channel++){
		text.push(" _____ ");
	}
	text.push("\n");
	for (var i = 0; i < segments; i++){
		text.push("|");
		for (var channel = 0; channel < volumes.length; channel++){
			var volume = Math.pow(1 - volumes[channel], 6);
			var volumeSegments = Math.round(volume * segments);
			if (i < volumeSegments){
				text.push("     ");
			} else {
				if (volumeSegments === segments){
					text.push("_____");
				} else {
					text.push("-----");
				}
			} 
			if (channel == volumes.length - 1){
				text.push("|\n");
			} else {
				text.push("  ");
			}
		}
	}
	for (var channel = 0; channel < volumes.length; channel++){
		var db = this.meter.getDb(channel);
		if (isFinite(db)){
			if (db > -10){
				db = " "+db.toFixed(1)+" ";
			} else {
				db = " "+db.toFixed(1);
			}
		} else {
			db = " -inf ";
		}
		text.push(db + " ");
	}
	text.push("\n");
	// console.log(text);
	return text.join("");
}

//@param {number} db
//@returns {number} gain
var dbToGain = function(db) {
	return Math.pow(2, db / 6);
}

//@param {number} gain
//@returns {number} db
var gainToDb = function(gain) {
	return  20 * (Math.log(gain) / Math.LN10);
}
