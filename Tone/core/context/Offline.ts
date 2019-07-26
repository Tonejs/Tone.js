import { getContext, setContext } from "../Global";
import { OfflineContext } from "./OfflineContext";
import { ToneAudioBuffer } from "./ToneAudioBuffer";

/**
 * Generate a buffer by rendering all of the Tone.js code within the callback using the OfflineAudioContext.
 * The OfflineAudioContext is capable of rendering much faster than real time in many cases.
 * The callback function also passes in an offline instance of Tone.Transport which can be used
 * to schedule events along the Transport. **NOTE** OfflineAudioContext has the same restrictions
 * as the AudioContext in that on certain platforms (like iOS) it must be invoked by an explicit
 * user action like a click or tap.
 * @param  callback  All Tone.js nodes which are created and scheduled
 * 					within this callback are recorded into the output Buffer.
 * @param  duration     the amount of time to record for.
 * @return  The promise which is invoked with the Tone.Buffer of the recorded output.
 * @example
 * //render 2 seconds of the oscillator
 * Tone.Offline(function(){
 * 	//only nodes created in this callback will be recorded
 * 	var oscillator = new Tone.Oscillator().toDestination().start(0)
 * 	//schedule their events
 * }, 2).then(function(buffer){
 * 	//do something with the output buffer
 * })
 * @example
 * //can also schedule events along the Transport
 * //using the passed in Offline Transport
 * Tone.Offline(function(Transport){
 * 	var osc = new Tone.Oscillator().toDestination()
 * 	Transport.schedule(function(time){
 * 		osc.start(time).stop(time + 0.1)
 * 	}, 1)
 * 	Transport.start(0.2)
 * }, 4).then(function(buffer){
 * 	//do something with the output buffer
 * })
 */
export async function Offline(
	callback: (context: OfflineContext) => Promise<void> | void,
	duration: Seconds,
	channels: number = 2,
	sampleRate: number = getContext().sampleRate,
): Promise<ToneAudioBuffer> {
	// set the OfflineAudioContext based on the current context
	const originalContext = getContext();

	const context = new OfflineContext(channels, duration, sampleRate);
	setContext(context);

	// invoke the callback/scheduling
	await callback(context);

	// then render the audio
	const bufferPromise = context.render();

	// return the original AudioContext
	setContext(originalContext);

	// await the rendering
	const buffer = await bufferPromise;

	// return the audio
	return new ToneAudioBuffer(buffer);
}
