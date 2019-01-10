define(["../core/Tone", "../core/Transport", "../core/Buffer", "../core/OfflineContext", "../core/Master"], function(Tone){

	/**
	 *  Generate a buffer by rendering all of the Tone.js code within the callback using the OfflineAudioContext.
	 *  The OfflineAudioContext is capable of rendering much faster than real time in many cases.
	 *  The callback function also passes in an offline instance of Tone.Transport which can be used
	 *  to schedule events along the Transport. **NOTE** OfflineAudioContext has the same restrictions
	 *  as the AudioContext in that on certain platforms (like iOS) it must be invoked by an explicit
	 *  user action like a click or tap. 
	 *  @param  {Function}  callback  All Tone.js nodes which are created and scheduled within this callback are recorded into the output Buffer.
	 *  @param  {Time}  duration     the amount of time to record for.
	 *  @return  {Promise}  The promise which is invoked with the Tone.Buffer of the recorded output.
	 *  @example
	 * //render 2 seconds of the oscillator
	 * Tone.Offline(function(){
	 * 	//only nodes created in this callback will be recorded
	 * 	var oscillator = new Tone.Oscillator().toMaster().start(0)
	 * 	//schedule their events
	 * }, 2).then(function(buffer){
	 * 	//do something with the output buffer
	 * })
	 * @example
	 * //can also schedule events along the Transport
	 * //using the passed in Offline Transport
	 * Tone.Offline(function(Transport){
	 * 	var osc = new Tone.Oscillator().toMaster()
	 * 	Transport.schedule(function(time){
	 * 		osc.start(time).stop(time + 0.1)
	 * 	}, 1)
	 * 	Transport.start(0.2)
	 * }, 4).then(function(buffer){
	 * 	//do something with the output buffer
	 * })
	 */
	Tone.Offline = function(callback, duration){
		//set the OfflineAudioContext
		var sampleRate = Tone.context.sampleRate;
		var originalContext = Tone.context;

		var context = new Tone.OfflineContext(2, duration, sampleRate);
		Tone.context = context;

		//invoke the callback/scheduling
		var response = callback(Tone.Transport);

		//the return value
		var ret = null;

		if (response && Tone.isFunction(response.then)){
			//wait for the promise to resolve
			ret = response.then(function(){
				//then render the audio
				return context.render();
			});
		} else {
			//process the audio
			ret = context.render();
		}

		//return the original AudioContext
		Tone.context = originalContext;

		//return the audio
		return ret.then(function(buffer){
			//wrap it in a Tone.Buffer
			return new Tone.Buffer(buffer);
		});
	};

	return Tone.Offline;
});
