import "@material/web/icon/icon.js";
import "./values/number";
import "./values/string";
import "./values/array";
import "./values/boolean";

import { css, html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";
import { classMap } from "lit/directives/class-map.js";
import { live } from "lit/directives/live.js";
import { Param, PolySynth, Signal, ToneAudioNode } from "tone";

import { defaultParent, placeControls } from "../bind";
import {
	contentFont,
	icons,
	lightOrange,
	plainSummary,
	titleFont,
} from "../styles";
import { renderVis } from "../vis/index";
import { HeightController } from "./height";

export interface ToneAudioNodeElementOptions {
	name?: string;
	open?: boolean;
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
	 * If the node is open or closed
	 */
	@property({ type: Boolean })
	open = true;

	/**
	 * How many levels of sub-values are open until they are toggled
	 */
	@property({ type: Number })
	openDepth = 1;

	/**
	 * The paths of the sub-value folders which were opened or closed
	 */
	private _toggled = new Map<string, boolean>();

	constructor() {
		super();
		new HeightController(this, "#title", "--title-height");
	}

	static override styles = [
		icons,
		plainSummary,
		css`
			:host {
				display: block;
			}
			#container {
				font-family: ${contentFont};
				margin-bottom: 10px;
				border-bottom: 1px solid #ddd;
			}
			#title {
				font-size: 18px;
				font-family: ${titleFont};
				padding: 2px 2px 5px 2px;
			}
			/* the headers stick to the top of the controls while scrolling, under a folder's header */
			#title,
			.sticky > summary {
				position: sticky;
				top: var(--sticky-top, 0px);
				z-index: 2;
				background-color: white;
			}
			.sticky > summary {
				top: calc(var(--sticky-top, 0px) + var(--title-height, 0px));
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
			summary md-icon {
				--md-icon-size: 20px;
				vertical-align: middle;
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
		this.open = (e.target as HTMLDetailsElement).open;
	}

	private _toggleSubValue(e: Event, path: string[]) {
		this._toggled.set(
			path.join("."),
			(e.target as HTMLDetailsElement).open
		);
		this.requestUpdate();
	}

	private _renderValue(name: string, value: unknown, path: string[]) {
		const onValue = (e: CustomEvent<unknown>) =>
			this._setValue(path, e.detail);
		if (typeof value === "number") {
			return html`<tone-number
				class="value"
				name=${name}
				.value=${live(value)}
				@value=${onValue}
			></tone-number>`;
		} else if (typeof value === "string") {
			return html`<tone-string
				class="value"
				name=${name}
				.value=${live(value)}
				@value=${onValue}
			></tone-string>`;
		} else if (typeof value === "boolean") {
			return html`<tone-boolean
				class="value"
				name=${name}
				.value=${live(value)}
				@value=${onValue}
			></tone-boolean>`;
		} else if (Array.isArray(value)) {
			return html`<tone-array
				class="value"
				name=${name}
				.value=${live(value)}
				@value=${onValue}
			></tone-array>`;
		} else if (value && typeof value === "object") {
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
						<md-icon
							>${open
								? "arrow_drop_down"
								: "arrow_right"}</md-icon
						>
						${name}
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
				? this.tone["_dummyVoice"]
				: this.tone;
		const node = path.reduce((obj, prop) => obj?.[prop], root);
		const isObject = (v: unknown) =>
			v !== null && typeof v === "object" && !Array.isArray(v);
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
				this._renderValue(name, values[name], [...path, name])
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
				<details ?open=${this.open} @toggle=${this._toggleOpen}>
					<summary id="title">
						<md-icon>
							${this.open
								? "keyboard_arrow_down"
								: "keyboard_arrow_right"}
						</md-icon>
						<span>${this.name}</span>
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
	{ name = tone.toString(), open = true }: ToneAudioNodeElementOptions = {},
	parent: HTMLElement = defaultParent()
): ToneAudioNodeElement {
	const element = document.createElement("tone-audio-node");
	element.tone = tone;
	element.name = name;
	element.open = open;
	placeControls(element, parent);
	return element;
}

declare global {
	interface HTMLElementTagNameMap {
		"tone-audio-node": ToneAudioNodeElement;
	}
}
