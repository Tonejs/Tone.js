import { ToneAudioNode, ToneAudioNodeOptions } from "../../core/context/ToneAudioNode";
import { optionsFromArguments } from "../../core/util/Defaults";
import { Gain } from "../../core/context/Gain";

export type DCFilterOptions = ToneAudioNodeOptions; 

/**
 * 
 * Tone.DCFilter is a filter that removes DC offsets that are not centerd at zero
 * It is essentially a 1st order highpass alike filter, (Similar to a [[Tone.OnePoleFilter]]),
 * with a frequency around 20Hz or lower using a IIRFilterNode at a fixed value where a = -0.995 using this formula:
 * 
 *  y[n] = x[n] - x[n-1] + a * y[n-1]
 * 
 *  or
 *            1 - z⁻¹
 *  H(z) =  -----------
 *          1 - a * z⁻¹
 * 
 * This is useful for removing any clippling, popping or any other unsual sounds that
 * exceeds the nominal audio range of [1, -1] or between [1, 0] and [0, -1].
 * This can be also useful for applying DC offset filtering from nodes like 
 * [[Tone.WaveShaper]] or [[Tone.Oscillator]] etc, for some fine tuning or to prevent clipping in the waveform.
 * 
 * References:
 * * https://www.musicdsp.org/en/latest/Filters/135-dc-filter.html
 * * https://ccrma.stanford.edu/~jos/fp/DC_Blocker_Frequency_Response.html
 * * http://peabody.sapp.org/class/dmp2/lab/dcblock/
 * 
 * 
 * @example
 * const filter = new Tone.DCFilter().toDestination();
 * cosnt abs = new Tone.Abs();
 * const osc = new Tone.Oscillator();
 * 
 * osc.chain(abs, filter);
 * osc.start();
 * 
 * 
 * @category Component
 */

export class DCFilter extends ToneAudioNode<DCFilterOptions> {
    readonly name: string = "DCFilter";
    
    readonly input: Gain;
    readonly output: Gain;
    
    private _filter: IIRFilterNode;
    
    /**
     * No need for params because filter is a fixed value.
     * This is better because in a lot of DAWs in music, (especially professionals),
     * usally has a DC filter that dosen't require a lot of functionality (besides toggling on amd off).
     * 
     *
     * However, If you would like more parameters,
     * then please create a new issue or PR (Pull Request) to Tone.js requesting this.
     * Please make sure to include @Hazmatron7 and @tambien
     *
     * Please note that these are the only available parameters to add:
     *      - changable parameter for a instead of a fixed value. Range: [0, 0.999], default = 0.995.
     *      - inverse the phase direction by swapping the feedback coefficients from [1, -a] to [-1, a].
     *
     */
    
    constructor(options?: Partial<DCFilterOptions>)
    constructor() {
        super(optionsFromArguments(DCFilter.getDefaults(), arguments, []);
        
        this.input = new Gain({context: this.context});
        this.output = new Gain({context: this.context});
    
        // a = -0.995
        this._filter = this.context.createIIRFilter([1, -1], [1, -0.995]);
    
        this.input.chain(this._filter, this.output);
    
    }
    
    static getDefaults(): DCFilterOptions {
        return Object.assign(ToneAudioNode.getDefaults(), {});
    }
    
    getFrequencyResponse(len = 128): Float32Array {
        const freqValues = new Float32Array(len);
        for (let i = 0; i < len; i++) {
            const norm = Math.pow(i / len, 2);
            const freq = norm * (20000 - 20) + 20;
            freqValues[i] = freq;
        }
        const magValues = new Float32Array(len);
        const phaseValues = new Float32Array(len);
        this._filter.getFrequencyResponse(freqValues, magValues, phaseValues);
        return magValues;
    }
   
    dispose(): this {
        super.dispose();
        this.input.dispose();
        this.output.dispose();
        this._filter.disconnect();
        return this;
    }
}
