import "./sidebar";
import "./mute";
import "./loader";
import "./code";
import "@material/web/icon/icon.js";

import { css, html, LitElement } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { classMap } from "lit/directives/class-map.js";
import { version } from "tone";

import { font, lightGray } from "../styles";
import { exampleCode } from "./code";

/**
 * The layout of an example page: a top-bar, the list of examples on the left,
 * the controls of the example's nodes on the right and the example in between.
 * On narrower screens the controls move below the example, and on narrow ones
 * the list of examples opens from a menu button.
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

	/**
	 * If the list of examples is open, when it is a menu on narrow screens
	 */
	@state()
	private _menuOpen = false;

	/**
	 * If the controls are expanded, when they are below the example
	 */
	@state()
	private _controlsOpen = true;

	static override styles = css`
		:host {
			--top-bar-height: 52px;
			--sidebar-width: 200px;
			--controls-width: 280px;
			display: block;
			font-family: ${font};
		}

		[hidden] {
			display: none !important;
		}

		#top-bar {
			position: fixed;
			top: 0;
			left: 0;
			right: 0;
			z-index: 10;
			height: var(--top-bar-height);
			box-sizing: border-box;
			padding: 0 15px;
			display: flex;
			align-items: center;
			justify-content: space-between;
			background-color: white;
			border-bottom: 1px solid ${lightGray};
		}

		#home {
			font-size: 1.2em;
			text-decoration: none;
			color: black;
		}

		#top-bar-start {
			display: flex;
			align-items: center;
			gap: 8px;
		}

		button {
			appearance: none;
			border: none;
			background-color: transparent;
			padding: 0px;
			font: inherit;
			color: inherit;
			cursor: pointer;
		}

		#menu,
		#backdrop,
		#controls-header {
			display: none;
		}

		#menu md-icon {
			--md-icon-font: "Material Icons";
		}

		tone-sidebar,
		#controls {
			position: fixed;
			top: var(--top-bar-height);
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
			border-left: 1px solid ${lightGray};
		}

		main {
			margin-top: var(--top-bar-height);
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

		/* the controls go below the example */
		@media (max-width: 1100px) {
			main.has-controls {
				margin-right: 0px;
			}

			#controls {
				position: static;
				width: auto;
				max-width: 600px;
				margin: 30px auto 0;
				padding: 0px;
				overflow: visible;
				border-left: none;
				/* the page scrolls, so the headers stick below the top-bar */
				--sticky-offset: var(--top-bar-height);
			}

			#controls-header {
				display: flex;
				align-items: center;
				justify-content: space-between;
				width: 100%;
				padding: 6px 0px;
				margin-bottom: 10px;
				border-bottom: 1px solid ${lightGray};
				font-size: 0.8em;
				text-transform: uppercase;
				color: #616161;
			}

			#controls-header .chevron {
				width: 5px;
				height: 5px;
				margin: 0px 6px;
				border-right: 1.5px solid #999;
				border-bottom: 1.5px solid #999;
				transform: rotate(45deg);
			}

			#controls.closed #controls-header .chevron {
				transform: rotate(-45deg);
			}

			#controls.closed slot {
				display: none;
			}
		}

		/* the list of examples opens from the menu button */
		@media (max-width: 760px) {
			#menu {
				display: flex;
			}

			tone-sidebar {
				z-index: 20;
				transform: translateX(-100%);
				transition: transform 0.2s;
			}

			tone-sidebar.open {
				transform: none;
				box-shadow: 0 0 12px rgba(0, 0, 0, 0.15);
			}

			#backdrop.open {
				display: block;
				position: fixed;
				inset: var(--top-bar-height) 0 0 0;
				z-index: 15;
				background-color: rgba(0, 0, 0, 0.1);
			}

			main {
				margin-left: 0px;
				padding: 20px 16px;
			}
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

	override disconnectedCallback() {
		super.disconnectedCallback();
		document.removeEventListener("keydown", this._onKeydown);
	}

	protected override firstUpdated() {
		document.body.style.margin = "0px";
		document.addEventListener("keydown", this._onKeydown);
	}

	private _onKeydown = (e: KeyboardEvent) => {
		if (e.key === "Escape") {
			this._menuOpen = false;
		}
	};

	private _toggleMenu() {
		this._menuOpen = !this._menuOpen;
	}

	private _closeMenu() {
		this._menuOpen = false;
	}

	private _toggleControls() {
		this._controlsOpen = !this._controlsOpen;
	}

	private _controlsChanged(e: Event) {
		const slot = e.target as HTMLSlotElement;
		this._hasControls = slot.assignedElements().length > 0;
	}

	protected override render() {
		return html`
			<tone-loader></tone-loader>
			<header id="top-bar">
				<div id="top-bar-start">
					<button
						id="menu"
						aria-label="Examples"
						aria-expanded=${this._menuOpen}
						@click=${this._toggleMenu}
					>
						<md-icon>${this._menuOpen ? "close" : "menu"}</md-icon>
					</button>
					<a id="home" href="https://tonejs.github.io"
						>Tone.js v${version}</a
					>
				</div>
				<tone-mute></tone-mute>
			</header>
			<tone-sidebar
				class=${classMap({ open: this._menuOpen })}
				@click=${this._closeMenu}
			></tone-sidebar>
			<div
				id="backdrop"
				class=${classMap({ open: this._menuOpen })}
				@click=${this._closeMenu}
			></div>
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
				<aside
					id="controls"
					class=${classMap({ closed: !this._controlsOpen })}
					?hidden=${!this._hasControls}
				>
					<button
						id="controls-header"
						aria-expanded=${this._controlsOpen}
						@click=${this._toggleControls}
					>
						<span>Controls</span>
						<span class="chevron"></span>
					</button>
					<slot
						name="controls"
						@slotchange=${this._controlsChanged}
					></slot>
				</aside>
			</main>
		`;
	}
}

declare global {
	interface HTMLElementTagNameMap {
		"tone-example": ToneExample;
	}
}
