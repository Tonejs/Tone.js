import { FrequencyClass } from "../core/type/Frequency";
import { Cents, Frequency, NormalRange, Seconds, Time } from "../core/type/Units";
import { optionsFromArguments } from "../core/util/Defaults";
import { Instrument, InstrumentOptions } from "../instrument/Instrument";
import { Signal } from "../signal/Signal";

export interface MonophonicOptions extends InstrumentOptions {
	portamento: Seconds;
}

/**
 * Abstract base class for other monophonic instruments to extend.
 */
export abstract class Monophonic<Options extends MonophonicOptions> extends Instrument<Options> {

	/**
	 *  The glide time between notes.
	 */
	portamento: Seconds;

	/**
	 * The instrument's envelope
	 */
	abstract envelope: any;

	/**
	 * The instrument's frequency signal.
	 */
	abstract readonly frequency: Signal<Frequency>;

	/**
	 * The instrument's detune control signal.
	 */
	abstract readonly detune: Signal<Cents>;

	constructor(options?: Partial<MonophonicOptions>);
	constructor() {

		super(optionsFromArguments(Monophonic.getDefaults(), arguments));
		const options = optionsFromArguments(Monophonic.getDefaults(), arguments);

		this.portamento = options.portamento;

	}

	static getDefaults(): MonophonicOptions {
		return Object.assign(Instrument.getDefaults(), {
			portamento: 0,
		});
	}

	/**
	 *  Trigger the attack of the note optionally with a given velocity.
	 *
	 *
	 *  @param  note The note to trigger.
	 *  @param  time When the note should start.
	 *  @param  velocity The velocity scaler determines how "loud" the note
	 *                   will be triggered.
	 *  @example
	 * synth.triggerAttack("C4");
	 *  @example
	 * //trigger the note a half second from now at half velocity
	 * synth.triggerAttack("C4", "+0.5", 0.5);
	 */
	triggerAttack(note: Frequency | FrequencyClass, time?: Time, velocity: NormalRange = 1): this {
		this.log("triggerAttack", note, time, velocity);
		const seconds = this.toSeconds(time);
		this._triggerEnvelopeAttack(seconds, velocity);
		this.setNote(note, seconds);
		return this;
	}

	/**
	 *  Trigger the release portion of the envelope
	 *  @param  {Time} [time=now] If no time is given, the release happens immediatly
	 *  @returns {Monophonic} this
	 *  @example
	 * synth.triggerRelease();
	 */
	triggerRelease(time?: Time): this {
		this.log("triggerRelease", time);
		const seconds = this.toSeconds(time);
		this._triggerEnvelopeRelease(seconds);
		return this;
	}

	/**
	 *  Internal method which starts the envelope attack
	 */
	protected abstract _triggerEnvelopeAttack(time: Seconds, velocity: NormalRange): void;

	/**
	 *  Internal method which starts the envelope release
	 */
	protected abstract _triggerEnvelopeRelease(time: Seconds): void;

	/**
	 *  Get the level of the output at the given time. Measures
	 *  the envelope(s) value at the time.
	 *  @param time The time to query the envelope value
	 *  @return The output level between 0-1
	 */
	getLevelAtTime(time: Time): NormalRange {
		time = this.toSeconds(time);
		return this.envelope.getValueAtTime(time);
	}

	/**
	 *  Set the note at the given time. If no time is given, the note
	 *  will set immediately.
	 *  @param note The note to change to.
	 *  @param  time The time when the note should be set.
	 * @example
	 * //change to F#6 in one quarter note from now.
	 * synth.setNote("F#6", "+4n");
	 * @example
	 * //change to Bb4 right now
	 * synth.setNote("Bb4");
	 */
	setNote(note: Frequency | FrequencyClass, time?: Time): this {
		const computedTime = this.toSeconds(time);
		const computedFrequency = note instanceof FrequencyClass ? note.toFrequency() : note;
		if (this.portamento > 0 && this.getLevelAtTime(computedTime) > 0.05) {
			const portTime = this.toSeconds(this.portamento);
			this.frequency.exponentialRampTo(computedFrequency, portTime, computedTime);
		} else {
			this.frequency.setValueAtTime(computedFrequency, computedTime);
		}
		return this;
	}
}
