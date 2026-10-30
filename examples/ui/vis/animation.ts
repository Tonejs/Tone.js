import { ReactiveController, ReactiveControllerHost } from "lit";

/**
 * Invokes the callback every animation frame while the host is connected
 */
export class AnimationController implements ReactiveController {
	private _frame = -1;

	constructor(
		host: ReactiveControllerHost,
		private readonly _callback: () => void
	) {
		host.addController(this);
	}

	hostConnected() {
		const loop = () => {
			this._callback();
			this._frame = requestAnimationFrame(loop);
		};
		this._frame = requestAnimationFrame(loop);
	}

	hostDisconnected() {
		cancelAnimationFrame(this._frame);
	}
}
