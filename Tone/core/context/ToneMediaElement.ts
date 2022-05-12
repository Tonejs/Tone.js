import { getContext } from "../Global";
import { Tone } from "../Tone";
import { Samples, Seconds } from "../type/Units";
import { optionsFromArguments } from "../util/Defaults";
import { noOp } from "../util/Interface";
import { isArray, isNumber, isString } from "../util/TypeCheck";
import { assert } from "../util/Debug";

interface ToneMediaElementOptions {
	url?: string;
	onload: (buffer?: ToneMediaElement) => void;
	onerror: (error: Error) => void;
}

/**
 * MediaElement loading and storage. ToneMediaElement is used internally by MediaElementSampler
 * @example
 * const mediaElement = new Tone.ToneMediaElement("https://tonejs.github.io/audio/casio/A1.mp3", () => {
 * 	console.log("loaded");
 * });
 * @category Core
 */
export class ToneMediaElement extends Tone {
	readonly name: string = "ToneMediaElement";

	/**
	 * stores the loaded MediaElement
	 */
	private _element?: MediaElementAudioSourceNode;

	/**
	 * Callback when the element is loaded
	 */
	onload: (element: ToneMediaElement) => void = noOp;

	/**
	 * @param url The url to load.
	 * @param onload A callback which is invoked after the buffer is loaded.
	 * @param onerror The callback to invoke if there is an error
	 */
	constructor(
		url?: string,
		onload?: (element: ToneMediaElement) => void,
		onerror?: (error: Error) => void
	);
	constructor(options?: Partial<ToneMediaElementOptions>);
	constructor() {
		super();

		const options = optionsFromArguments(
			ToneMediaElement.getDefaults(),
			arguments,
			["url", "onload", "onerror"]
		);

		this.onload = options.onload;

		if (options.url) {
			// initiate the download
			this.load(options.url).catch(options.onerror);
		}
	}

	static getDefaults(): ToneMediaElementOptions {
		return {
			onerror: noOp,
			onload: noOp,
		};
	}

	/**
	 * Pass in an AudioBuffer or ToneAudioBuffer to set the value of this buffer.
	 */
	set(buffer: AudioBuffer | ToneMediaElement): this {
		if (buffer instanceof ToneMediaElement) {
			// if it's loaded, set it
			if (buffer.loaded) {
				this._element = buffer.get();
			} else {
				// otherwise when it's loaded, invoke it's callback
				buffer.onload = () => {
					this.set(buffer);
					this.onload(this);
				};
			}
		} else {
			this._element = buffer;
		}
		return this;
	}

	/**
	 * The media element stored in the object.
	 */
	get(): MediaElementAudioSourceNode | undefined {
		return this._element;
	}

	/**
	 * clean up
	 */
	dispose(): this {
		super.dispose();
		this._element = undefined;
		return this;
	}

	/**
	 * If the buffer is loaded or not
	 */
	get loaded(): boolean {
		return this.length > 0;
	}

	/**
	 * The duration of the buffer in seconds.
	 */
	get duration(): Seconds {
		if (this._buffer) {
			return this._buffer.duration;
		} else {
			return 0;
		}
	}

	/**
	 * The length of the buffer in samples
	 */
	get length(): Samples {
		if (this._buffer) {
			return this._buffer.length;
		} else {
			return 0;
		}
	}

	/**
	 * The number of discrete audio channels. Returns 0 if no buffer is loaded.
	 */
	get numberOfChannels(): number {
		if (this._buffer) {
			return this._buffer.numberOfChannels;
		} else {
			return 0;
		}
	}

	/**
	 * Reverse the buffer.
	 */
	get reverse(): boolean {
		return this._reversed;
	}
	set reverse(rev: boolean) {
		if (this._reversed !== rev) {
			this._reversed = rev;
			this._reverse();
		}
	}

	//-------------------------------------
	// STATIC METHODS
	//-------------------------------------

	/**
	 * A path which is prefixed before every url.
	 */
	static baseUrl = "";

	/**
	 * Create a ToneAudioBuffer from the array. To create a multichannel AudioBuffer,
	 * pass in a multidimensional array.
	 * @param array The array to fill the audio buffer
	 * @return A ToneAudioBuffer created from the array
	 */
	static fromArray(array: Float32Array | Float32Array[]): ToneMediaElement {
		return new ToneMediaElement().fromArray(array);
	}

	/**
	 * Loads a url using fetch and returns the AudioBuffer.
	 */
	static async load(url: string): Promise<AudioBuffer> {
		// test if the url contains multiple extensions
		const matches = url.match(/\[([^\]\[]+\|.+)\]$/);
		if (matches) {
			const extensions = matches[1].split("|");
			let extension = extensions[0];
			for (const ext of extensions) {
				if (ToneMediaElement.supportsType(ext)) {
					extension = ext;
					break;
				}
			}
			url = url.replace(matches[0], extension);
		}

		// make sure there is a slash between the baseUrl and the url
		const baseUrl =
			ToneMediaElement.baseUrl === "" ||
			ToneMediaElement.baseUrl.endsWith("/")
				? ToneMediaElement.baseUrl
				: ToneMediaElement.baseUrl + "/";
		let href = baseUrl + url;

		if (!href.startsWith("file:/") && decodeURIComponent(href) === href) {
			// if file:/ scheme, assume already encoded, otherwise use decodeURIComponent to check if already encoded
			// encode special characters in file path
			const anchorElement = document.createElement("a");
			anchorElement.href = href;
			// check if already encoded one more time since in many cases setting the .href automatically encodes the string
			if (
				!anchorElement.href.startsWith("file:/") &&
				decodeURIComponent(anchorElement.href) === anchorElement.href
			) {
				anchorElement.pathname = (
					anchorElement.pathname + anchorElement.hash
				)
					.split("/")
					.map(encodeURIComponent)
					.join("/");
			}
			href = anchorElement.href;
		}

		const response = await fetch(href);
		if (!response.ok) {
			throw new Error(`could not load url: ${url}`);
		}
		const arrayBuffer = await response.arrayBuffer();

		const audioBuffer = await getContext().decodeAudioData(arrayBuffer);

		return audioBuffer;
	}

	/**
	 * Checks a url's extension to see if the current browser can play that file type.
	 * @param url The url/extension to test
	 * @return If the file extension can be played
	 * @static
	 * @example
	 * Tone.ToneAudioBuffer.supportsType("wav"); // returns true
	 * Tone.ToneAudioBuffer.supportsType("path/to/file.wav"); // returns true
	 */
	static supportsType(url: string): boolean {
		const extensions = url.split(".");
		const extension = extensions[extensions.length - 1];
		const response = document
			.createElement("audio")
			.canPlayType("audio/" + extension);
		return response !== "";
	}

	/**
	 * Returns a Promise which resolves when all of the buffers have loaded
	 */
	static async loaded(): Promise<void> {
		// this makes sure that the function is always async
		await Promise.resolve();
		while (ToneMediaElement.downloads.length) {
			await ToneMediaElement.downloads[0];
		}
	}
}
