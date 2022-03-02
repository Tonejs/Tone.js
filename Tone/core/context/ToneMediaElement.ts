import { getContext } from "../Global";
import { Tone } from "../Tone";
import { Samples, Seconds } from "../type/Units";
import { optionsFromArguments } from "../util/Defaults";
import { noOp } from "../util/Interface";

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
	private _element?: HTMLAudioElement;

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
			const element = ToneMediaElement.load(options.url);

			if (!element) {
				options.onerror(new Error("Cannot create ToneMediaElement"));
				return;
			}

			this._element = element;
		}
	}

	static getDefaults(): ToneMediaElementOptions {
		return {
			onerror: noOp,
			onload: noOp,
		};
	}

	/**
	 * The media element stored in the object.
	 */
	get(): HTMLAudioElement | undefined {
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

	//-------------------------------------
	// STATIC METHODS
	//-------------------------------------

	/**
	 * A path which is prefixed before every url.
	 */
	static baseUrl = "";

	/**
	 * Creates HTMLAudioElement for provided url.
	 */
	static load(url: string): HTMLAudioElement {
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

		// eslint-disable-next-line no-console
		console.log("load", url, href);

		const element = new Audio(href);
		if (!element) {
			throw new Error(
				`could not create HTMLAudioElement for source: ${url}`
			);
		}

		return element;
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
}
