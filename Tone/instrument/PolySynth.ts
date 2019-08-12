import { MidiClass } from "../core/type/Midi";
import { Frequency, MidiNote, NormalRange, Seconds, Time } from "../core/type/Units";
import { deepMerge, optionsFromArguments } from "../core/util/Defaults";
import { RecursivePartial } from "../core/util/Interface";
import { isArray } from "../core/util/TypeCheck";
import { Instrument, InstrumentOptions } from "./Instrument";
import { Monophonic, MonophonicOptions } from "./Monophonic";
import { Synth, SynthOptions } from "./Synth";

type VoiceConstructor<V> = {
	getDefaults: () => VoiceOptions<V>,
} & (new (...args: any[]) => V);

type OmitMonophonicOptions<T> = Omit<T, "context" | "onsilence">;

type VoiceOptions<T> =
	T extends Synth ? SynthOptions :
	never;

/**
 * The settable synth options. excludes monophonic options.
 */
type PartialVoiceOptions<T> = RecursivePartial<
	OmitMonophonicOptions<
		VoiceOptions<T>
	>
>;

interface PolySynthOptions<Voice> extends InstrumentOptions {
	polyphony: number;
	voice: VoiceConstructor<Voice>;
	options: PartialVoiceOptions<Voice>;
}

/**
 * PolySynth handles voice creation and allocation for any
 * instruments passed in as the second paramter. PolySynth is
 * not a synthesizer by itself, it merely manages voices of
 * one of the other types of synths, allowing any of the
 * monophonic synthesizers to be polyphonic.
 *
 *  @param polyphony The maximum polyphony of the synth
 *  @param voice The constructor of the voices
 *  @param options	The options object to set the synth voice
 *  @example
 * //a polysynth composed of 6 Voices of Synth
 * var synth = new PolySynth(6, Tone.Synth, {
 *   oscillator : {
 * 		type : "square"
 * 	}
 * }).toMaster();
 * //set the attributes using the set interface
 * synth.set("detune", -1200);
 * //play a chord
 * synth.triggerAttackRelease(["C4", "E4", "A4"], "4n");
 */
export class PolySynth<Voice extends Monophonic<any> = Synth> extends Instrument<VoiceOptions<Voice>> {

	readonly name = "PolySynth";

	/**
	 * The voices which are not currently in use
	 */
	private _availableVoices: Voice[] = [];

	/**
	 * The currently active voices
	 */
	private _activeVoices: Map<MidiNote, Voice> = new Map();

	/**
	 * All of the allocated voices for this synth.
	 */
	private _voices: Voice[] = [];

	/**
	 * The options that are set on the synth.
	 */
	private options: VoiceOptions<Voice>;

	/**
	 * The polyphony limit.
	 */
	polyphony: number;

	private readonly voice: VoiceConstructor<Voice>;

	constructor(
		polyphony?: number,
		voice?: VoiceConstructor<Voice>,
		options?: PartialVoiceOptions<Voice>,
	);
	constructor(options?: Partial<PolySynthOptions<Voice>>);
	constructor() {

		super(optionsFromArguments(PolySynth.getDefaults(), arguments, ["polyphony", "voice", "options"]));
		const options = optionsFromArguments(PolySynth.getDefaults(), arguments, ["polyphony", "voice", "options"]);

		const defaults = options.voice.getDefaults();
		this.options = Object.assign(defaults, options.options) as VoiceOptions<Voice>;
		this.voice = options.voice as unknown as VoiceConstructor<Voice>;
		this.polyphony = options.polyphony;
	}

	static getDefaults(): PolySynthOptions<Synth> {
		return Object.assign(Instrument.getDefaults(), {
			options: {},
			polyphony: 4,
			voice: Synth,
		});
	}

	/**
	 * The number of active voices.
	 */
	get activeVoices(): number {
		return this._activeVoices.size;
	}

	/**
	 * Invoked when the source is done making sound, so that it can be
	 * readded to the pool of available voices
	 */
	private _makeVoiceAvailable(voice: Voice): void {
		this._availableVoices.push(voice);
		// remove the midi note from 'active voices'
		this._activeVoices.forEach((v, midi) => {
			if (v === voice) {
				this._activeVoices.delete(midi);
			}
		});
	}

	/**
	 * Get an available voice from the pool of available voices.
	 * If one is not available and the polyphony limit is reached,
	 * steal a voice, otherwise return null.
	 */
	private _getNextAvailableVoice(): Voice | undefined {
		// if there are available voices, return the first one
		if (this._availableVoices.length) {
			return this._availableVoices.shift();
		} else if (this._voices.length < this.polyphony) {
			// otherwise if there is still more polyphony, make a new voice
			const voice = new this.voice(Object.assign(this.options, {
				context: this.context,
				onsilence: this._makeVoiceAvailable.bind(this),
			}));
			voice.connect(this.output);
			this._voices.push(voice);
			return voice;
		} else {
			console.warn("Max polyphony exceeded. Note dropped.");
		}
	}

	/**
	 * Internal method which triggers the attack
	 */
	private _triggerAttack(notes: Frequency[], time: Seconds, velocity?: NormalRange): void {
		notes.forEach(note => {
			const midiNote = new MidiClass(this.context, note).toMidi();
			let voice: Voice | undefined;
			// if there's already a note at that voice, reuse it
			if (this._activeVoices.has(midiNote)) {
				voice = this._activeVoices.get(midiNote);
			} else {
				// otherwise get the next available voice
				voice = this._getNextAvailableVoice();
			}
			if (voice) {
				voice.triggerAttack(note, time, velocity);
				this._activeVoices.set(midiNote, voice);
				this.log("triggerAttack", note);
			}
		});
	}

	/**
	 * Internal method which triggers the release
	 */
	private _triggerRelease(notes: Frequency[], time: Seconds): void {
		notes.forEach(note => {
			const midiNote = new MidiClass(this.context, note).toMidi();
			if (this._activeVoices.has(midiNote)) {
				// trigger release on that note
				const voice = this._activeVoices.get(midiNote) as Voice;
				voice.triggerRelease(time);
				this.log("triggerRelease", note);
			}
		});
	}

	/**
	 * Schedule the attack/release events. If the time is in the future, then it should set a timeout
	 * to wait for just-in-time scheduling
	 */
	private _scheduleEvent(type: "attack" | "release", notes: Frequency[], time: Seconds, velocity?: NormalRange): void {
		// if the notes are greater than this amount of time in the future, they should be scheduled with setTimeout
		if (time <= this.now()) {
			// do it immediately
			if (type === "attack") {
				this._triggerAttack(notes, time, velocity);
			} else {
				this._triggerRelease(notes, time);
			}
		} else {
			// schedule it to start in the future
			this.context.setTimeout(() => {
				this._scheduleEvent(type, notes, time, velocity);
			}, time - this.now());
		}
	}

	/**
	 * Trigger the attack portion of the note
	 * @param  notes The notes to play. Accepts a single Frequency or an array of frequencies.
	 * @param  time  The start time of the note.
	 * @param velocity The velocity of the note.
	 * @example
	 * //trigger a chord immediately with a velocity of 0.2
	 * poly.triggerAttack(["Ab3", "C4", "F5"], undefined, 0.2);
	 */
	triggerAttack(notes: Frequency | Frequency[], time?: Time, velocity?: NormalRange): this {

		if (!Array.isArray(notes)) {
			notes = [notes];
		}
		const computedTime = this.toSeconds(time);
		this._scheduleEvent("attack", notes, computedTime, velocity);
		// notes.forEach(note => {
		// 	const midiNote = new MidiClass(this.context, note).toMidi();
		// 	let voice: Voice | undefined;
		// 	if (this._activeVoices.has(midiNote)) {
		// 		voice = this._activeVoices.get(midiNote);
		// 	} else {
		// 		voice = this._getNextAvailableVoice();
		// 	}
		// 	if (voice) {
		// 		voice.triggerAttack(note, computedTime, velocity);
		// 		this._activeVoices.set(midiNote, voice);
		// 		this.log("triggerAttack", note);
		// 	}
		// });
		return this;
	}

	/**
	 * Trigger the release of the note. Unlike monophonic instruments,
	 * a note (or array of notes) needs to be passed in as the first argument.
	 * @param  notes The notes to play. Accepts a single Frequency or an array of frequencies.
	 * @param  time  When the release will be triggered.
	 * @example
	 * poly.triggerRelease(["Ab3", "C4", "F5"], "+2n");
	 */
	triggerRelease(notes: Frequency | Frequency[], time?: Time): this {
		if (!Array.isArray(notes)) {
			notes = [notes];
		}
		const computedTime = this.toSeconds(time);
		this._scheduleEvent("release", notes, computedTime);
		// this._triggerRelease(notes, computedTime);
		return this;
	}

	/**
	 * Trigger the attack and release after the specified duration
	 * @param  notes The notes to play. Accepts a single  Frequency or an array of frequencies.
	 * @param  duration the duration of the note
	 * @param  time  if no time is given, defaults to now
	 * @param  velocity the velocity of the attack (0-1)
	 * @example
	 * //trigger a chord for a duration of a half note
	 * poly.triggerAttackRelease(["Eb3", "G4", "C5"], "2n");
	 * @example
	 * //can pass in an array of durations as well
	 * poly.triggerAttackRelease(["Eb3", "G4", "C5"], ["2n", "4n", "4n"]);
	 */
	triggerAttackRelease(
		notes: Frequency | Frequency[],
		duration: Time | Time[],
		time?: Time,
		velocity?: NormalRange,
	): this {
		const computedTime = this.toSeconds(time);
		this.triggerAttack(notes, computedTime, velocity);
		if (isArray(duration)) {
			this.assert(isArray(notes), "If the duration is an array, the notes must also be an array");
			notes = notes as Frequency[];
			for (let i = 0; i < notes.length; i++) {
				const d = duration[Math.min(i, duration.length - 1)];
				const durationSeconds = this.toSeconds(d);
				this.assert(durationSeconds > 0, "The duration must be greater than 0");
				this.triggerRelease(notes[i], computedTime + durationSeconds);
			}
		} else {
			const durationSeconds = this.toSeconds(duration);
			this.assert(durationSeconds > 0, "The duration must be greater than 0");
			this.triggerRelease(notes, computedTime + durationSeconds);
		}
		return this;
	}

	/**
	 * Sync the instrument to the Transport. All subsequent calls of
	 * {@link triggerAttack} and {@link triggerRelease} will be scheduled along the transport.
	 * @example
	 * synth.sync()
	 * //schedule 3 notes when the transport first starts
	 * synth.triggerAttackRelease('8n', 0)
	 * synth.triggerAttackRelease('8n', '8n')
	 * synth.triggerAttackRelease('8n', '4n')
	 * //start the transport to hear the notes
	 * Transport.start()
	 */
	sync(): this {
		this._syncMethod("triggerAttack", 1);
		this._syncMethod("triggerRelease", 1);
		return this;
	}

	/**
	 * Set a member/attribute of the voices
	 * @example
	 * poly.set({
	 * 	"filter" : {
	 * 		"type" : "highpass"
	 * 	},
	 * 	"envelope" : {
	 * 		"attack" : 0.25
	 * 	}
	 * });
	 */
	set(options: RecursivePartial<VoiceOptions<Voice>>): this {
		this.options = deepMerge(this.options, options);
		this._voices.forEach(voice => voice.set(this.options));
		return this;
	}

	/**
	 *  Get the synth's attributes.
	 */
	get(): VoiceOptions<Voice> {
		return this.options;
	}

	/**
	 *  Trigger the release portion of all the currently active voices.
	 *  @param time When the notes should be released.
	 */
	releaseAll(time?: Time): this {
		const computedTime = this.toSeconds(time);
		this._activeVoices.forEach((voice) => {
			voice.triggerRelease(computedTime);
		});
		return this;
	}

	dispose(): this {
		super.dispose();
		this._voices.forEach(v => v.dispose());
		this._activeVoices.clear();
		this._availableVoices = [];
		return this;
	}
}
