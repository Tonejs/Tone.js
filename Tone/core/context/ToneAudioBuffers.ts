import { Tone } from "../Tone";
import { optionsFromArguments } from "../util/Defaults";
import { noOp } from "../util/Interface";
import { isString } from "../util/TypeCheck";
import { ToneAudioBuffer } from "./ToneAudioBuffer";

interface ToneAudioBuffersUrlMap {
	[key: string]: string | AudioBuffer | ToneAudioBuffer;
}

interface ToneAudioBuffersOptions {
	urls: ToneAudioBuffersUrlMap;
	onload: () => void;
	onerror?: (error: Error) => void;
	baseUrl: string;
}

/**
 * A data structure for holding multiple buffers in a Map-like datastructure.
 *
 * @param  urls      An object literal or array of urls to load.
 * @param onload  The callback to invoke when the buffers are loaded.
 * @example
 * //load a whole bank of piano samples
 * var pianoSamples = new ToneAudioBuffers({
 * 	"C4" : "path/to/C4.mp3"
 * 	"C#4" : "path/to/C#4.mp3"
 * 	"D4" : "path/to/D4.mp3"
 * 	"D#4" : "path/to/D#4.mp3"
 * }, function(){
 * 	//play one of the samples when they all load
 * 	player.buffer = pianoSamples.get("C4");
 * 	player.start();
 * });
 * @example
 * //To pass in additional parameters in the second parameter
 * var buffers = new ToneAudioBuffers(urls, {
 * 	"onload" : callback,
 * 	"baseUrl" : "../path/to/audio/"
 * })
 */
export class ToneAudioBuffers extends Tone {

	name = "ToneAudioBuffers";

	/**
	 *  All of the buffers
	 */
	private _buffers: Map<string, ToneAudioBuffer> = new Map();

	/**
	 *  A path which is prefixed before every url.
	 */
	baseUrl: string;

	/**
	 * Keep track of the number of loaded buffers
	 */
	private _loadingCount: number = 0;

	constructor(
		urls?: ToneAudioBuffersUrlMap,
		onload?: () => void,
		baseUrl?: string,
		);
	constructor(options?: Partial<ToneAudioBuffersOptions>);
	constructor() {

		super();

		let urls: ToneAudioBuffersUrlMap | undefined;
		let options: ToneAudioBuffersOptions | undefined;
		if (arguments.length === 1 && arguments[0].hasOwnProperty("urls")) {
			options = optionsFromArguments(ToneAudioBuffers.getDefaults(), arguments, ["urls", "onload", "baseUrl"]);
			urls = options.urls;
		} else {
			urls = arguments[0];
			const args = Array.from(arguments);
			args.shift();
			options = optionsFromArguments(ToneAudioBuffers.getDefaults(), args as unknown as IArguments, ["onload", "baseUrl"]);
		}

		this.baseUrl = options.baseUrl;

		const urlMap: ToneAudioBuffersUrlMap = urls || {};
		// add each one
		Object.keys(urlMap).forEach(name => {
			this._loadingCount++;
			const url = urlMap[name];
			this.add(name, url, this._bufferLoaded.bind(this, (options as ToneAudioBuffersOptions).onload));
		});

	}

	static getDefaults(): ToneAudioBuffersOptions {
		return {
			baseUrl: "",
			onerror: noOp,
			onload: noOp,
			urls: {},
		};
	}

	/**
	 *  True if the buffers object has a buffer by that name.
	 *  @param  name  The key or index of the buffer.
	 */
	has(name: string): boolean {
		return this._buffers.has(name);
	}

	/**
	 *  Get a buffer by name. If an array was loaded,
	 *  then use the array index.
	 *  @param  name  The key or index of the buffer.
	 */
	get(name: string): ToneAudioBuffer {
		this.assert(this.has(name), `ToneAudioBuffers has no buffer named: ${name}`);
		return this._buffers.get(name) as ToneAudioBuffer;
	}

	/**
	 *  A buffer was loaded. decrement the counter.
	 */
	private _bufferLoaded(callback: () => void): void {
		this._loadingCount--;
		if (this._loadingCount === 0 && callback) {
			callback();
		}
	}

	/**
	 * If the buffers are loaded or not
	 */
	get loaded(): boolean {
		return Array.from(this._buffers).every(([name, buffer]) => buffer.loaded);
	}

	/**
	 *  Add a buffer by name and url to the Buffers
	 *  @param  name      A unique name to give the buffer
	 *  @param  url  Either the url of the bufer, or a buffer which will be added with the given name.
	 *  @param  callback  The callback to invoke when the url is loaded.
	 */
	add(
		name: string,
		url: string | AudioBuffer | ToneAudioBuffer,
		callback: () => void = noOp,
	): this {
		if (url instanceof ToneAudioBuffer) {
			this._buffers.set(name, url);
			callback();
		} else if (url instanceof AudioBuffer) {
			this._buffers.set(name, new ToneAudioBuffer(url));
			callback();
		} else if (isString(url)) {
			this._buffers.set(name, new ToneAudioBuffer(this.baseUrl + url, callback));
		}
		return this;
	}

	/**
	 *  Clean up.
	 */
	dispose(): this {
		// this._buffers.forEach(buffer => buffer.dispose());
		// this._buffers.clear();
		return this;
	}
}
