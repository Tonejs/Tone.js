define(["Tone/core/Tone"], function(Tone){

  "use strict";
  /**
   *  @class  Simple Buffer for use with player and convolution objects.
   *  
   *  @constructor 
   *  @param {Object=} list of urls url if a url is passed in, it will be loaded
   *                       and invoke the callback if it also passed
   *                       in.
   */
  
  Tone.Buffer = function(){

	var options = this.optionsObject(arguments, ["urlList", "callback"], Tone.Buffer.defaults);
  
	/**
	 *  @private
	 *  @type {Object} AudioContext 
	*/
	this._context = this.context;
	
	/**
	*  @private
	*  @type {Object} list of urls and their associated keys
	*/
	this._urlList = options.urlList;
  

  /**
   *  @private
   *  @type {number}
   */
  this._loadCount = 0;

	/**
	*  the Object array of raw arraybuffers
	*  @type {Object}
	*/
  this.bufferList = {};
  this.onload = options.callback;

  this.load();
  };

  Tone.extend(Tone.Buffer);

  /**
   *  the default parameters
   *
   *  @static
   *  @const
   *  @type {Object}
   */
  Tone.Buffer.defaults = {
	"context" : this.context,
	"urlList" : {},
	"callback" : function(){}
  };

  /**
   *  makes an xhr reqest for the selected url
   *  Load the audio file as an audio buffer.
   *  Decodes the audio asynchronously and invokes
   *  the callback once the audio buffer loads.
   *
   *  @param {string} url the url of the buffer to load.
   *                      filetype support depends on the
   *                      browser.
   *  @param {string} keyval identifier
   */
  Tone.Buffer.prototype.loadBuffer = function(url, key){
  
	var request = new XMLHttpRequest();
	request.open("GET", url, true);
	request.responseType = "arraybuffer";
	// decode asynchronously
	var self = this;
	request.onload = function() {
	self._context.decodeAudioData(request.response, function(buff) {
	  if(!buff){
		console.log("error in buffer data");
		return;
	  }
	  self.bufferList[key] = buff;
	  if(++self._loadCount == Object.keys(self._urlList).length){
		self.onload(self.bufferList);
	  }
	});
	};
	request.onerror = function() {
	console.log("error loading buffer");
	};
	//send the request
	request.send();
  };

  Tone.Buffer.prototype.load = function(){
  for (var key in this._urlList){
	this.loadBuffer(this._urlList[key], key);
  }
  };

  /**
   *  dispose and disconnect
   */
  Tone.Buffer.prototype.dispose = function(){
	//@todo clean up members here
  };

  return Tone.Buffer;
});