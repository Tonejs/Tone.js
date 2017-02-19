define(["Tone/core/Tone", "Tone/core/Transport", "Tone/core/Buffer", "Tone/core/OfflineContext"], 
function (Tone) {

	/**
	 *  Record a segment of the Transport
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
	 * Tone.Offline(function(){
	 	var osc = new Tone.Oscillator().toMaster()
	 * 	Tone.Transport.schedule(function(time){
	 * 		osc.start(time).stop(time + 0.1)
	 * 	}, 1)
	 * 	Tone.Transport.start(0.2)
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
		callback(Tone.Transport);

		//process the audio
		var rendered = context.render();

		//return the original AudioContext
		Tone.context = originalContext;

		//return the audio
		return rendered.then(function(buffer){
			//wrap it in a Tone.Buffer
			return new Tone.Buffer(buffer);
		});
	};

	return Tone.Offline;
});