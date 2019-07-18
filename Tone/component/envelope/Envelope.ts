import { InputNode } from "Tone/core/context/ToneAudioNode";
import { ToneAudioNode, ToneAudioNodeOptions } from "../../core/context/ToneAudioNode";
import { optionsFromArguments } from "../../core/util/Defaults";
import { isArray, isObject, isString } from "../../core/util/TypeCheck";
import { connectSignal, Signal } from "../../signal/Signal";

type BasicEnvelopeCurve = "linear" | "exponential";
type InternalEnvelopeCurve = BasicEnvelopeCurve | number[];
export type EnvelopeCurve = EnvelopeCurveName | number[];

export interface EnvelopeOptions extends ToneAudioNodeOptions {
	attack: Time;
	decay: Time;
	sustain: NormalRange;
	release: Time;
	attackCurve: EnvelopeCurve;
	releaseCurve: EnvelopeCurve;
	decayCurve: BasicEnvelopeCurve;
}

/**
 *  Envelope is an [ADSR](https://en.wikipedia.org/wiki/Synthesizer#ADSR_envelope)
 *  envelope generator. Envelope outputs a signal which
 *  can be connected to an AudioParam or Tone.Signal.
 *  <img src="https://upload.wikimedia.org/wikipedia/commons/e/ea/ADSR_parameter.svg">
 *
 *  @constructor
 *  @extends {Tone.AudioNode}
 *  @param attack The amount of time it takes for the envelope to go from
 *                         0 to it's maximum value.
 *  @param decay	The period of time after the attack that it takes for the envelope
 *                       	to fall to the sustain value. Value must be greater than 0.
 *  @param sustain	The percent of the maximum value that the envelope rests at until
 *                                	the release is triggered.
 *  @param release	The amount of time after the release is triggered it takes to reach 0.
 *                         	Value must be greater than 0.
 *  @example
 * //an amplitude envelope
 * var gainNode = Tone.context.createGain();
 * var env = new Envelope({
 * 	"attack" : 0.1,
 * 	"decay" : 0.2,
 * 	"sustain" : 1,
 * 	"release" : 0.8,
 * });
 * env.connect(gainNode.gain);
 */
export class Envelope extends ToneAudioNode<EnvelopeOptions> {

	name = "Envelope";

	/**
	 *  When triggerAttack is called, the attack time is the amount of
	 *  time it takes for the envelope to reach it's maximum value.
	 */
	attack: Time;

	/**
	 *  After the attack portion of the envelope, the value will fall
	 *  over the duration of the decay time to it's sustain value.
	 */
	decay: Time;

	/**
	 * 	The sustain value is the value
	 * 	which the envelope rests at after triggerAttack is
	 * 	called, but before triggerRelease is invoked.
	 */
	sustain: NormalRange;

	/**
	 *  After triggerRelease is called, the envelope's
	 *  value will fall to it's miminum value over the
	 *  duration of the release time.
	 */
	release: Time;

	/**
	 *  The automation curve type for the attack
	 */
	private _attackCurve!: InternalEnvelopeCurve;

	/**
	 *  The automation curve type for the decay
	 */
	private _decayCurve!: BasicEnvelopeCurve;

	/**
	 *  The automation curve type for the release
	 */
	private _releaseCurve!: InternalEnvelopeCurve;

	/**
	 *  the signal which is output.
	 */
	private _sig: Signal<NormalRange> = new Signal({
		context: this.context,
		value: 0,
	});
	protected _internalChannels = [this._sig];

	/**
	 * The output signal of the envelope
	 */
	output = this._sig;

	/**
	 * Envelope has no input
	 */
	input: undefined;

	constructor(attack?: Time, decay?: Time, sustain?: NormalRange, release?: Time);
	constructor(options?: Partial<EnvelopeOptions>)
	constructor() {

		super(optionsFromArguments(Envelope.getDefaults(), arguments, ["attack", "decay", "sustain", "release"]));
		const options = optionsFromArguments(Envelope.getDefaults(), arguments, ["attack", "decay", "sustain", "release"]);

		this.attack = options.attack;
		this.decay = options.decay;
		this.sustain = options.sustain;
		this.release = options.release;
		this.attackCurve = options.attackCurve;
		this.releaseCurve = options.releaseCurve;
		this.decayCurve = options.decayCurve;
		// set all the properties
		this.set(options);
	}

	static getDefaults(): EnvelopeOptions {
		return Object.assign(ToneAudioNode.getDefaults(), {
			attack : 0.01,
			attackCurve : "linear" as EnvelopeCurveName,
			decay : 0.1,
			decayCurve : "exponential" as BasicEnvelopeCurve,
			release : 1,
			releaseCurve : "exponential" as EnvelopeCurveName,
			sustain : 0.5,
		});
	}

	/**
	 * Read the current value of the envelope. Useful for
	 * syncronizing visual output to the envelope.
	 */
	get value(): NormalRange {
		return this.getValueAtTime(this.now());
	}

	/**
	 *  Get the curve
	 *  @param  curve
	 *  @param  direction  In/Out
	 *  @return  {String}  The curve name
	 *  @private
	 */
	private _getCurve(curve: InternalEnvelopeCurve, direction: EnvelopeDirection): EnvelopeCurve {
		if (isString(curve)) {
			return curve;
		} else {
			// look up the name in the curves array
			let curveName: EnvelopeCurveName;
			for (curveName in EnvelopeCurves) {
				if (EnvelopeCurves[curveName][direction] === curve) {
					return curveName;
				}
			}
			// return the custom curve
			return curve;
		}
	}

	/**
	 *  Assign a the curve to the given name using the direction
	 *  @param  name
	 *  @param  direction In/Out
	 *  @param  curve
	 *  @private
	 */
	private _setCurve(
		name: "_attackCurve" | "_decayCurve" | "_releaseCurve",
		direction: EnvelopeDirection,
		curve: EnvelopeCurve,
	): void {
		// check if it's a valid type
		if (isString(curve) && Reflect.has(EnvelopeCurves, curve)) {
			const curveDef = EnvelopeCurves[curve];
			if (isObject(curveDef)) {
				if (name !== "_decayCurve") {
					this[name] = curveDef[direction];
				}
			} else {
				this[name] = curveDef;
			}
		} else if (isArray(curve) && name !== "_decayCurve") {
			this[name] = curve;
		} else {
			throw new Error("Envelope: invalid curve: " + curve);
		}
	}

	/**
	 * The shape of the attack.
	 * Can be any of these strings:
	 * * linear
	 * * exponential
	 * * sine
	 * * cosine
	 * * bounce
	 * * ripple
	 * * step
	 * Can also be an array which describes the curve. Values
	 * in the array are evenly subdivided and linearly
	 * interpolated over the duration of the attack.
	 * @memberOf Envelope#
	 * @type {String|Array}
	 * @name attackCurve
	 * @example
	 * env.attackCurve = "linear";
	 * @example
	 * //can also be an array
	 * env.attackCurve = [0, 0.2, 0.3, 0.4, 1]
	 */
	get attackCurve(): EnvelopeCurve {
		return this._getCurve(this._attackCurve, "In");
	}
	set attackCurve(curve) {
		this._setCurve("_attackCurve", "In", curve);
	}

	/**
	 * The shape of the release. See the attack curve types.
	 * @memberOf Envelope#
	 * @type {String|Array}
	 * @name releaseCurve
	 * @example
	 * env.releaseCurve = "linear";
	 */
	get releaseCurve(): EnvelopeCurve {
		return this._getCurve(this._releaseCurve, "Out");
	}
	set releaseCurve(curve) {
		this._setCurve("_releaseCurve", "Out", curve);
	}

	/**
	 * The shape of the decay either "linear" or "exponential"
	 * @memberOf Envelope#
	 * @type {String}
	 * @name decayCurve
	 * @example
	 * env.decayCurve = "linear";
	 */
	get decayCurve(): BasicEnvelopeCurve {
		return this._decayCurve;
	}
	set decayCurve(curve) {
		this.assert(["linear", "exponential"].some(c => c === curve), `Invalid envelope curve: ${curve}`);
		this._decayCurve = curve;
	}

	/**
	 * Trigger the attack/decay portion of the ADSR envelope.
	 * @param  time When the attack should start.
	 * @param velocity The velocity of the envelope scales the vales.
	 *                              number between 0-1
	 * @example
	 * //trigger the attack 0.5 seconds from now with a velocity of 0.2
	 * env.triggerAttack("+0.5", 0.2);
	 */
	triggerAttack(time?: Time, velocity: NormalRange = 1): this {
		this.log("triggerAttack", time, velocity);
		time = this.toSeconds(time);
		const originalAttack = this.toSeconds(this.attack);
		let attack = originalAttack;
		const decay = this.toSeconds(this.decay);
		// check if it's not a complete attack
		const currentValue = this.getValueAtTime(time);
		if (currentValue > 0) {
			// subtract the current value from the attack time
			const attackRate = 1 / attack;
			const remainingDistance = 1 - currentValue;
			// the attack is now the remaining time
			attack = remainingDistance / attackRate;
		}
		// attack
		if (attack === 0) {
			// case where the attack time is 0 should set instantly
			this._sig.setValueAtTime(velocity, time);
		} else if (this._attackCurve === "linear") {
			this._sig.linearRampTo(velocity, attack, time);
		} else if (this._attackCurve === "exponential") {
			this._sig.targetRampTo(velocity, attack, time);
		} else if (attack > 0) {
			this._sig.cancelAndHoldAtTime(time);
			let curve = this._attackCurve;
			// find the starting position in the curve
			for (let i = 1; i < curve.length; i++) {
				// the starting index is between the two values
				if (curve[i - 1] <= currentValue && currentValue <= curve[i]) {
					curve = this._attackCurve.slice(i);
					// the first index is the current value
					curve[0] = currentValue;
					break;
				}
			}
			this._sig.setValueCurveAtTime(curve, time, attack, velocity);
		}
		// decay
		if (decay) {
			const decayValue = velocity * this.sustain;
			const decayStart = time + attack;
			this.log("decay", decayStart);
			if (this._decayCurve === "linear") {
				this._sig.linearRampTo(decayValue, decay, decayStart + this.sampleTime);
			} else if (this._decayCurve === "exponential") {
				this._sig.exponentialApproachValueAtTime(decayValue, decayStart, decay);
			}
		}
		return this;
	}

	/**
	 *  Triggers the release of the envelope.
	 *  @param  time When the release portion of the envelope should start.
	 *  @example
	 *  //trigger release immediately
	 *  env.triggerRelease();
	 */
	triggerRelease(time?: Time): this {
		this.log("triggerRelease", time);
		time = this.toSeconds(time);
		const currentValue = this.getValueAtTime(time);
		if (currentValue > 0) {
			const release = this.toSeconds(this.release);
			if (this._releaseCurve === "linear") {
				this._sig.linearRampTo(0, release, time);
			} else if (this._releaseCurve === "exponential") {
				this._sig.targetRampTo(0, release, time);
			} else {
				if (isArray(this._releaseCurve)) {
					this._sig.cancelAndHoldAtTime(time);
					this._sig.setValueCurveAtTime(this._releaseCurve, time, release, currentValue);
				}
			}
		}
		return this;
	}

	/**
	 *  Get the scheduled value at the given time. This will
	 *  return the unconverted (raw) value.
	 */
	getValueAtTime(time: Time): NormalRange {
		return this._sig.getValueAtTime(time);
	}

	/**
	 *  triggerAttackRelease is shorthand for triggerAttack, then waiting
	 *  some duration, then triggerRelease.
	 *  @param duration The duration of the sustain.
	 *  @param time When the attack should be triggered.
	 *  @param velocity The velocity of the envelope.
	 *  @example
	 * //trigger the attack and then the release after 0.6 seconds.
	 * env.triggerAttackRelease(0.6);
	 */
	triggerAttackRelease(duration: Time, time?: Time, velocity: NormalRange = 1): this {
		time = this.toSeconds(time);
		this.triggerAttack(time, velocity);
		this.triggerRelease(time + this.toSeconds(duration));
		return this;
	}

	/**
	 *  Cancels all scheduled envelope changes after the given time.
	 */
	cancel(after?: Time): this {
		this._sig.cancelScheduledValues(after);
		return this;
	}

	/**
	 * Connect the envelope to a destination node.
	 */
	connect(destination: InputNode, outputNumber: number = 0, inputNumber: number = 0): this {
		connectSignal(this._sig, destination, outputNumber, inputNumber);
		return this;
	}

	/**
	 *  Disconnect and dispose.
	 *  @returns {Envelope} this
	 */
	dispose(): this {
		this._sig.dispose();
		return this;
	}
}

interface EnvelopeCurveObject {
	In: number[];
	Out: number[];
}

type EnvelopeDirection = keyof EnvelopeCurveObject;

interface EnvelopeCurveMap {
	linear: "linear";
	exponential: "exponential";
	bounce: EnvelopeCurveObject;
	cosine: EnvelopeCurveObject;
	sine: EnvelopeCurveObject;
	ripple: EnvelopeCurveObject;
	step: EnvelopeCurveObject;
}

type EnvelopeCurveName =  keyof EnvelopeCurveMap;

/**
 *  Generate some complex envelope curves.
 */
// tslint:disable-next-line: variable-name
const EnvelopeCurves: EnvelopeCurveMap = (() => {

	const curveLen = 128;

	let i: number;
	let k: number;

	// cosine curve
	const cosineCurve: number[] = [];
	for (i = 0; i < curveLen; i++) {
		cosineCurve[i] = Math.sin((i / (curveLen - 1)) * (Math.PI / 2));
	}

	// ripple curve
	const rippleCurve: number[] = [];
	const rippleCurveFreq = 6.4;
	for (i = 0; i < curveLen - 1; i++) {
		k = (i / (curveLen - 1));
		const sineWave = Math.sin(k * (Math.PI * 2) * rippleCurveFreq - Math.PI / 2) + 1;
		rippleCurve[i] = sineWave / 10 + k * 0.83;
	}
	rippleCurve[curveLen - 1] = 1;

	// stairs curve
	const stairsCurve: number[] = [];
	const steps = 5;
	for (i = 0; i < curveLen; i++) {
		stairsCurve[i] = Math.ceil((i / (curveLen - 1)) * steps) / steps;
	}

	// in-out easing curve
	const sineCurve: number[] = [];
	for (i = 0; i < curveLen; i++) {
		k = i / (curveLen - 1);
		sineCurve[i] = 0.5 * (1 - Math.cos(Math.PI * k));
	}

	// a bounce curve
	const bounceCurve: number[] = [];
	for (i = 0; i < curveLen; i++) {
		k = i / (curveLen - 1);
		const freq = Math.pow(k, 3) * 4 + 0.2;
		const val = Math.cos(freq * Math.PI * 2 * k);
		bounceCurve[i] = Math.abs(val * (1 - k));
	}

	/**
	 *  Invert a value curve to make it work for the release
	 */
	function invertCurve(curve: number[]): number[] {
		const out = new Array(curve.length);
		for (let j = 0; j < curve.length; j++) {
			out[j] = 1 - curve[j];
		}
		return out;
	}

	/**
	 *  reverse the curve
	 */
	function reverseCurve(curve: number[]): number[] {
		return curve.slice(0).reverse();
	}

	/**
	 *  attack and release curve arrays
	 */
	return {
		bounce : {
			In : invertCurve(bounceCurve),
			Out : bounceCurve,
		},
		cosine : {
			In : cosineCurve,
			Out : reverseCurve(cosineCurve),
		},
		exponential : "exponential" as "exponential",
		linear : "linear" as "linear",
		ripple : {
			In : rippleCurve,
			Out : invertCurve(rippleCurve),
		},
		sine : {
			In : sineCurve,
			Out : invertCurve(sineCurve),
		},
		step : {
			In : stairsCurve,
			Out : invertCurve(stairsCurve),
		},
	};
})();
