export * from "./exports.js";
import { getContext } from "./exports.js";
import { ToneAudioBuffer } from "./core/context/ToneAudioBuffer.js";

/**
 * The Transport object belonging to the global Tone.js Context.
 * @see {@link TransportClass}
 * @category Core
 * @deprecated Use {@link getTransport} instead
 */
export const Transport = getContext().transport;

/**
 * The Destination (output) belonging to the global Tone.js Context.
 * @see {@link DestinationClass}
 * @category Core
 * @deprecated Use {@link getDestination} instead
 */
export const Destination = getContext().destination;

/**
 * @deprecated Use {@link getDestination} instead
 */
export const Master = getContext().destination;

/**
 * The {@link ListenerClass} belonging to the global Tone.js Context.
 * @category Core
 * @deprecated Use {@link getListener} instead
 */
export const Listener = getContext().listener;

/**
 * Draw is used to synchronize the draw frame with the Transport's callbacks.
 * @see {@link DrawClass}
 * @category Core
 * @deprecated Use {@link getDraw} instead
 */
export const Draw = getContext().draw;

/**
 * A reference to the global context
 * @see {@link Context}
 * @deprecated Use {@link getContext} instead
 */
export const context = getContext();

// this fills in name changes from 13.x to 14.x
import { ToneAudioBuffers } from "./core/context/ToneAudioBuffers.js";
import { ToneBufferSource } from "./source/buffer/ToneBufferSource.js";
/** @deprecated Use {@link ToneAudioBuffer} */
export const Buffer: typeof ToneAudioBuffer = ToneAudioBuffer;
/** @deprecated Use {@link ToneAudioBuffers} */
export const Buffers: typeof ToneAudioBuffers = ToneAudioBuffers;
/** @deprecated Use {@link ToneBufferSource} */
export const BufferSource: typeof ToneBufferSource = ToneBufferSource;
