import "./sidebar";
import "./mute";
import "./loader";
import "./code";

import { css, html, LitElement } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { classMap } from "lit/directives/class-map.js";
import { version } from "tone";

import { exampleCode } from "./code";

/**
 * The layout of an example page: a topbar, the list of examples on the left,
 * the controls of the example's nodes on the right and the example in between.
 * The default slot holds the example, the "explanation" slot describes it and
 * the "controls" slot holds the elements which edit the nodes.
 */
@customElement("tone-example")
export class ToneExample extends LitElement {
	/**
	 * Defaults to the document title
	 */
	@property({ type: String })
	label = document.title;

	/**
	 * The code of the scripts marked with data-tone-code
	 */
	@state()
	private _code = "";

	@state()
	private _hasControls = false;

	static override styles = css`
		:host {
			--topbar-height: 52px;
			--sidebar-width: 200px;
			--controls-width: 280px;
			display: block;
			font-family: sans-serif;
		}

		[hidden] {
			display: none !important;
		}

		#topbar {
			position: fixed;
			top: 0;
			left: 0;
			right: 0;
			z-index: 10;
			height: var(--topbar-height);
			box-sizing: border-box;
			padding: 0 15px;
			display: flex;
			align-items: center;
			justify-content: space-between;
			background-color: white;
		}

		#home {
			font-size: 1.2em;
			text-decoration: none;
			color: black;
		}

		tone-sidebar,
		#controls {
			position: fixed;
			top: var(--topbar-height);
			bottom: 0;
			box-sizing: border-box;
			overflow-y: auto;
			overscroll-behavior: contain;
		}

		tone-sidebar {
			left: 0;
			width: var(--sidebar-width);
			overflow-x: hidden;
		}

		#controls {
			right: 0;
			width: var(--controls-width);
			padding: 0 10px;
			background-color: white;
		}

		main {
			margin-top: var(--topbar-height);
			margin-left: var(--sidebar-width);
			padding: 40px;
		}

		main.has-controls {
			margin-right: var(--controls-width);
		}

		#title {
			font-size: 1.1em;
			color: #616161;
		}

		#explanation {
			margin: 20px 0;
		}

		::slotted(a) {
			text-decoration: none;
			color: #7f33ed;
		}

		#content {
			max-width: 600px;
			margin: 0px auto;
			display: flex;
			flex-direction: column;
			gap: 10px;
		}

		tone-code {
			max-width: 600px;
			margin: 20px auto 0;
		}
	`;

	override connectedCallback() {
		super.connectedCallback();
		// the scripts come after the element in the page
		if (document.readyState === "loading") {
			document.addEventListener(
				"DOMContentLoaded",
				() => (this._code = exampleCode()),
				{ once: true }
			);
		} else {
			this._code = exampleCode();
		}
	}

	protected override firstUpdated() {
		document.body.style.margin = "0px";
	}

	private _controlsChanged(e: Event) {
		const slot = e.target as HTMLSlotElement;
		this._hasControls = slot.assignedElements().length > 0;
	}

	protected override render() {
		return html`
			<tone-loader></tone-loader>
			<header id="topbar">
				<a id="home" href="https://tonejs.github.io"
					>Tone.js v${version}</a
				>
				<tone-mute></tone-mute>
			</header>
			<tone-sidebar></tone-sidebar>
			<main class=${classMap({ "has-controls": this._hasControls })}>
				<div id="title">${this.label}</div>
				<div id="explanation">
					<slot name="explanation"></slot>
				</div>
				<div id="content">
					<slot></slot>
				</div>
				${this._code
					? html`<tone-code .code=${this._code}></tone-code>`
					: null}
			</main>
			<aside id="controls" ?hidden=${!this._hasControls}>
				<slot
					name="controls"
					@slotchange=${this._controlsChanged}
				></slot>
			</aside>
		`;
	}
}

declare global {
	interface HTMLElementTagNameMap {
		"tone-example": ToneExample;
	}
}
