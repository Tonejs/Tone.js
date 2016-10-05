define(["Tone/core/Tone", "Tone/core/Buffer"], function (Tone) {

	/**
	 *  @class A data structure for holding multiple buffers.
	 *  
	 *  @param  {Object|Array}    urls      An object literal or array
	 *                                      of urls to load.
	 *  @param  {Function=}  callback  The callback to invoke when
	 *                                 the buffers are loaded. 
	 *  @extends {Tone}
	 *  @example
	 * //load a whole bank of piano samples
	 * var pianoSamples = new Tone.Buffers({
	 * 	"C4" : "path/to/C4.mp3"
	 * 	"C#4" : "path/to/C#4.mp3"
	 * 	"D4" : "path/to/D4.mp3"
	 * 	"D#4" : "path/to/D#4.mp3"
	 * 	...
	 * }, function(){
	 * 	//play one of the samples when they all load
	 * 	player.buffer = pianoSamples.get("C4");
	 * 	player.start();
	 * });
	 * 
	 */
	Tone.Buffers = function(urls, onload, baseUrl){

		/**
		 *  All of the buffers
		 *  @type  {Object}
		 *  @private
		 */
		this._buffers = {};

		/**
		 *  A path which is prefixed before every url.
		 *  @type  {String}
		 */
		this.baseUrl = this.defaultArg(baseUrl, "");

		urls = this._flattenUrls(urls);
		this._loadingCount = 0;
		//add each one
		for (var key in urls){
			this._loadingCount++;
			this.add(key, urls[key], this._bufferLoaded.bind(this, onload));
		}
	};

	Tone.extend(Tone.Buffers);

	/**
	 *  True if the buffers object has a buffer by that name.
	 *  @param  {String|Number}  name  The key or index of the 
	 *                                 buffer.
	 *  @return  {Boolean}
	 */
	Tone.Buffers.prototype.has = function(name){
		return this._buffers.hasOwnProperty(name);
	};

	/**
	 *  Get a buffer by name. If an array was loaded, 
	 *  then use the array index.
	 *  @param  {String|Number}  name  The key or index of the 
	 *                                 buffer.
	 *  @return  {Tone.Buffer}
	 */
	Tone.Buffers.prototype.get = function(name){
		if (this.has(name)){
			return this._buffers[name];
		} else {
			throw new Error("Tone.Buffers: no buffer named "+name);
		}
	};

	/**
	 *  A buffer was loaded. decrement the counter.
	 *  @param  {Function}  callback 
	 *  @private
	 */
	Tone.Buffers.prototype._bufferLoaded = function(callback){
		this._loadingCount--;
		if (this._loadingCount === 0 && callback){
			callback(this);
		}
	};

	/**
	 * If the buffers are loaded or not
	 * @memberOf Tone.Buffers#
	 * @type {Boolean}
	 * @name loaded
	 * @readOnly
	 */
	Object.defineProperty(Tone.Buffers.prototype, "loaded", {
		get : function(){
			var isLoaded = true;
			for (var buffName in this._buffers){
				var buff = this.get(buffName);
				isLoaded = isLoaded && buff.loaded;
			}
			return isLoaded;
		}
	});

	/**
	 *  Add a buffer by name and url to the Buffers
	 *  @param  {String}    name      A unique name to give
	 *                                the buffer
	 *  @param  {String|Tone.Buffer|Audiobuffer}  url  Either the url of the bufer, 
	 *                                                 or a buffer which will be added
	 *                                                 with the given name.
	 *  @param  {Function=}  callback  The callback to invoke 
	 *                                 when the url is loaded.
	 */
	Tone.Buffers.prototype.add = function(name, url, callback){
		callback = this.defaultArg(callback, Tone.noOp);
		if (url instanceof Tone.Buffer){
			this._buffers[name] = url;
			callback(this);
		} else if (url instanceof AudioBuffer){
			this._buffers[name] = new Tone.Buffer(url);
			callback(this);
		} else if (this.isString(url)){
			this._buffers[name] = new Tone.Buffer(this.baseUrl + url, callback);
		}
		return this;
	};

	/**
	 *  Flatten an object into a single depth object. 
	 *  thanks to https://gist.github.com/penguinboy/762197
	 *  @param   {Object} ob 	
	 *  @return  {Object}    
	 *  @private
	 */
	Tone.Buffers.prototype._flattenUrls = function(ob) {
		var toReturn = {};
		for (var i in ob) {
			if (!ob.hasOwnProperty(i)) continue;
			if (this.isObject(ob[i])) {
				var flatObject = this._flattenUrls(ob[i]);
				for (var x in flatObject) {
					if (!flatObject.hasOwnProperty(x)) continue;
					toReturn[i + "." + x] = flatObject[x];
				}
			} else {
				toReturn[i] = ob[i];
			}
		}
		return toReturn;
	};

	/**
	 *  Clean up.
	 *  @return  {Tone.Buffers} this
	 */
	Tone.Buffers.prototype.dispose = function(){
		for (var name in this._buffers){
			this._buffers[name].dispose();
		}
		this._buffers = null;
		return this;
	};

	return Tone.Buffers;
});