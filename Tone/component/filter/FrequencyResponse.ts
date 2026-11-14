/**
 * Get the frequency response curve of a BiquadFilterNode or IIRFilterNode.
 * This curve represents how the filter responds to frequencies between 20Hz-20kHz.
 * @param filter The filter node to get the frequency response from
 * @param len The number of values to return
 * @return The frequency response curve between 20-20kHz
 */
export function getFrequencyResponse(
	filter: BiquadFilterNode | IIRFilterNode,
	len: number
): Float32Array {
	const freqValues = new Float32Array(len);
	for (let i = 0; i < len; i++) {
		const norm = Math.pow(i / len, 2);
		const freq = norm * (20000 - 20) + 20;
		freqValues[i] = freq;
	}
	const magValues = new Float32Array(len);
	const phaseValues = new Float32Array(len);
	filter.getFrequencyResponse(freqValues, magValues, phaseValues);
	return magValues;
}
