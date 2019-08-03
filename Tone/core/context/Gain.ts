import { Param } from "../context/Param";
import { GainFactor, Unit, UnitName } from "../type/Units";
import { optionsFromArguments } from "../util/Defaults";
import { readOnly } from "../util/Interface";
import { ToneAudioNode, ToneAudioNodeOptions } from "./ToneAudioNode";

interface GainOptions extends ToneAudioNodeOptions {
	gain: number;
	units: UnitName;
	convert: boolean;
}

/**
 * A thin wrapper around the Native Web Audio GainNode.
 * The GainNode is a basic building block of the Web Audio
 * API and is useful for routing audio and adjusting gains.
 * @param  gain The initial gain of the GainNode
 * @param units The units of the gain parameter.
 */
export class Gain<Type extends Unit = GainFactor> extends ToneAudioNode<GainOptions> {

	readonly name = "Gain";

	/**
	 *  The gain parameter of the gain node.
	 */
	readonly gain: Param<Type>;

	/**
	 * The wrapped GainNode.
	 */
	private _gainNode: GainNode = this.context.createGain();

	// input = output
	readonly input: GainNode = this._gainNode;
	readonly output: GainNode = this._gainNode;

	/**
	 * Add all of the gain nodes
	 */
	protected _internalChannels: AudioNode[] = [this._gainNode];

	constructor(gain?: GainFactor, units?: Unit);
	constructor(options?: Partial<GainOptions>);
	constructor() {
		super(optionsFromArguments(Gain.getDefaults(), arguments, ["gain", "units"]));
		const options = optionsFromArguments(Gain.getDefaults(), arguments, ["gain", "units"]);

		this.gain = new Param({
			context : this.context,
			convert : options.convert,
			param : this._gainNode.gain,
			units : options.units,
			value : options.gain,
		});
		readOnly(this, "gain");
	}

	static getDefaults(): GainOptions {
		return Object.assign(ToneAudioNode.getDefaults(), {
			convert : true,
			gain : 1,
			units : "gain" as UnitName,
		});
	}

	/**
	 *  Clean up.
	 */
	dispose(): this {
		super.dispose();
		this._gainNode.disconnect();
		this.gain.dispose();
		return this;
	}
}
