///////////////////////////////////////////////////////////////////////////////
//
//	TRANSPORT
//
//	basic controls for the transport
//	start/stop/pause, tempo, time signature
///////////////////////////////////////////////////////////////////////////////

Tone.GUI.Transport = function(container, transport){
	Tone.GUI.call(this, container);

	this.transport = transport;

	this.setClass(this.element, "transport");

	this.start = new Tone.GUI.Button(this.element, this.startClicked.bind(this), "play");
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

