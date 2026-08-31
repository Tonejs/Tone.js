import { onContextClose, onContextInit } from "./ContextInitialization.js";
import { Param } from "./Param.js";
import { ToneAudioNode, ToneAudioNodeOptions } from "./ToneAudioNode.js";

export interface ListenerOptions extends ToneAudioNodeOptions {
	positionX: number;
	positionY: number;
	positionZ: number;
	forwardX: number;
	forwardY: number;
	forwardZ: number;
	upX: number;
	upY: number;
	upZ: number;
}

/**
 * Tone.Listener is a thin wrapper around the AudioListener. Listener combined
 * with {@link Panner3D} makes up the Web Audio API's 3D panning system. Panner3D allows you
 * to place sounds in 3D and Listener allows you to navigate the 3D sound environment from
 * a first-person perspective. There is only one listener per audio context.
 * @category Core
 */
export class ListenerInstance extends ToneAudioNode<ListenerOptions> {
	readonly name: string = "Listener";

	/**
	 * The listener has no inputs or outputs.
	 */
	output: undefined;
	input: undefined;

	/**
	 * The nine AudioListener params are constructed lazily, on first access,
	 * instead of eagerly in the constructor. Some browsers (e.g. Firefox) don't
	 * implement the AudioListener position/forward/up AudioParams, which makes
	 * wrapping them in a Param throw immediately when a consumer passes in
	 * their own native AudioContext via Tone.setContext(). Apps that never
	 * touch 3D spatialization can still use such a context as long as these
	 * getters are never called.
	 */
	private _positionX?: Param;
	get positionX(): Param {
		if (!this._positionX) {
			this._positionX = new Param({
				context: this.context,
				param: this.context.rawContext.listener.positionX,
			});
		}
		return this._positionX;
	}

	private _positionY?: Param;
	get positionY(): Param {
		if (!this._positionY) {
			this._positionY = new Param({
				context: this.context,
				param: this.context.rawContext.listener.positionY,
			});
		}
		return this._positionY;
	}

	private _positionZ?: Param;
	get positionZ(): Param {
		if (!this._positionZ) {
			this._positionZ = new Param({
				context: this.context,
				param: this.context.rawContext.listener.positionZ,
			});
		}
		return this._positionZ;
	}

	private _forwardX?: Param;
	get forwardX(): Param {
		if (!this._forwardX) {
			this._forwardX = new Param({
				context: this.context,
				param: this.context.rawContext.listener.forwardX,
			});
		}
		return this._forwardX;
	}

	private _forwardY?: Param;
	get forwardY(): Param {
		if (!this._forwardY) {
			this._forwardY = new Param({
				context: this.context,
				param: this.context.rawContext.listener.forwardY,
			});
		}
		return this._forwardY;
	}

	private _forwardZ?: Param;
	get forwardZ(): Param {
		if (!this._forwardZ) {
			this._forwardZ = new Param({
				context: this.context,
				param: this.context.rawContext.listener.forwardZ,
			});
		}
		return this._forwardZ;
	}

	private _upX?: Param;
	get upX(): Param {
		if (!this._upX) {
			this._upX = new Param({
				context: this.context,
				param: this.context.rawContext.listener.upX,
			});
		}
		return this._upX;
	}

	private _upY?: Param;
	get upY(): Param {
		if (!this._upY) {
			this._upY = new Param({
				context: this.context,
				param: this.context.rawContext.listener.upY,
			});
		}
		return this._upY;
	}

	private _upZ?: Param;
	get upZ(): Param {
		if (!this._upZ) {
			this._upZ = new Param({
				context: this.context,
				param: this.context.rawContext.listener.upZ,
			});
		}
		return this._upZ;
	}

	static getDefaults(): ListenerOptions {
		return Object.assign(ToneAudioNode.getDefaults(), {
			positionX: 0,
			positionY: 0,
			positionZ: 0,
			forwardX: 0,
			forwardY: 0,
			forwardZ: -1,
			upX: 0,
			upY: 1,
			upZ: 0,
		});
	}

	dispose(): this {
		super.dispose();
		this._positionX?.dispose();
		this._positionY?.dispose();
		this._positionZ?.dispose();
		this._forwardX?.dispose();
		this._forwardY?.dispose();
		this._forwardZ?.dispose();
		this._upX?.dispose();
		this._upY?.dispose();
		this._upZ?.dispose();
		return this;
	}
}

//-------------------------------------
// 	INITIALIZATION
//-------------------------------------

onContextInit((context) => {
	context.listener = new ListenerInstance({ context });
});

onContextClose((context) => {
	context.listener.dispose();
});
