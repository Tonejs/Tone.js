import { Tone } from "../Tone";
import { optionsFromArguments } from "../util/Defaults";
import { noOp } from "../util/Interface";
import { isString } from "../util/TypeCheck";
import { ToneMediaElement } from "./ToneMediaElement";
import { assert } from "../util/Debug";

export interface ToneMediaElementsUrlMap {
	[name: string]: string;
	[name: number]: string;
}

interface ToneMediaElementsOptions {
	urls: ToneMediaElementsUrlMap;
	onload: () => void;
	onerror?: (error: Error) => void;
	baseUrl: string;
}

/**
 * A data structure for holding multiple MediaElements in a Map-like datastructure.
 *
 * @example
 * const pianoMediaElementSamples = new Tone.ToneMediaElements({
 * 	A1: "https://tonejs.github.io/audio/casio/A1.mp3",
 * 	A2: "https://tonejs.github.io/audio/casio/A2.mp3",
 * }, () => {
 * 	const player = new Tone.Player().toDestination();
 * 	// play one of the samples when they all load
 * 	player.element = pianoSamples.get("A2");
 * 	player.start();
 * });
 * @example
 * // To pass in additional parameters in the second parameter
 * const elements = new Tone.ToneMediaElements({
 * 	 urls: {
 * 		 A1: "A1.mp3",
 * 		 A2: "A2.mp3",
 * 	 },
 * 	 onload: () => console.log("loaded"),
 * 	 baseUrl: "https://tonejs.github.io/audio/casio/"
 * });
 * @category Core
 */
export class ToneMediaElements extends Tone {
	readonly name: string = "ToneMediaElements";

	/**
	 * All of the elements
	 */
	private _elements: Map<string, ToneMediaElement> = new Map();

	/**
	 * A path which is prefixed before every url.
	 */
	baseUrl: string;

	/**
	 * Keep track of the number of loaded elements
	 */
	private _loadingCount = 0;

	/**
	 * @param urls  An object literal or array of urls to load.
	 * @param onload  The callback to invoke when the elements are loaded.
	 * @param baseUrl A prefix url to add before all the urls
	 */
	constructor(
		urls?: ToneMediaElementsUrlMap,
		onload?: () => void,
		baseUrl?: string
	);
	constructor(options?: Partial<ToneMediaElementsOptions>);
	constructor() {
		super();
		const options = optionsFromArguments(
			ToneMediaElements.getDefaults(),
			arguments,
			["urls", "onload", "baseUrl"],
			"urls"
		);

		this.baseUrl = options.baseUrl;
		// add each one
		Object.keys(options.urls).forEach((name) => {
			this._loadingCount++;
			const url = options.urls[name];
			this.add(
				name,
				url,
				this._elementLoaded.bind(this, options.onload),
				options.onerror
			);
		});
	}

	static getDefaults(): ToneMediaElementsOptions {
		return {
			baseUrl: "",
			onerror: noOp,
			onload: noOp,
			urls: {},
		};
	}

	/**
	 * True if the elements object has a element by that name.
	 * @param  name  The key or index of the element.
	 */
	has(name: string | number): boolean {
		return this._elements.has(name.toString());
	}

	/**
	 * Get a element by name. If an array was loaded,
	 * then use the array index.
	 * @param  name  The key or index of the element.
	 */
	get(name: string | number): ToneMediaElement {
		assert(
			this.has(name),
			`ToneMediaElements has no element named: ${name}`
		);
		return this._elements.get(name.toString()) as ToneMediaElement;
	}

	/**
	 * A element was loaded. decrement the counter.
	 */
	private _elementLoaded(callback: () => void): void {
		this._loadingCount--;
		if (this._loadingCount === 0 && callback) {
			callback();
		}
	}

	/**
	 * Add a element by name and url to the elements
	 * @param  name      A unique name to give the element
	 * @param  url  Either the url of the bufer, or a element which will be added with the given name.
	 * @param  callback  The callback to invoke when the url is loaded.
	 * @param  onerror  Invoked if the element can't be loaded
	 */
	add(
		name: string | number,
		url: string,
		callback: () => void = noOp,
		onerror: (e: Error) => void = noOp
	): this {
		if (isString(url)) {
			// don't include the baseUrl if the url is a base64 encoded sound
			if (
				this.baseUrl &&
				url.trim().substring(0, 11).toLowerCase() === "data:audio/"
			) {
				this.baseUrl = "";
			}
			this._elements.set(
				name.toString(),
				new ToneMediaElement(this.baseUrl + url, callback, onerror)
			);
		} else {
			this._elements.set(
				name.toString(),
				new ToneMediaElement(url, callback, onerror)
			);
		}
		return this;
	}

	dispose(): this {
		super.dispose();
		this._elements.forEach((element) => element.dispose());
		this._elements.clear();
		return this;
	}
}
