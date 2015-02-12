/* globals Tone, nx */

//nexusUI setup
nx.showLabels = true;
nx.colorize("accent", "#D76767");
nx.colorize("fill", "#fff");

var Interface = {};

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
});

$(window).resize(function(){
	for (var name in nx.widgets){
		var widg = nx.widgets[name];
		widg.init();
	}
});

Interface.Rack = function(id, name, collapsible){
	var element = $("#"+id);
	element.addClass("Rack");
	var title = $("<div>").addClass("Title").text(name);
	element.prepend(title);
	title.on("click touch", function(){
		element.toggleClass("Expanded");
	});
	if (collapsible){
		element.addClass("Collapsible");
	}
	return {
		close : function(){
			element.removeClass("Expanded");
		},
		open : function(){
			element.addClass("Expanded");
		}
	};
};

Interface.Toggle = function(container, callback){
	var toggle = nx.add("toggle", {
		parent : container
	});
	toggle.on("value", function(val){
		callback(val === 1);
	});
};

Interface.DropDown = function(container, options, callback){
	var select = nx.add("select", {
		parent : container
	});
	select.choices = options;
	select.init();
	select.on("text", function(val){
		callback(val);
	});
};

Interface.ContinuousControl = function(container, type, node, parameter, min, max, exp){
	min = min || 0;
	max = max || 1;
	exp = exp || 1;
	var isTone = (node[parameter] instanceof Tone || node[parameter] instanceof AudioParam);
	var currentValue = isTone?node[parameter].value : node[parameter];
	currentValue = nx.scale(currentValue, min, max, 0, 1);
	currentValue = Math.pow(currentValue, 1/exp);
	var slider = nx.add(type, {
		parent : container,
	});
	slider.val.value = currentValue;
	slider.label = parameter;
	slider.on("value", function(val){
		val = Math.pow(val, exp);
		var scaledVal = nx.scale(val, 0, 1, min, max);
		if (isTone){
			node[parameter].value = scaledVal;
		} else {
			node[parameter] = scaledVal;
		}
	});
	slider.draw();
	slider.listen = function(){
		requestAnimationFrame(slider.listen);
		var val = node[parameter];
		if (isTone){
			val = node[parameter].value;
		} 
		val = nx.scale(val, min, max, 0, 1);
		val = Math.pow(val, 1/exp);
		if (val !== slider.val.value){
			slider.val.value = val;
			slider.draw();
		}
	};
	return slider;
};

Interface.Slider = function(container, node, parameter, min, max, exp){
	return Interface.ContinuousControl(container, "slider", node, parameter, min, max, exp);
};

Interface.HorizontalSlider = function(container, node, parameter, min, max, exp){
	var slider = Interface.Slider(container, node, parameter, min, max, exp);
	$(slider.canvas).addClass("HorizontalSlider");
	return slider;
};

Interface.Code = function(container, codeID){
	Interface.Rack(container, "Code", true);
	var element = $("#"+container);
	var codeContainer = $("<code>").addClass("language-javascript Code");
	element.append(codeContainer);
	var code = $("#"+codeID);
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

Interface.Knob = function(container, node, parameter, min, max, exp){
	return Interface.ContinuousControl(container, "dial", node, parameter, min, max, exp);
};

Interface.Momentary = function(container, callback){
	var button = nx.add("button", {
		"parent" : container
	});
	button.on("press", function(val){
		callback(val === 1);
	});

};

Interface.AmplitudeEnvelope = function(container, node){
	var element = $("#"+container);
	var group = $("<div>").addClass("Envelope")
		.appendTo(element);
	var attack = Interface.Knob(group[0], node, "attack", 0.001, 2, 2);
	var decay = Interface.Knob(group[0], node, "decay", 0.0, 2, 2);
	var sustain = Interface.Knob(group[0], node, "sustain", 0, 1, 2);
	var release = Interface.Knob(group[0], node, "release", 0.001, 4, 2);
	var labels = $("<div>").attr("id", "Labels")
		.appendTo(group);
	$("<div>").appendTo(labels).addClass("Label").text("attack");
	$("<div>").appendTo(labels).addClass("Label").text("decay");
	$("<div>").appendTo(labels).addClass("Label").text("sustain");
	$("<div>").appendTo(labels).addClass("Label").text("release");
	
	return {
		listen : function(){
			attack.listen();
			decay.listen();
			release.listen();
			sustain.listen();
		}
	};
};

Interface.Loading = function(containerID, callback){
	var element = $("#"+containerID);
	element.addClass("LoadingBar");
	var loader = $("<div>").appendTo(element)
		.attr("id", "Loader");
	Tone.Buffer.onprogress = function(percent){
		loader.width((percent * 100) + "%");
	};
	Tone.Buffer.onload = function(){
		element.css({
			height: 0,
			opacity : 0,
			margin: 0
		});
		setTimeout(function(){
			element.remove();
		}, 500);
		if (callback){
			callback();
		}
	};
};

Interface.Range = function(containerID, callback){
	var range = nx.add("range", {
		"parent" : containerID
	});
	range.label = "";
	range.on("*", callback);
	return range;
};
