var GUI = GUI || {};


/**
 *  start the application by closing this start button
 *  @param {function} callback
 */
GUI.StartButton = function(callback){
	this.element = $("<div>", {"id" : "StartButton"})
		.appendTo("body");
	this.button = $("<button>")
		.button({label: "start"})
		.click(this.buttonClicked.bind(this))
		.appendTo(this.element);  
	this.callback = callback;
};

GUI.StartButton.prototype.buttonClicked = function(){
	this.element.fadeTo(500, 0, function(){
		$(this).remove();
	});
	this.callback();
};

/**
 *  Tone.Envelope GUI
 *  @param {jQuery} container the jQuery object to put the gui in
 *  @param {Tone.Envelope} envelope  the envelope object
 */
GUI.Envelope = function(container, envelope, title){
	this.envelope = envelope;
	this.element = $("<div>", {"id" : "Envelope"})
		.appendTo(container);
	this.title = $("<div>", {"id" : "Title"})
		.appendTo(this.element)
		.text(title);
	this.attack = this.makeSlider("attack", 0.01, 0.3, "A");
	this.decay = this.makeSlider("decay", 0.01, 0.4, "D");
	this.sustain = this.makeSlider("sustain", 0, 1, "S");
	this.release = this.makeSlider("release", 0.2, 2, "R");
};

GUI.Envelope.prototype.makeSlider = function(attr, min, max, name){
	var self = this;
	var startVal = this.envelope[attr]*1000;
	var slider = $("<div>", {"class" : "Slider"})
		.slider({
			orientation: "vertical",
			range: "min",
			min: min * 1000,
			max: max * 1000,
			value: startVal,
			slide: function(event, ui) {
				var settings = {};
				settings[attr] = ui.value / 1000;
				self.envelope.set(settings);
				label.text(settings[attr].toFixed(3));
			}
		})
		.appendTo(this.element);
	var label = $("<div>", {"class" : "Label Bottom"})
		.text(startVal / 1000)
		.appendTo(slider);
	$("<div>", {"class" : "Label Top"})
		.text(name)
		.appendTo(slider);
	return slider;
};