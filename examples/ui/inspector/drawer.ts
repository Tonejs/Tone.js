import "./folder";

import { css, html, LitElement } from "lit";
import { customElement } from "lit/decorators.js";
import { ToneAudioNode } from "tone";

import { defaultParent, placeControls } from "../bind";
import { ToneAudioNodeElementOptions, ui } from "./audio-node";
import { ToneFolderElement } from "./folder";

/**
 * A group of node controls, on an example page they go in the controls sidebar
 */
@customElement("tone-drawer")
export class ToneDrawerElement extends LitElement {
	static override styles = css`
		:host {
			display: block;
		}
	`;

	/**
	 * Add an element which edits the values of the node
	 */
	add(tone: ToneAudioNode, options?: ToneAudioNodeElementOptions): this {
		ui(tone, options, this);
		return this;
	}

	/**
	 * Create a folder with the given name
	 */
	folder(name: string, { open = true } = {}): ToneFolderElement {
		const element = document.createElement("tone-folder");
		element.name = name;
		element.open = open;
		this.appendChild(element);
		return element;
	}

	protected override render() {
		return html`<slot></slot>`;
	}
}

/**
 * Create a group of node controls
 */
export function drawer(): ToneDrawerElement {
	const element = document.createElement("tone-drawer");
	placeControls(element, defaultParent());
	return element;
}

declare global {
	interface HTMLElementTagNameMap {
		"tone-drawer": ToneDrawerElement;
	}
}
