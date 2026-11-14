import { ToneAudioNode } from "../../core/context/ToneAudioNode.js";

/**
 * DCFilter is a filter that removes DC offsets to center a signal at zero.
 * It uses a first-order highpass IIRFilterNode (similar to {@link OnePoleFilter})
 * with the transfer function:
 *
 * ```
 * y[n] = x[n] - x[n-1] + a * y[n-1]
 *
 *           1 - z⁻¹
 * H(z) = ------------
 *         1 - a * z⁻¹
 * ```
 *
 * where `a = 0.995`.
 *
 * This is useful for removing DC offsets introduced by asymmetric waveshaping or
 * signal processing (such as {@link Abs} or {@link WaveShaper}) to keep the waveform
 * centered around zero and prevent clipping or clicks.
 *
 * References:
 * * https://www.musicdsp.org/en/latest/Filters/135-dc-filter.html
 * * https://ccrma.stanford.edu/~jos/fp/DC_Blocker_Frequency_Response.html
 * * http://peabody.sapp.org/class/dmp2/lab/dcblock/
 *
 * @example
 * const filter = new Tone.DCFilter().toDestination();
 * const abs = new Tone.Abs();
 * const osc = new Tone.Oscillator();
 *
 * osc.chain(abs, filter);
 * osc.start();
 *
 * @category Component
 */
export class DCFilter extends ToneAudioNode {
	readonly name: string = "DCFilter";

	private _filter: IIRFilterNode = this.context.createIIRFilter(
		[1, -1],
		[1, -0.995]
	);

	readonly input = this._filter;
	readonly output = this._filter;

	dispose(): this {
		super.dispose();
		this._filter.disconnect();
		return this;
	}
}
