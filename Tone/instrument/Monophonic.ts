import { FrequencyClass } from "Tone/core/type/Frequency";
import { optionsFromArguments } from "../core/util/Defaults";
import { Instrument, InstrumentOptions } from "../instrument/Instrument";
import { Signal } from "../signal/Signal";

export interface MonophonicOptions extends InstrumentOptions {
	portamento: Seconds;
}

/**
 *  @class  This is an abstract base class for other monophonic instruments to
 *          extend. IMPORTANT: It does not make any sound on its own and
 *          shouldn't be directly instantiated.
 *
 *  @constructor
 *  @abstract
 *  @extends {Tone.Instrument}
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
		time = this.toSeconds(time);
		this._triggerEnvelopeAttack(time, velocity);
		this.setNote(note, time);
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
		time = this.toSeconds(time);
		this._triggerEnvelopeRelease(time);
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
		time = this.toSeconds(time);
		const computedFrequency = note instanceof FrequencyClass ? note.toFrequency() : note;
		if (this.portamento > 0 && this.getLevelAtTime(time) > 0.05) {
			const portTime = this.toSeconds(this.portamento);
			this.frequency.exponentialRampTo(computedFrequency, portTime, time);
		} else {
			this.frequency.setValueAtTime(computedFrequency, time);
		}
		return this;
	}
}
