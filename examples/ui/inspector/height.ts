import { ReactiveController, ReactiveControllerHost } from "lit";

/**
 * Keeps a CSS variable on the host set to the height of an element in its
 * shadow root, so the sticky headers below it know where to stick
 */
export class HeightController implements ReactiveController {
	private _observer: ResizeObserver;

	constructor(
		private _host: ReactiveControllerHost & HTMLElement,
		private _selector: string,
		private _variable: string
	) {
		_host.addController(this);
	}

	hostUpdated() {
		// the element might not be rendered until the host has its values
		const element = this._host.shadowRoot?.querySelector(this._selector);
		if (!this._observer && element) {
			this._observer = new ResizeObserver(() => {
				const height = element.getBoundingClientRect().height;
				this._host.style.setProperty(this._variable, `${height}px`);
			});
			this._observer.observe(element);
		}
	}

	hostDisconnected() {
		this._observer?.disconnect();
		this._observer = undefined;
	}
}
