import "./values/number";
import "./values/string";
import "./values/array";
import "./values/boolean";

import { css, html, LitElement } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { classMap } from "lit/directives/class-map.js";
import { live } from "lit/directives/live.js";
import {
	isArray,
	isBoolean,
	isNumber,
	isObject,
	isString,
	Param,
	PolySynth,
	Signal,
	ToneAudioNode,
} from "tone";

import { defaultParent, placeControls } from "../bind";
import { disclosure, font, lightOrange } from "../styles";
import { renderVis } from "../vis/index";
import { HeightController } from "./height";
import { displayUnit } from "./units";

export interface ToneAudioNodeElementOptions {
	name?: string;
}

/**
 * Displays and edits all of the values of a Tone.js node
 */
@customElement("tone-audio-node")
export class ToneAudioNodeElement extends LitElement {
	@property({ attribute: false })
	tone: ToneAudioNode;

	/**
	 * The name of the node
	 */
	@property({ type: String })
	name: string;

	/**
	 * How many levels of sub-values are open until they are toggled
	 */
	@property({ type: Number })
	openDepth = 1;

	@state()
	private _open = true;

	/**
	 * The paths of the sub-value folders which were opened or closed
	 */
	private _toggled = new Map<string, boolean>();

	constructor() {
		super();
		new HeightController(this, "#title", "--title-height");
	}

	static override styles = [
		disclosure,
		css`
			:host {
				display: block;
			}
			#container {
				font-family: ${font};
				margin-bottom: 10px;
			}
			#title {
				font-size: 18px;
				font-family: ${font};
				padding: 2px 2px 5px 2px;
			}
			/* the headers stick to the top of the controls while scrolling, under a folder's header */
			#title,
			.sticky > summary {
				position: sticky;
				top: calc(var(--sticky-offset, 0px) + var(--sticky-top, 0px));
				z-index: 2;
				background-color: white;
			}
			.sticky > summary {
				top: calc(
					var(--sticky-offset, 0px) + var(--sticky-top, 0px) +
						var(--title-height, 0px)
				);
				z-index: 1;
				/* opaque version of the sub-value background */
				background-color: #f2f2f2;
			}
			.value {
				display: block;
				margin-top: 4px;
			}
			details {
				margin-top: 4px;
				font-size: 14px;
				line-height: 24px;
			}
			details.sub-value {
				background-color: rgba(0, 0, 0, 0.05);
				padding: 5px;
			}
			summary:focus {
				outline: none;
				background-color: ${lightOrange};
			}
		`,
	];

	/**
	 * Set the value at the path. Invalid values are reverted,
	 * re-rendering from the node's values puts the input back.
	 */
	private _setValue(path: string[], value: unknown) {
		const previous = path.reduce((obj, prop) => obj[prop], this.tone.get());
		try {
			this.tone.set(this._pathToObject(path, value));
		} catch {
			// setters can throw after partially applying the value
			this.tone.set(this._pathToObject(path, previous));
		}
		this.requestUpdate();
	}

	private _pathToObject(path: string[], value: unknown): object {
		return path.reduceRight<unknown>(
			(child, prop) => ({ [prop]: child }),
			value
		) as object;
	}

	private _toggleOpen(e: Event) {
		this._open = (e.target as HTMLDetailsElement).open;
	}

	private _toggleSubValue(e: Event, path: string[]) {
		this._toggled.set(
			path.join("."),
			(e.target as HTMLDetailsElement).open
		);
		this.requestUpdate();
	}

	private _renderValue(
		name: string,
		value: unknown,
		path: string[],
		param: unknown
	) {
		const onValue = (e: CustomEvent<unknown>) =>
			this._setValue(path, e.detail);
		if (isNumber(value)) {
			return html`<tone-number
				class="value"
				name=${name}
				.unit=${displayUnit(name, param)}
				.value=${live(value)}
				@value=${onValue}
			></tone-number>`;
		} else if (isString(value)) {
			return html`<tone-string
				class="value"
				name=${name}
				.value=${live(value)}
				@value=${onValue}
			></tone-string>`;
		} else if (isBoolean(value)) {
			return html`<tone-boolean
				class="value"
				name=${name}
				.value=${live(value)}
				@value=${onValue}
			></tone-boolean>`;
		} else if (isArray(value)) {
			return html`<tone-array
				class="value"
				name=${name}
				.value=${live(value)}
				@value=${onValue}
			></tone-array>`;
		} else if (isObject(value)) {
			const open =
				this._toggled.get(path.join(".")) ??
				path.length <= this.openDepth;
			return html`
				<details
					class=${classMap({
						"sub-value": true,
						// only the first level sticks, deeper levels would cover it
						sticky: path.length === 1,
					})}
					?open=${open}
					@toggle=${(e: Event) => this._toggleSubValue(e, path)}
				>
					<summary>
						<span>${name}</span>
						<span class="chevron"></span>
					</summary>
					${this._renderValues(value, path)}
				</details>
			`;
		}
	}

	/**
	 * Render a visualization of the node at the path
	 * followed by all of its values
	 */
	private _renderValues(values: object, path: string[]) {
		// a PolySynth's values are the values of its voices
		const root =
			this.tone instanceof PolySynth
				? Reflect.get(this.tone, "_dummyVoice")
				: this.tone;
		const node = path.reduce((obj, prop) => obj?.[prop], root);
		// values driven by a connected signal can't be set
		const isOverridden = (name: string) => {
			const param = node?.[name];
			return (
				(param instanceof Param || param instanceof Signal) &&
				param.overridden
			);
		};
		// the primitive values come before the nested objects
		const names = Object.keys(values)
			.sort()
			.filter(
				(name) =>
					!isOverridden(name) &&
					(!isObject(values[name]) ||
						Object.keys(values[name]).length)
			)
			.sort(
				(a, b) =>
					Number(isObject(values[a])) - Number(isObject(values[b]))
			);
		return html`
			${node instanceof ToneAudioNode ? renderVis(node, values) : null}
			${names.map((name) =>
				this._renderValue(
					name,
					values[name],
					[...path, name],
					node?.[name]
				)
			)}
		`;
	}

	protected override render() {
		if (!this.tone) {
			return null;
		}
		const values = this.tone.get();
		return html`
			<div id="container">
				<details ?open=${this._open} @toggle=${this._toggleOpen}>
					<summary id="title">
						<span>${this.name}</span>
						<span class="chevron"></span>
					</summary>
					${this._renderValues(values, [])}
				</details>
			</div>
		`;
	}
}

/**
 * Create an element which displays and edits all of the values of the node.
 * On an example page it goes in the controls sidebar.
 */
export function ui(
	tone: ToneAudioNode,
	{ name = tone.toString() }: ToneAudioNodeElementOptions = {},
	parent: HTMLElement = defaultParent()
): ToneAudioNodeElement {
	const element = document.createElement("tone-audio-node");
	element.tone = tone;
	element.name = name;
	placeControls(element, parent);
	return element;
}

declare global {
	interface HTMLElementTagNameMap {
		"tone-audio-node": ToneAudioNodeElement;
	}
}
