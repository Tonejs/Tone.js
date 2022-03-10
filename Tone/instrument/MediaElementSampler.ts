import { ftomf, intervalToFrequencyRatio } from "../core/type/Conversions";
import { FrequencyClass } from "../core/type/Frequency";
import { ToneMediaElements } from "../core/context/ToneMediaElements";
import {
	Frequency,
	Interval,
	MidiNote,
	NormalRange,
	Note,
	Time,
} from "../core/type/Units";
import { optionsFromArguments } from "../core/util/Defaults";
import { noOp } from "../core/util/Interface";
import { isArray, isNote, isNumber } from "../core/util/TypeCheck";
import { Instrument, InstrumentOptions } from "../instrument/Instrument";
import { ToneMediaElementSource } from "../source/mediaElement/ToneMediaElementSource";
import { timeRange } from "../core/util/Decorator";
import { assert } from "../core/util/Debug";

interface SamplesMap {
	[note: string]: string;
	[midi: number]: string;
}

export interface MediaElementSamplerOptions extends InstrumentOptions {
	attack: Time;
	release: Time;
	onload: () => void;
	onerror: (error: Error) => void;
	baseUrl: string;
	urls: SamplesMap;
}

/**
 * Pass in an object which maps the note's pitch or midi value to the url,
 * then you can trigger the attack and release of that note like other instruments.
 * By automatically repitching the samples, it is possible to play pitches which
 * were not explicitly included which can save loading time.
 *
 * For sample or buffer playback where repitching is not necessary,
 * use [[Player]].
 * @example
 * const sampler = new Tone.Sampler({
 *  urls: {
 *    A1: "A1.mp3",
 *    A2: "A2.mp3",
 *  },
 * 	baseUrl: "https://tonejs.github.io/audio/casio/",
 * 	onload: () => {
 * 		MediaElementSampler.triggerAttackRelease(["C1", "E1", "G1", "B1"], 0.5);
 * 	}
 * }).toDestination();
 * @category Instrument
 */
export class MediaElementSampler extends Instrument<MediaElementSamplerOptions> {
	readonly name: string = "MediaElementSampler";

	/**
	 * The stored MediaElements
	 */
	private _elements: ToneMediaElements;

	/**
	 * The object of all currently playing ToneMediaElements
	 */
	private _activeSources: Map<MidiNote, ToneMediaElementSource[]> = new Map();

	/**
	 * The envelope applied to the beginning of the sample.
	 * @min 0
	 * @max 1
	 */
	@timeRange(0)
	attack: Time;

	/**
	 * The envelope applied to the end of the envelope.
	 * @min 0
	 * @max 1
	 */
	@timeRange(0)
	release: Time;

	/**
	 * @param samples An object of samples mapping either Midi Note Numbers or
	 * 			Scientific Pitch Notation to the url of that sample.
	 * @param onload The callback to invoke when all of the samples are loaded.
	 * @param baseUrl The root URL of all of the samples, which is prepended to all the URLs.
	 */
	constructor(samples?: SamplesMap, onload?: () => void, baseUrl?: string);
	/**
	 * @param samples An object of samples mapping either Midi Note Numbers or
	 * 			Scientific Pitch Notation to the url of that sample.
	 * @param options The remaining options associated with the sampler
	 */
	constructor(
		samples?: SamplesMap,
		options?: Partial<Omit<MediaElementSamplerOptions, "urls">>
	);
	constructor(options?: Partial<MediaElementSamplerOptions>);
	constructor() {
		super(
			optionsFromArguments(
				MediaElementSampler.getDefaults(),
				arguments,
				["urls", "onload", "baseUrl"],
				"urls"
			)
		);
		const options = optionsFromArguments(
			MediaElementSampler.getDefaults(),
			arguments,
			["urls", "onload", "baseUrl"],
			"urls"
		);

		const urlMap = {};
		Object.keys(options.urls).forEach((note) => {
			const noteNumber = parseInt(note, 10);
			assert(
				isNote(note) || (isNumber(noteNumber) && isFinite(noteNumber)),
				`url key is neither a note or midi pitch: ${note}`
			);
			if (isNote(note)) {
				// convert the note name to MIDI
				const mid = new FrequencyClass(this.context, note).toMidi();
				urlMap[mid] = options.urls[note];
			} else if (isNumber(noteNumber) && isFinite(noteNumber)) {
				// otherwise if it's numbers assume it's midi
				urlMap[noteNumber] = options.urls[noteNumber];
			}
		});

		this._elements = new ToneMediaElements({
			urls: urlMap,
			onload: options.onload,
			baseUrl: options.baseUrl,
			onerror: options.onerror,
		});

		this.attack = options.attack;
		this.release = options.release;

		options.onload();
	}

	static getDefaults(): MediaElementSamplerOptions {
		return Object.assign(Instrument.getDefaults(), {
			attack: 0,
			baseUrl: "",
			onload: noOp,
			onerror: noOp,
			release: 0.1,
			urls: {},
		});
	}

	/**
	 * Returns the difference in steps between the given midi note at the closets sample.
	 */
	private _findClosest(midi: MidiNote): Interval {
		// searches within 8 octaves of the given midi note
		const MAX_INTERVAL = 96;
		let interval = 0;
		while (interval < MAX_INTERVAL) {
			// check above and below
			if (this._elements.has(midi + interval)) {
				return -interval;
			} else if (this._elements.has(midi - interval)) {
				return interval;
			}
			interval++;
		}
		throw new Error(`No available buffers for note: ${midi}`);
	}

	/**
	 * @param  notes	The note to play, or an array of notes.
	 * @param  time     When to play the note
	 * @param  velocity The velocity to play the sample back.
	 */
	triggerAttack(
		notes: Frequency | Frequency[],
		time?: Time,
		velocity: NormalRange = 1
	): this {
		this.log("triggerAttack", notes, time, velocity);
		if (!Array.isArray(notes)) {
			notes = [notes];
		}
		notes.forEach((note) => {
			const midiFloat = ftomf(
				new FrequencyClass(this.context, note).toFrequency()
			);
			const midi = Math.round(midiFloat) as MidiNote;
			const remainder = midiFloat - midi;
			// find the closest note pitch
			const difference = this._findClosest(midi);
			const closestNote = midi - difference;
			const element = this._elements.get(closestNote);
			const playbackRate = intervalToFrequencyRatio(
				difference + remainder
			);

			// play that note
			const source = new ToneMediaElementSource({
				element,
				context: this.context,
				fadeIn: this.attack,
				fadeOut: this.release,
				playbackRate,
			}).connect(this.output);

			source.start(time, 0, source.duration / playbackRate, velocity);

			// add it to the active sources
			if (!isArray(this._activeSources.get(midi))) {
				this._activeSources.set(midi, []);
			}

			this._activeSources.get(midi)?.push(source);

			// remove it when it's done
			source.onended = () => {
				if (this._activeSources && this._activeSources.has(midi)) {
					const sources = this._activeSources.get(
						midi
					) as ToneMediaElementSource[];
					const index = sources.indexOf(source);
					if (index !== -1) {
						sources.splice(index, 1);
					}
				}
			};
		});
		return this;
	}

	/**
	 * @param  notes	The note to release, or an array of notes.
	 * @param  time     	When to release the note.
	 */
	triggerRelease(notes: Frequency | Frequency[], time?: Time): this {
		this.log("triggerRelease", notes, time);
		if (!Array.isArray(notes)) {
			notes = [notes];
		}
		notes.forEach((note) => {
			const midi = new FrequencyClass(this.context, note).toMidi();
			// find the note
			if (
				this._activeSources.has(midi) &&
				(this._activeSources.get(midi) as ToneMediaElementSource[])
					.length
			) {
				const sources = this._activeSources.get(
					midi
				) as ToneMediaElementSource[];
				time = this.toSeconds(time);
				sources.forEach((source) => {
					source.stop(time);
				});
				this._activeSources.set(midi, []);
			}
		});
		return this;
	}

	/**
	 * Release all currently active notes.
	 * @param  time     	When to release the notes.
	 */
	releaseAll(time?: Time): this {
		const computedTime = this.toSeconds(time);
		this._activeSources.forEach((sources) => {
			while (sources.length) {
				const source = sources.shift() as ToneMediaElementSource;
				source.stop(computedTime);
			}
		});
		return this;
	}

	sync(): this {
		if (this._syncState()) {
			this._syncMethod("triggerAttack", 1);
			this._syncMethod("triggerRelease", 1);
		}
		return this;
	}

	/**
	 * Invoke the attack phase, then after the duration, invoke the release.
	 * @param  notes	The note to play and release, or an array of notes.
	 * @param  duration The time the note should be held
	 * @param  time     When to start the attack
	 * @param  velocity The velocity of the attack
	 */
	triggerAttackRelease(
		notes: Frequency[] | Frequency,
		duration: Time | Time[],
		time?: Time,
		velocity: NormalRange = 1
	): this {
		const computedTime = this.toSeconds(time);
		this.triggerAttack(notes, computedTime, velocity);
		if (isArray(duration)) {
			assert(
				isArray(notes),
				"notes must be an array when duration is array"
			);
			(notes as Frequency[]).forEach((note, index) => {
				const d = duration[Math.min(index, duration.length - 1)];
				this.triggerRelease(note, computedTime + this.toSeconds(d));
			});
		} else {
			this.triggerRelease(notes, computedTime + this.toSeconds(duration));
		}
		return this;
	}

	/**
	 * Add a note to the MediaElementSampler.
	 * @param  note      The buffer's pitch.
	 * @param  url  Either the url of the buffer, or a buffer which will be added with the given name.
	 * @param  callback  The callback to invoke when the url is loaded.
	 */
	add(note: Note | MidiNote, url: string, callback?: () => void): this {
		assert(
			isNote(note) || isFinite(note),
			`note must be a pitch or midi: ${note}`
		);
		if (isNote(note)) {
			// convert the note name to MIDI
			const mid = new FrequencyClass(this.context, note).toMidi();
			this._elements.add(mid, url, callback);
		} else {
			// otherwise if it's numbers assume it's midi
			this._elements.add(note, url, callback);
		}
		return this;
	}

	/**
	 * Clean up
	 */
	dispose(): this {
		super.dispose();
		this._elements.dispose();
		this._activeSources.forEach((sources) => {
			sources.forEach((source) => source.dispose());
		});
		this._activeSources.clear();
		return this;
	}
}
