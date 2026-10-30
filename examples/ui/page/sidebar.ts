import { css, html, LitElement } from "lit";
import { customElement, query, state } from "lit/decorators.js";

/**
 * Map of group name to a map of example name to example url
 */
type ExampleList = Record<string, Record<string, string>>;

/**
 * The list of all of the examples
 */
@customElement("tone-sidebar")
export class ToneSidebar extends LitElement {
	@state()
	private _loading = true;

	@state()
	private _examples: ExampleList = {};

	@query("li[selected]")
	private _selected: HTMLLIElement;

	static override styles = css`
		:host {
			display: block;
			background-color: var(--light-gray, #ececec);
		}

		ul,
		li {
			padding: 5px 10px;
			text-align: left;
			list-style-type: none;
			font-family: sans-serif;
			width: 100%;
		}
		ul:last-child {
			padding-bottom: 20px;
		}
		ul span {
			text-transform: uppercase;
			border-bottom: 1px solid #616161;
			margin-bottom: 10px;
			width: 100%;
			display: block;
			color: #616161;
		}

		li a {
			text-decoration: none;
			color: black;
			width: 100%;
			display: block;
		}

		li[selected] {
			border-top-left-radius: 4px;
			border-bottom-left-radius: 4px;
			background-color: white;
		}
	`;

	protected override async firstUpdated() {
		const response = await fetch("./js/ExampleList.json");
		if (response.ok) {
			this._examples = await response.json();
			this._loading = false;
			await this.updateComplete;
			// scroll the selected example to the middle of the list
			if (this._selected) {
				this.scrollTop =
					this._selected.offsetTop - this.clientHeight / 2;
			}
		}
	}

	private _renderGroup(group: string) {
		// the example list urls don't include the .html extension
		const exampleName = window.location.pathname
			.split("/")
			.pop()
			.replace(/\.html$/, "");
		const examples = this._examples[group];
		return html`
			<ul id="group">
				<span>${group}</span>
				${Object.keys(examples).map(
					(name) => html`
						<li ?selected=${exampleName === examples[name]}>
							<a href=${examples[name]}>${name}</a>
						</li>
					`
				)}
			</ul>
		`;
	}

	protected override render() {
		return this._loading
			? "loading"
			: Object.keys(this._examples).map((group) =>
					this._renderGroup(group)
				);
	}
}

declare global {
	interface HTMLElementTagNameMap {
		"tone-sidebar": ToneSidebar;
	}
}
