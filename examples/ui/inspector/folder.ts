import { css, html, LitElement } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { ToneAudioNode } from "tone";

import { disclosure, font } from "../styles";
import { ToneAudioNodeElementOptions, ui } from "./audio-node";
import { HeightController } from "./height";

/**
 * A collapsible folder of node controls
 */
@customElement("tone-folder")
export class ToneFolderElement extends LitElement {
	/**
	 * The name of the folder
	 */
	@property({ type: String })
	name: string;

	@state()
	private _open = true;

	static override styles = [
		disclosure,
		css`
			:host {
				display: block;
				font-family: ${font};
				margin-bottom: 10px;
			}
			summary {
				font-weight: bold;
				font-size: 1.1em;
				border-bottom: 1px solid black;
				position: sticky;
				top: var(--sticky-offset, 0px);
				z-index: 3;
				background-color: white;
			}
			#contents {
				margin-left: 5px;
				/* the node headers stick under the folder's header */
				--sticky-top: var(--summary-height, 0px);
			}
		`,
	];

	constructor() {
		super();
		new HeightController(this, "summary", "--summary-height");
	}

	/**
	 * Add an element which edits the values of the node
	 */
	add(tone: ToneAudioNode, options?: ToneAudioNodeElementOptions): this {
		// the folder is the first level, so the sub-values start closed
		ui(tone, options, this).openDepth = 0;
		return this;
	}

	private _toggle(e: Event) {
		this._open = (e.target as HTMLDetailsElement).open;
	}

	protected override render() {
		return html`
			<details ?open=${this._open} @toggle=${this._toggle}>
				<summary>
					<span>${this.name}</span>
					<span class="chevron"></span>
				</summary>
				<div id="contents">
					<slot></slot>
				</div>
			</details>
		`;
	}
}

declare global {
	interface HTMLElementTagNameMap {
		"tone-folder": ToneFolderElement;
	}
}
