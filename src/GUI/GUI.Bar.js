///////////////////////////////////////////////////////////////////////////////
//
//	BAR
//
// 	bars for meters and other UI elements
///////////////////////////////////////////////////////////////////////////////

//@param {Element} container
//@param {number=} segments
AudioUnit.GUI.Bar = function(container, segments){
	//extend GUI
	AudioUnit.GUI.call(this);

	//vars
	this.element = this.createElement();
	this.segmentCount = this.defaultArg(segments, 10);
	this.segments = new Array(this.segmentCount);
	this.label = this.createElement();

	//create the segments
	for (var i = 0; i < this.segmentCount; i++){
		var segment = this.createElement();
		if (i === 0){
			this.setClass(segment, "segment peak");
		} else if (i < this.segmentCount * .3){
			this.setClass(segment, "segment high");
		} else {
			this.setClass(segment, "segment normal");
		}
		this.appendChild(this.element, segment);
		this.segments[this.segmentCount - i - 1] = segment;
	}

	this.setClass(this.element, "bar");
	this.setClass(this.label, "label");
	//add it to the container
	this.appendChild(container, this.element);
	this.appendChild(this.element, this.label);
}

AudioUnit.extend(AudioUnit.GUI.Bar, AudioUnit.GUI);

//@param {number} val (0-1)
AudioUnit.GUI.Bar.prototype.setLevel = function(val){
	val *= this.segmentCount;
	for (var i = 0; i < this.segmentCount; i++){
		var seg = this.segments[i];
		seg.style.opacity = Math.max(Math.min(val - i, 1), 0);
	}
}

//@param {string} str
AudioUnit.GUI.Bar.prototype.setLabel = function(str){
	this.label.textContent = str;
}