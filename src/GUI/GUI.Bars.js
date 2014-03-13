///////////////////////////////////////////////////////////////////////////////
//
//	BARS
//
// 	bars for meters and other UI elements
///////////////////////////////////////////////////////////////////////////////

//@param {Element} container
//@param {number=} segments
AudioUnit.GUI.Bars = function(container, segments){
	//extend GUI
	AudioUnit.GUI.call(this);

	//vars
	this.element = document.createElement("div");
	this.segmentCount = this.defaultArg(segments, 10);
	this.segments = new Array(this.segmentCount);

	//create the segments
	for (var i = 0; i < this.segmentCount; i++){
		var segment = document.createElement("div");
		if (i === 0){
			segment.className = "segment peak";
		} else if (i < this.segmentCount * .3){
			segment.className = "segment high";
		} else {
			segment.className = "segment normal";
		}
		this.element.appendChild(segment);
		this.segments[i] = segment;
	}
	this.element.className = "bar";
	//add it to the container
	container.appendChild(this.element);
}

AudioUnit.extend(AudioUnit.GUI.Bars, AudioUnit.GUI);