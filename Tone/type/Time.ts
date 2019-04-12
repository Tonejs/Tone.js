import { TypeBase, typeBaseExpressions } from "./TypeBase";

/**
 * Tone.Time is a primitive type for encoding Time values.
 * Tone.Time can be passed into the parameter of any method which takes time as an argument.
 * @param  val    The time value.
 * @param  units  The units of the value.
 * @example
 * var t = Time("4n");//a quarter note
 */
export class TimeConstructor extends TypeBase<"time"> {

	protected _expressions = Object.assign({}, typeBaseExpressions, {
		now : {
			regexp: /^\+(.+)/,
			method(capture): Seconds {
				return this._now() + (new this.constructor(capture));
			},
		},
		quantize: {
			regexp: /^@(.+)/,
			method(capture) {
				return 0;
				// if (Tone.Transport) {
				// 	const quantTo = new this.constructor(capture);
				// 	return this._secondsToUnits(Tone.Transport.nextSubdivision(quantTo));
				// } else {
				// }
			},
		},
	});

	/**
	 * Quantize the time by the given subdivision. Optionally add a
	 * percentage which will move the time value towards the ideal
	 * quantized value by that percentage.
	 * @param  val    The subdivision to quantize to
	 * @param  percent  Move the time value towards the quantized value by a percentage.
	 * @example
	 * Time(21).quantize(2) //returns 22
	 * Time(0.6).quantize("4n", 0.5) //returns 0.55
	 */
	quantize(subdiv: number | string | TimeObject, percent = 1): Seconds {
		const subdivision = new TimeConstructor(subdiv).valueOf();
		const value = this.valueOf();
		const multiple = Math.round(value / subdivision);
		const ideal = multiple * subdivision;
		const diff = ideal - value;
		return value + diff * percent;
	}

	///////////////////////////////////////////////////////////////////////////
	// CONVERSIONS
	///////////////////////////////////////////////////////////////////////////
	/**
	 *  Convert a Time to Notation. The notation values are will be the
	 *  closest representation between 1m to 128th note.
	 *  @return {Notation}
	 *  @example
	 * //if the Transport is at 120bpm:
	 * Time(2).toNotation();//returns "1m"
	 */
	toNotation(): Subdivision {
		const time = this.toSeconds();
		const testNotations: Subdivision[] = ["1m"];
		for (let power = 1; power < 8; power++) {
			const subdiv = Math.pow(2, power);
			testNotations.push(subdiv + "n." as Subdivision);
			testNotations.push(subdiv + "n" as Subdivision);
			testNotations.push(subdiv + "t" as Subdivision);
		}
		// find the closets notation representation
		let closest = testNotations[0];
		let closestSeconds = new TimeConstructor(testNotations[0]).toSeconds();
		testNotations.forEach(notation => {
			const notationSeconds = new TimeConstructor(notation).toSeconds();
			if (Math.abs(notationSeconds - time) < Math.abs(closestSeconds - time)) {
				closest = notation;
				closestSeconds = notationSeconds;
			}
		});
		return closest;
	}

	/**
	 *  Return the time encoded as Bars:Beats:Sixteenths.
	 */
	toBarsBeatsSixteenths(): BarsBeatsSixteenths {
		const quarterTime = this._beatsToUnits(1);
		let quarters = this.valueOf() / quarterTime;
		quarters = parseFloat(quarters.toFixed(4));
		const measures = Math.floor(quarters / this._getTimeSignature());
		let sixteenths = (quarters % 1) * 4;
		quarters = Math.floor(quarters) % this._getTimeSignature();
		const sixteenthString = sixteenths.toString();
		if (sixteenthString.length > 3) {
			// the additional parseFloat removes insignificant trailing zeroes
			sixteenths = parseFloat(parseFloat(sixteenthString).toFixed(3));
		}
		const progress = [measures, quarters, sixteenths];
		return progress.join(":");
	}

	/**
	 *  Return the time in ticks.
	 */
	toTicks(): Ticks {
		const quarterTime = this._beatsToUnits(1);
		const quarters = this.valueOf() / quarterTime;
		return Math.round(quarters * this._getPPQ());
	}

	/**
	 *  Return the time in seconds.
	 */
	toSeconds(): Seconds {
		return this.valueOf();
	}

	/**
	 *  Return the value as a midi note.
	 */
	toMidi(): MidiNote {
		return 0;
		// return Tone.Frequency.ftom(this.toFrequency());
	}
}
