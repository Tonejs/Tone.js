import { css, html, LitElement } from "lit";
import { customElement, state } from "lit/decorators.js";
import { styleMap } from "lit/directives/style-map.js";
import { getDraw, getTransport, Sequence } from "tone";

import { Bindable } from "../bind";
import { focusOutline, lightOrange, orange } from "../styles";

/**
 * Invoked for each filled cell at the time it should be played
 */
type StepSequencerCallback = (time: number, row: number) => void;

@customElement("tone-step-sequencer")
export class ToneStepSequencer
	extends LitElement
	implements Bindable<StepSequencerCallback>
{
	private readonly _columns = 16;

	private readonly _rows = 4;

	@state()
	private _highlighted = -1;

	private _sequencer: Sequence<number>;

	/**
	 * If each cell is filled, by column then row
	 */
	private _matrix = this._indexArray(this._columns).map(() =>
		this._indexArray(this._rows).map(() => false)
	);

	private _started = false;

	static override styles = [
		focusOutline,
		css`
			:host {
				display: block;
				width: 100%;
			}
			#container {
				display: flex;
			}
			.column {
				flex: 1;
				display: flex;
				flex-direction: column;
			}
			.column[highlighted] {
				background-color: color-mix(
					in srgb,
					${orange} 50%,
					transparent
				);
			}
			.cell {
				margin: 2px;
				flex: 1;
				background-color: #aaa;
				border: none;
			}
			.cell[filled] {
				background-color: black;
			}
			.column[highlighted] .cell:not([filled]) {
				background-color: ${lightOrange};
			}
			.column[highlighted] .cell[filled] {
				transform: scale(1.2);
			}
		`,
	];

	bind(callback: StepSequencerCallback) {
		this.addEventListener(
			"trigger",
			({ detail }: CustomEvent<{ time: number; row: number }>) =>
				callback(detail.time, detail.row)
		);
	}

	override connectedCallback() {
		super.connectedCallback();
		getTransport().on("start", this._onStart);
		getTransport().on("stop", this._onStop);
		this._sequencer = new Sequence(
			this._tick.bind(this),
			this._indexArray(this._columns),
			"8n"
		).start(0);
	}

	override disconnectedCallback() {
		super.disconnectedCallback();
		getTransport().off("start", this._onStart);
		getTransport().off("stop", this._onStop);
		this._sequencer.dispose();
	}

	private _onStart = () => {
		this._started = true;
	};

	private _onStop = () => {
		this._highlighted = -1;
		this._started = false;
	};

	private _indexArray(count: number): number[] {
		return Array.from({ length: count }, (_, i) => i);
	}

	private _tick(time: number, index: number) {
		getDraw().schedule(() => {
			if (this._started) {
				this._highlighted = index;
			}
		}, time);
		this._matrix[index].forEach((value, row) => {
			if (value) {
				this.dispatchEvent(
					new CustomEvent("trigger", {
						detail: {
							time,
							row: this._rows - row - 1,
						},
						composed: true,
					})
				);
			}
		});
	}

	private _updateCell(column: number, row: number) {
		this._matrix[column][row] = !this._matrix[column][row];
		this.requestUpdate();
	}

	private _mouseover(e: MouseEvent, column: number, row: number) {
		if (e.buttons) {
			this._updateCell(column, row);
		}
	}

	protected override render() {
		const containerStyle = {
			height: "auto",
			aspectRatio: `${this._columns} / ${this._rows}`,
		};
		return html`
			<div id="container" style=${styleMap(containerStyle)}>
				${this._matrix.map(
					(column, x) => html`
						<div
							class="column"
							?highlighted=${x === this._highlighted}
						>
							${column.map(
								(cell, y) => html`
									<button
										@mouseover=${(e: MouseEvent) =>
											this._mouseover(e, x, y)}
										@mousedown=${(e: MouseEvent) =>
											this._mouseover(e, x, y)}
										class="cell focus-outline"
										?filled=${cell}
									></button>
								`
							)}
						</div>
					`
				)}
			</div>
		`;
	}
}

declare global {
	interface HTMLElementTagNameMap {
		"tone-step-sequencer": ToneStepSequencer;
	}
}
