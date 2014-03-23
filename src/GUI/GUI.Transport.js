///////////////////////////////////////////////////////////////////////////////
//
//	TRANSPORT
//
//	basic controls for the transport
//	start/stop/pause, tempo, time signature
///////////////////////////////////////////////////////////////////////////////

Tone.GUI.Transport = function(container, transport){
	Tone.GUI.call(this, container);

	this.setClass(this.element, "transport");

	this.transport = transport;
	this.transport.setInterval(this.updateProgress, "16n", this);

	this.start = new Tone.GUI.Button(this.element, this.startClicked.bind(this), "play");

	this.progress = this.createElement("input", "progress");
	this.progress.type = "text";
	this.progress.value = "0:0:0";
	this.progress.onchange = this.setProgress.bind(this);
	this.appendChild(this.element, this.progress);
}

Tone.extend(Tone.GUI.Transport, Tone.GUI);

Tone.GUI.Transport.prototype.startClicked = function(){
	if (this.transport.state === "playing"){
		this.transport.stop();
		this.start.setText("play");
	} else {
		this.transport.start();
		this.start.setText("stop");
	}
}

Tone.GUI.Transport.prototype.updateProgress = function(time){
	this.progress.value = this.transport.getProgress();
}

Tone.GUI.Transport.prototype.setProgress = function(){
	this.transport.setProgress(this.progress.value);
}