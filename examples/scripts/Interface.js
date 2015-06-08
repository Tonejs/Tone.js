/* globals Tone, nx */

//nexusUI setup
// nx.showLabels = true;
// nx.colorize("accent", "#D76767");
// nx.colorize("fill", "#fff");
// nx.colorize("border", "#000");

var dragContainer = "#DragContainer";

var Interface = {
	isMobile : false
};

$(function(){
	var topbar = $("<div>").attr("id", "TopBar");
	$("body").prepend(topbar);
	$("<div>")
		.attr("id", "Homepage")
		.attr("title", "github")
		.html("<a href='http://github.com/TONEnoTONE/Tone.js'>Tone.js</a>")
		.appendTo(topbar);
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
		var button = $("<div>").attr("id", "Button")
			.text("\u25B6")
			.on("touchstart", function(e){
				e.preventDefault();
				Tone.startMobile();
				element.remove();
			})
			.appendTo(element);  
	}
	//get the master output
	if (Tone && Tone.Master){
		var meter = new Tone.Meter(2);
		Tone.Master.connect(meter);
		var meterElement = $("<div>").attr("id", "Meter").appendTo(topbar);
		var leftLevel = $("<div>").addClass("Level")
			.attr("id", "Left")
			.appendTo(meterElement);
		var rightLevel = $("<div>").addClass("Level")
			.attr("id", "Right")
			.appendTo(meterElement);
		function update(){
			requestAnimationFrame(update);
			var leftHeight = 100 - Math.max(Math.min(Math.abs(meter.getDb(0)), 100), 0);
			var rightHeight = 100 - Math.max(Math.min(Math.abs(meter.getDb(1)), 100), 0);
			leftLevel.height(leftHeight + "%");
			rightLevel.height(rightHeight + "%");
		}
		update();
	}

	//subtract the explaination from the dragger container
	$(dragContainer).height($(dragContainer).height() - $("#Explanation").height());
});


Interface.Code = function(container, codeID){
	Interface.Rack(container, "Code", true);
	var element = Interface.getElement(container);
	var codeContainer = $("<code>").addClass("language-javascript Code");
	element.append(codeContainer);
	var code = Interface.getElement(codeID);
	var codeText = code.text();
	var lines = codeText.split("\n");
	//remove the same level of indentation for everyone
	while(lines[1].charAt(0)==="\t"){
		for (var i = 0; i < lines.length; i++){
			var line = lines[i];
			lines[i] = line.substr(1);
		}
	}
	codeText = lines.join("\n");
	codeContainer.text(codeText);
	codeContainer.addClass("Code");
};


Interface.Dragger = function(gui, params){

	this.container = $(dragContainer);

	this.gui = gui;

	this.element = $("<div>", {
		"class" : "Dragger",
		"id" : this.gui.name
	}).appendTo(dragContainer)
		.on("dragMove", this._ondrag.bind(this))
		.on("touchstart mousedown", params.start)
		.on("mouseup touchend", params.end);

	this.name = $("<div>", {
		"id" : "Name",
		"text" : this.gui.name
	}).appendTo(this.element);

	this.xaxis = $("<div>", {
		"id" : "xAxis",
		"class" : "Axis"
	}).appendTo(this.container);

	this.yaxis = $("<div>", {
		"id" : "yAxis",
		"class" : "Axis"
	}).appendTo(this.container);

	this.halfSize = this.element.width() / 2;

	this.top = this.container.offset().top + 40;

	this.left = this.container.offset().left;

	/**
	 *  the parameters
	 */
	if (params.x){

		if (typeof params.x === "string"){
			this.xParam = params.x;
			//default values
			this.xMin = 0;
			this.xMax = 1;
			this.xExp = 1;
		} else if (typeof params.x === "object"){
			this.xParam =  params.x.param;
			this.xMin = typeof params.x.min === "undefined" ? 0 : params.x.min;
			this.xMax = typeof params.x.max === "undefined" ? 1 : params.x.max;
			this.xExp = typeof params.x.exp === "undefined" ? 1 : params.x.exp;
			if (params.x.options){
				this.xOptions = params.x.options;
				this.xMin = 0;
				this.xMax = this.xOptions.length - 1;
			}
		} 

		//set the original position
		var width = this.container.width()  - this.element.width();
		var xParamVal = this.gui.params[this.xParam].get();
		if (this.xOptions){
			xParamVal = this.xOptions.indexOf(xParamVal);
		}
		var left = (xParamVal - this.xMin) / (this.xMax - this.xMin);
		left = Math.pow(left, 1 / this.xExp) * width;
		this.element.css("left", left);
		this.xaxis.css("left",left + this.halfSize);

		if (this.xOptions){
			this._setParam(this.xParam, this.xOptions[xParamVal]);
		} else {
			this._setParam(this.xParam, xParamVal);
		}
	} else {
		this.xParam = false;
	}

	if (params.y){
		
		if (typeof params.y === "string"){
			this.yParam = params.y;
			//default values
			this.yMin = 0;
			this.yMax = 1;
			this.yExp = 1;
		} else {
			this.yParam =  params.y.param;
			this.yMin = typeof params.y.min === "undefined" ? 0 : params.y.min;
			this.yMax = typeof params.y.max === "undefined" ? 1 : params.y.max;
			this.yExp = typeof params.y.exp === "undefined" ? 1 : params.y.exp;
			if (params.y.options){
				this.yOptions = params.y.options;
				this.yMin = 0;
				this.yMax = this.yOptions.length - 1;
			}
		}

		var height = this.container.height() - this.element.height();
		var yParamVal = this.gui.params[this.yParam].get();
		if (this.yOptions){
			yParamVal = this.yOptions.indexOf(yParamVal);
		}
		var top = (yParamVal - this.yMin) / (this.yMax - this.yMin);
		top = Math.pow(1 - top, 1 / this.yExp) * height;
		this.element.css("top", top);
		this.yaxis.css("top", top + this.halfSize);

		if (this.yOptions){
			this._setParam(this.yParam, this.yOptions[yParamVal]);
		} else {
			this._setParam(this.yParam, yParamVal);
		}
	} else {
		this.yParam = false;
	}

	if (!(this.yParam && this.xParam)){
		var axis = "x";
		if (this.yParam){
			axis = "y";
		}
		this.element.draggabilly({
			"axis" : axis,
			"containment": dragContainer
		});
	} else {
		this.element.draggabilly({
			"containment": dragContainer
		});
	}

};

Interface.Dragger.prototype._ondrag = function(e, pointer){
	var normX = (pointer.pageX - this.left) / this.container.width();
	var normY = (pointer.pageY - this.top) / this.container.height();
	normX = Math.pow(normX, this.xExp);
	normY = 1 - Math.pow(normY, this.yExp);	
	var resX = normX * (this.xMax - this.xMin) + this.xMin;
	var resY = normY * (this.yMax - this.yMin) + this.yMin;

	var xVal = resX;
	if (this.xOptions){
		xVal = this.xOptions[Math.round(resX)];
	}

	var yVal = resY;
	if (this.yOptions){
		yVal = this.yOptions[Math.round(resY)];
	}

	this._setParam(this.xParam, xVal);
	this._setParam(this.yParam, yVal);
	//set the line positions
	var position = this.element.position();
	this.xaxis.css("left", position.left + this.halfSize);
	this.yaxis.css("top", position.top + this.halfSize);
};

Interface.Dragger.prototype._setParam = function(param, value){
	if (param){
		this.gui.params[param].set(value);
	}
};

/**
 *  A Slider
 */
Interface.Slider = function(gui, params){
	this.container = $(dragContainer);

	this.gui = gui;

	this.element = $("<div>", {
		"class" : "Dragger",
		"id" : this.gui.name
	}).appendTo(dragContainer)
		.on("dragMove", this._ondrag.bind(this))
		.on("touchstart mousedown", params.start)
		.on("mouseup touchend", params.end);

	this.name = $("<div>", {
		"id" : "Name",
		"text" : this.gui.name
	}).appendTo(this.element);

	this.xaxis = $("<div>", {
		"id" : "xAxis",
		"class" : "Axis"
	}).appendTo(this.container);

	this.yaxis = $("<div>", {
		"id" : "yAxis",
		"class" : "Axis"
	}).appendTo(this.container);

	this.halfSize = this.element.width() / 2;

	this.top = this.container.offset().top + 40;

	this.left = this.container.offset().left;
};