///////////////////////////////////////////////////////////////////////////////
//
//	BUTTON
//	
//	basic UI button
///////////////////////////////////////////////////////////////////////////////


Tone.GUI.Button = function(container, callback, text){
	Tone.GUI.call(this, container);

	this.button = this.createElement("input");
	this.button.type = "button";
	this.button.onclick = this.clicked.bind(this);

	//the label
	this.label = this.createElement();
	this.label.textContent = text;


	this.setClass(this.element, "button");
	this.setClass(this.label, "label");
	this.callback = callback;

	this.appendChild(this.element, this.button);
	this.appendChild(this.element, this.label);
}

//extend GUI
Tone.extend(Tone.GUI.Button, Tone.GUI);

Tone.GUI.Button.prototype.clicked = function(event){
	this.callback(event, this);
}

Tone.GUI.Button.prototype.setText = function(text){
	this.label.textContent = text;
}