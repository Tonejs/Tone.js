/* globals Tone, StartAudioContext */


var Interface = {
	isMobile : false
};

/**
 *
 *
 *  INIT
 *  
 */
$(function(){
	var topbar = $("<div>").attr("id", "TopBar");
	$("body").prepend(topbar);
	
	if (typeof Logo !== "undefined"){
		Logo({
			"container" : topbar.get(0),
			"height" : topbar.height() - 6,
			"width" : 140
		});

	}
	$("<div>")
		.attr("id", "Examples")
		.attr("title", "examples")
		.html("<a href='./index.html'>examples</a>")
		.appendTo(topbar);
	//mobile start
	if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
		Interface.isMobile = true;
		$("body").addClass("Mobile");
		var element = $("<div>", {"id" : "MobileStart"}).appendTo("body");
		var button = $("<div>").attr("id", "Button").text("Enter").appendTo(element);
		StartAudioContext(Tone.context, button, function(){
			element.remove();
		});
	}
});

/**
 *
 *	LOADING INDICATOR
 *  
 */
Interface.Loader = function(){
	this.element = $("<div>", {
		"id" : "Loading",
	}).appendTo("body");

	this.text = $("<div>", {
		"id" : "Text",
		"text" : "Loading"
	}).appendTo(this.element);

	Tone.Buffer.on("load", function(){
		this.element.addClass("Loaded");
	}.bind(this));
};

/**
 *
 *  
 *  DRAGGER
 *
 */
Interface.Dragger = function(params){

	if ($("#DragContainer").length === 0){
		$("<div>", {
			"id" : "DragContainer"
		}).appendTo(params.parent || "#Content");	
	}

	this.container = $("#DragContainer");

	/**
	 *  the tone object
	 */
	this.tone = params.tone;

	/**
	 *  callbacks
	 */
	this.start = params.start;

	this.end = params.end;

	this.drag = params.drag;

	/**
	 *  the name
	 */
	var name = params.name ? params.name : this.tone ? this.tone.toString() : "";

	/**
	 *  elements
	 */
	this.element = $("<div>", {
		"class" : "Dragger",
		"id" : name
	}).appendTo(this.container)
		.on("dragMove", this._ondrag.bind(this))
		.on("touchstart mousedown", this._onstart.bind(this))
		.on("dragEnd touchend mouseup", this._onend.bind(this));

	this.name = $("<div>", {
		"id" : "Name",
		"text" : name
	}).appendTo(this.element);

	this.element.draggabilly({
		"axis" : this.axis,
		"containment": this.container
	});

	/**
	 *  x slider
	 */
	var xParams = params.x;
	xParams.axis = "x";
	xParams.element = this.element;
	xParams.tone = this.tone;
	xParams.container = this.container;
	this.xAxis = new Interface.Slider(xParams);

	/**
	 *  y slider
	 */
	var yParams = params.y;
	yParams.axis = "y";
	yParams.element = this.element;
	yParams.tone = this.tone;
	yParams.container = this.container;
	this.yAxis = new Interface.Slider(yParams);

	//set the axis indicator
	var position = this.element.position();
	this.halfSize = this.xAxis.halfSize;
	this.xAxis.axisIndicator.css("top", position.top + this.halfSize);
	this.yAxis.axisIndicator.css("left", position.left + this.halfSize);
};

Interface.Dragger.prototype._ondrag = function(e, pointer){
	if (this.drag){
		this.drag();
	}
	this.xAxis._ondrag(e, pointer);
	this.yAxis._ondrag(e, pointer);
	var position = this.element.position();
	this.xAxis.axisIndicator.css("top", position.top + this.halfSize);
	this.yAxis.axisIndicator.css("left", position.left + this.halfSize);
};

Interface.Dragger.prototype._onstart = function(e){
	if (this.start){
		this.start();
	}
	this.xAxis._onstart(e);
	this.yAxis._onstart(e);
};

Interface.Dragger.prototype._onend = function(e){
	if (this.end){
		this.end();
	}
	this.xAxis._onend(e);
	this.yAxis._onend(e);
	var position = this.element.position();
	this.xAxis.axisIndicator.css("top", position.top + this.halfSize);
	this.yAxis.axisIndicator.css("left", position.left + this.halfSize);
};



/**
 *
 *  
 *  SLIDER
 *
 */
Interface.Slider = function(params){

	this.tone = params.tone;

	/**
	 *  the name
	 */
	var name = params.name ? params.name : this.tone ? this.tone.toString() : "";

	/**
	 *  callback functions
	 */
	this.start = params.start;

	this.end = params.end;

	this.drag = params.drag;

	/**
	 *  the axis indicator
	 */
	this.axis = params.axis || "x";

	if (!params.element){

		this.container = $("<div>", {
			"class" : "Slider "+this.axis,
		}).appendTo(params.parent || "#Content");

		this.element = $("<div>", {
			"class" : "Dragger",
			"id" : name
		}).appendTo(this.container)
			.on("dragMove", this._ondrag.bind(this))
			.on("touchstart mousedown", this._onstart.bind(this))
			.on("dragEnd touchend mouseup", this._onend.bind(this));

		this.name = $("<div>", {
			"id" : "Name",
			"text" : name
		}).appendTo(this.element);

		this.element.draggabilly({
			"axis" : this.axis,
			"containment": this.container.get(0)
		});
	} else {
		this.element = params.element;

		this.container = params.container;
	}

	this.axisIndicator = $("<div>", {
		"id" : this.axis + "Axis",
		"class" : "Axis"
	}).appendTo(this.container);

	/**
	 *  the initial value / position
	 */
	this.parameter = params.param || false;
	//default values
	this.min = typeof params.min === "undefined" ? 0 : params.min;
	this.max = typeof params.max === "undefined" ? 1 : params.max;
	this.exp = typeof params.exp === "undefined" ? 1 : params.exp;
	if (params.options){
		this.options = params.options;
		this.min = 0;
		this.max = this.options.length - 1;
		this.exp = params.exp || 1;
	}

	/**
	 *  cache some measurements for later
	 */
	this.halfSize = this.element.width() / 2;

	this.maxAxis = this.axis === "x" ? "width" : "height";
	this.posAxis = this.axis === "x" ? "left" : "top";
	this.oppositeAxis = this.axis === "x" ? "top" : "left";

	/**
	 *  initial value
	 */
	if (this.parameter || typeof params.value !== "undefined"){

		var paramValue = typeof params.value !== "undefined" ? params.value : this.tone.get(this.parameter);

		this.value(paramValue);		
	}
};

Interface.Slider.prototype.value = function(val){
	var maxSize = this.container[this.maxAxis]() - this.element[this.maxAxis]();
	//y gets inverted
	if (this.axis === "y"){
		maxSize = this.container[this.maxAxis]() - maxSize;
	}

	if (val.hasOwnProperty(this.parameter)){
		val = val[this.parameter];
	}

	if (this.options){
		val = this.options.indexOf(val);
	}

	var pos = (val - this.min) / (this.max - this.min);
	pos = Math.pow(pos, 1 / this.exp) * (maxSize );
	this.element.css(this.posAxis, pos);

	if (this.options){
		this._setParam(this.options[val]);
	} 
};


Interface.Slider.prototype._ondrag = function(e, pointer){
	if (typeof this.top === "undefined"){
		this.top = this.container.offset().top;
		this.left = this.container.offset().left;
	}

	var normPos;
	if (this.axis === "x"){
		var xVal = Math.max((pointer.pageX - this.left), 0);
		normPos =  xVal / (this.container.width());
	}  else {
		var yVal = Math.max((pointer.pageY - this.top ), 0);
		normPos =  yVal / (this.container.height());
		normPos = 1 - normPos;
	}
	normPos = Math.pow(normPos, this.exp);

	var result = normPos * (this.max - this.min) + this.min;

	result = Math.max(Math.min(this.max, result), this.min);

	var value = result;

	if (this.options){
		value = this.options[Math.round(result)];
	}

	if (this.drag){
		this.drag(value);
	}

	this._setParam(value);
};

Interface.Slider.prototype._onstart = function(e){
	e.preventDefault();
	if (this.start){
		this.start();
	}
};

Interface.Slider.prototype._onend = function(){
	if (this.end){
		this.end();
	}
};

Interface.Slider.prototype._setParam = function(value){
	if (this.parameter && this.tone){
		this.tone.set(this.parameter, value);
	}
};

/**
 *
 * BUTTON
 *  
 */
Interface.Button = function(params){

	this.activeText = params.activeText || false;

	this.text = params.text || "Button";

	this.type = params.type || "moment";

	this.element = $("<div>", {
		"class" : "Button",
		"text" : this.text
	}).appendTo(params.parent || "#Content")
		.on("mousedown touchstart", this._start.bind(this));

	if (this.type === "moment"){
		this.element.on("mouseup touchend", this._end.bind(this));
	} else {
		this.element.addClass("Toggle");
	}

	/**
	 *  the button state
	 */
	this.active = false;

	/**
	 *  callbacks
	 */
	this.start = params.start;
	this.end = params.end;

	/**
	 *  key presses
	 */
	if (params.key){
		this.key = params.key;
		$(window).on("keydown", this._keydown.bind(this));
		if (this.type === "moment"){
			$(window).on("keyup", this._keyup.bind(this));
		}
	}
};

Interface.Button.prototype._start = function(e){
	if (e){
		e.preventDefault();
	}
	if (!this.active){
		this.active = true;
		this.element.addClass("Active");
		if (this.activeText){
			this.element.text(this.activeText);
		}
		if (this.start){
			this.start();
		}
	} else if (this.type === "toggle" && this.active){
		this._end();
	}
};

Interface.Button.prototype._end = function(e){
	if (e){
		e.preventDefault();
	}
	if (this.active){
		this.active = false;
		this.element.removeClass("Active");
		this.element.text(this.text);
		if (this.end){
			this.end();
		}
	}
};

Interface.Button.prototype._keydown = function(e){
	if (e.which === this.key){
		e.preventDefault();
		this._start();
	}
};

Interface.Button.prototype._keyup = function(e){
	if (e.which === this.key){
		e.preventDefault();
		this._end();
	}
};

/**
 *
 *	TRANSPORT
 *  
 */
Interface.Transport = function(){

	this.element = $("<div>", {
		"class" : "Transport",
	}).appendTo("#Content");

	this.position = $("<div>", {
		"id" : "Position"
	}).appendTo(this.element);

	this._boundLoop = this._loop.bind(this);
	this._loop();
};

Interface.Transport.prototype._loop = function(){
	setTimeout(this._boundLoop, 50);
	this.position.text(Tone.Transport.position);
};