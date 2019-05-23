import "./Units";

/**
 *  Equal power gain scale. Good for cross-fading.
 *  @param  percent (0-1)
 */
export function equalPowerScale(percent: NormalRange): number {
	const piFactor = 0.5 * Math.PI;
	return Math.sin(percent * piFactor);
}

/**
 *  Convert decibels into gain.
 */
export function dbToGain(db: Decibels): GainFactor {
	return Math.pow(10, db / 20);
}

/**
 *  Convert gain to decibels.
 */
export function gainToDb(gain: GainFactor): Decibels {
	return 20 * (Math.log(gain) / Math.LN10);
}

/**
 * Convert an interval (in semitones) to a frequency ratio.
 * @param interval the number of semitones above the base note
 * @example
 * tone.intervalToFrequencyRatio(0); // 1
 * tone.intervalToFrequencyRatio(12); // 2
 * tone.intervalToFrequencyRatio(-12); // 0.5
 */
export function intervalToFrequencyRatio(interval: Interval): number {
	return Math.pow(2, (interval / 12));
}
