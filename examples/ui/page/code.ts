import "@material/web/icon/icon.js";
import "@material/web/iconbutton/icon-button.js";

import hljs from "highlight.js/lib/core";
import javascript from "highlight.js/lib/languages/javascript";
import { css, html, LitElement } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { unsafeHTML } from "lit/directives/unsafe-html.js";

import { contentFont, icons, orange } from "../styles";

hljs.registerLanguage("javascript", javascript);

/**
 * Remove the leading and trailing blank lines and the indentation
 * which is common to all of the lines
 */
function dedent(code: string): string {
	const lines = code.replace(/^\s*\n|\n\s*$/g, "").split("\n");
	const indent = Math.min(
		...lines
			.filter((line) => line.trim())
			.map((line) => line.match(/^\s*/)[0].length)
	);
	return lines.map((line) => line.slice(indent)).join("\n");
}

/**
 * Displays the code of the example
 */
@customElement("tone-code")
export class ToneCode extends LitElement {
	@property({ type: String })
	code = "";

	@state()
	private _copied = false;

	static override styles = [
		icons,
		css`
			:host {
				display: block;
				position: relative;
			}
			pre {
				margin: 0;
				padding: 16px;
				overflow-x: auto;
				background-color: #f5f5f5;
				border-radius: 4px;
				font-size: 13px;
				line-height: 1.5;
				tab-size: 4;
			}
			md-icon-button {
				position: absolute;
				top: 4px;
				right: 4px;
				--md-icon-button-icon-color: #888;
			}
			#copied {
				position: absolute;
				top: 16px;
				right: 48px;
				font-family: ${contentFont};
				font-size: 12px;
				color: #888;
			}
			.hljs-keyword,
			.hljs-built_in {
				color: #7f33ed;
			}
			.hljs-string,
			.hljs-number,
			.hljs-literal {
				color: ${orange};
			}
			.hljs-comment {
				color: #999;
				font-style: italic;
			}
			.hljs-title,
			.hljs-property {
				color: #1565c0;
			}
		`,
	];

	private async _copy() {
		await navigator.clipboard.writeText(this.code);
		this._copied = true;
		setTimeout(() => (this._copied = false), 1500);
	}

	protected override render() {
		const highlighted = hljs.highlight(this.code, {
			language: "javascript",
		}).value;
		return html`
			<pre><code>${unsafeHTML(highlighted)}</code></pre>
			${this._copied ? html`<span id="copied">Copied</span>` : null}
			<md-icon-button @click=${this._copy} aria-label="Copy code">
				<md-icon>content_copy</md-icon>
			</md-icon-button>
		`;
	}
}

/**
 * The code of all of the scripts marked with data-tone-code
 */
export function exampleCode(): string {
	return Array.from(
		document.querySelectorAll<HTMLScriptElement>("script[data-tone-code]")
	)
		.map((script) => dedent(script.textContent))
		.join("\n\n");
}

declare global {
	interface HTMLElementTagNameMap {
		"tone-code": ToneCode;
	}
}
