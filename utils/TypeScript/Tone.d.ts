// Type definitions for TONE.JS
// Project: https://github.com/TONEnoTONE/Tone.js
// Definitions by: Luke Phillips <https://github.com/lukephills>
// Definitions: https://github.com/borisyankov/DefinitelyTyped

/***
 ---- LIST OF CLASSES DEFINED (A-Z) ----

 Tone
 Clip
 Clock
 DryWet
 Effect
 AutoPanner
 AutoWah
 BitCrusher
 FeedbackEffect
 StereoFeedbackEffect
 StereoXFeedbackEffect
 Chorus
 PingPongDelay
 FeedbackDelay
 Freeverb
 JCReverb
 Envelope
 AmplitudeEnvelope
 EQ
 FeedbackCombFilter
 Filter
 Follower
 Gate
 Instrument
 Monophonic
 MonoSynth
 DuoSynth
 FMSynth
 MultiSampler
 PluckSynth
 PolySynth
 Sampler
 LowpassCombFilter
 Master
 Meter
 Note
 Panner
 Route
 Scale
 ScaleEx
 Signal
 Source
 LFO
 Microphone
 Noise
 Oscillator
 Player
 PulseOscillator
 Time
 Transport

 //--- HELPER CLASSES ---/
 Abs
 Add
 Equal
 EqualZero
 LessThan
 GreaterThan
 Max
 Merge
 Min
 Modulo
 Mono
 Multiply
 Negate
 Select
 Split
 Switch
 Threshold
 ***/


interface Tone {
    context: AudioContext;
    input: GainNode;
    output: GainNode;
    chain(...args: any[]): void;
    connect(unit: any, outputNum?:number, inputNum?:number): void;
    dbToGain(db: number): number;
    defaultArg(given: any, fallback: any): any; // if both args are objects, properties added to fallback
    disconnect(): void;
    dispose(): void;
    equalPowerScale(percent:number): number;
    expScale(gain: number): number;
    extend(child: Function, parent?: Function): void;
    fan(...args: any[]): void; // connects first argument to all the other arguments
    frequencyToNote(freq:number):string;
    frequencyToSeconds(freq:number):number;
    gainToDb(gain: number): number;
    interpolate(input: number, outputMin: number, outputMax: number): number;
    isUndef(arg: any): boolean;
    logScale(gain: number): number;
    midiToNote(midiNumber: number): string;
    noGC(): void;
    normalize(input: number, inputMin: number, inputMax: number): number;
    notationToSeconds(notation: string, bpm?: number, timeSignature?: number): number;
    noteToFrequency(note: string): number;
    now(): number;
    optionsObject(values: Array<any>, keys: Array<string>, defaults?:Object): Object;
    receive(channelName: string, input?: AudioNode): void;
    samplesToSeconds(samples: number): number;
    secondsToFrequency(seconds: number): number;
    send(channelName: string, amount: number): GainNode;
    setContext(): void;
    startMobile(): void; // Bind to touchstart to fix IOS6
    ticksToSeconds(transportTime: string, bpm?: number, timeSignature?: number): number;
    toFrequency(time: Tone.Time): number;
    toMaster(): void;
    toSamples(time: Tone.Time): number;
    toSeconds(time?: number, now?: number): number; // no args return now() in seconds
}


declare module Tone {

    var Clip: {
        new(rate: number, callback: Function): Tone.Clip;
    }

    interface Clip extends Tone {
        tick: Function;
        getRate(): number;
        setRate(rate: Tone.Time, rampTime?: Tone.Time): void;
        start(time: Tone.Time): void;
        stop(time: Tone.Time, onend: Function): void;
    }

    var Clock: {
        new(min: number, max: number): Tone.Clock;
    }

    interface Clock extends Tone {
        setMax(max:number): void;
        setMin(min: number): void;
    }

    var DryWet: {
        new(initialDry?: number): Tone.DryWet;
    }

    interface DryWet extends Tone {
        dry: GainNode;
        wet: GainNode;
        wetness: Tone.Signal;
        setDry(val: number, rampTime?: Tone.Time): void; // 0 - 1
        setWet(val: number, rampTime?: Tone.Time): void;
    }

    var Effect: {
        new(initialDry?: number): Tone.Effect;
    }

    interface Effect extends Tone {
        dryWet: Tone.DryWet;
        effectReturn: GainNode;
        effectSend: GainNode;
        bypass(): void;
        connectEffect(effect: Tone): void;
        set(param: Object): void;
        setDry(dryness: number, rampTime?: Tone.Time): void;
        setPreset(presetName: string): void;
        setWet(wetness: number, rampTime?: Tone.Time): void;
    }

    var AutoPanner: {
        new(frequency?: number): Tone.AutoPanner;
    }

    interface AutoPanner extends Effect {
        setFrequency(frequency: number): void;
        setType(type: string): void;
        start(Time?: Tone.Time): void;
        stop(Time?: Tone.Time): void;
    }

    var AutoWah: {
        new(baseFrequency?: number, octaves?: number, sensitivity?:number): Tone.AutoWah;
    }

    interface AutoWah extends Tone.Effect {
        setBaseFrequency(frequency: number): void;
        setOctaves(octaves: number): void;
        setSensitivity(Time?: Tone.Time): void;
    }

    var BitCrusher: {
        new(bits: number): Tone.BitCrusher;
    }

    interface BitCrusher extends Tone.Effect {}

    var FeedbackEffect: {
        new(initialFeedback?: any): Tone.FeedbackEffect;
    }

    interface FeedbackEffect extends Tone.Effect {
        feedback: Tone.Signal;
        setFeedback(value: number, rampTime?: Tone.Time): void;
    }

    var StereoFeedbackEffect: {
        new(): Tone.StereoFeedbackEffect;
    }

    interface StereoFeedbackEffect extends Tone.FeedbackEffect {}

    var StereoXFeedbackEffect: {
        new(): Tone.StereoXFeedbackEffect;
    }

    interface StereoXFeedbackEffect extends Tone.FeedbackEffect {}

    var Chorus: {
        new(rate?: any, delayTime?: number, depth?: number): Tone.Chorus;
    }

    interface Chorus extends Tone.StereoXFeedbackEffect {
        setDelayTime(delayTime: number): void;
        setDepth(depth: number): void;
        setRate(rate: number): void;
        setType(type: number): void;
    }

    var PingPongDelay:  {
        new(delayTime: any): Tone.PingPongDelay;
    }

    interface PingPongDelay extends Tone.StereoXFeedbackEffect {
        defaults: Object;
        delayTime: Tone.Signal;
        setDelayTime(delayTime)
    }


    var FeedbackDelay: {
        new(delayTime: any): Tone.FeedbackDelay;
    }

    interface FeedbackDelay extends Tone.FeedbackEffect {
        delayTime: Tone.Signal;
        feedback: Tone.Signal;
        setDelayTime(delayTime: Tone.Time, rampTime?: Tone.Time);
    }

    var Freeverb: {
        new(roomSize?: number, dampening?: number): Tone.Freeverb;
    }

    interface Freeverb extends Tone.Effect {
        dampening: Tone.Signal;
        roomSize: Tone.Signal;
        setDampening(dampening: number): void;
        setRoomSize(roomsize: number): void;
    }

    var JCReverb: {
        new(): Tone.JCReverb;
    }

    interface JCReverb extends Tone.Effect {
        roomSize: Tone.Signal;
        setRoomSize(roomsize: number): void;
    }

    var Envelope: {
        new(attack: any, decay?: Tone.Time, sustain?: number, release?: Tone.Time): Tone.Envelope;
    }

    interface Envelope extends Tone {
        attack: number;
        decay: number;
        max: number;
        min: number;
        release: number;
        sustain: number;
        set(params: Object): void;
        setAttack(time: Tone.Time): void;
        setDecay(time: Tone.Time): void;
        setMax(max: number): void;
        setMin(min: number): void;
        setRelease(time: Tone.Time): void;
        setSustain(time: Tone.Time): void;
        triggerAttack(time?: Tone.Time, velocity?: number): void;
        triggerAttackRelease(duration: Tone.Time, time?: Tone.Time, velocity?: number): void;
        triggerRelease(time?: Tone.Time): void;
    }

    var AmplitudeEnvelope: {
        new(attack: Tone.Time, decay: Tone.Time, sustain: number, release:Tone.Time): Tone.AmplitudeEnvelope;
    }
    interface AmplitudeEnvelope extends Tone.Envelope {}

    var EQ: {
        new(lowLevel?, midLevel?: number, highLevel?: number): Tone.EQ;
    }

    interface EQ extends Tone {
        highFrequency: Tone.Signal;
        highGain: GainNode;
        input: GainNode;
        lowFrequency: Tone.Signal;
        lowGain: GainNode;
        midGain: GainNode;
        output: GainNode;
        set(params: Object): void;
        setHigh(db: number): void;
        setLow(db: number): void;
        setMid(db: number): void;
    }

    var FeedbackCombFilter: {
        new(minDelay?: number): Tone.FeedbackCombFilter;
    }

    interface FeedbackCombFilter extends Tone {
        resonance: Tone.Signal;
        setDelayTime(delayAmount: number, time?: Tone.Time);
    }

    var Filter: {
        new(freq: number, type?: string, rolloff?: number): Tone.Filter;
    }

    interface Filter extends Tone {
        detune: Tone.Signal;
        frequency: Tone.Signal;
        gain: AudioParam;
        Q: Tone.Signal;
        getType(): string;
        set(params: Object): void;
        setFrequency(val: Tone.Time, rampTime: Tone.Time): void;
        setQ(Q: number): void;
        setRolloff(rolloff: number);
        setType(type: string): void;
    }

    var Follower: {
        new(attack?: Tone.Time, release?: Tone.Time): Tone.Follower;
    }

    interface Follower extends Tone {
        set(params: Object): void;
        setAttack(attack: Tone.Time): void;
        setRelease(release: Tone.Time): void;
    }

    var Gate: {
        new(thresh?: number, attackTime?: number, releaseTime?: number): Tone.Gate;
    }

    interface Gate extends Tone {
        setAttack(attackTime: Tone.Time): void;
        setRelease(releaseTime: Tone.Time): void;
        setThreshold(thresh: number): void;
    }

    var Instrument: {
        new(): Tone.Instrument;
    }

    interface Instrument extends Tone {
        triggerAttack(note: any, time?: Tone.Time, velocity?: number): void;
        triggerAttackRelease(note: any, duration?: Tone.Time, time?: Tone.Time, velocity?: number): void;
        triggerRelease(time?: Tone.Time): void;
        setVolume(db: number): void;
    }

    var Monophonic: {
        new(): Tone.Monophonic;
    }

    interface Monophonic extends Tone.Instrument {
        portamento: number;
        set(params: Object): void;
        setNote(note: any): void;
        setPortamento(portamento: Tone.Time): void;
        setPreset(presetName: string): void;
    }

    var MonoSynth: {
        new(options?: Object): Tone.MonoSynth;
    }

    interface MonoSynth extends Tone.Monophonic {
        detune: Tone.Signal;
        envelope: Tone.Envelope;
        filter: Tone.Filter;
        filterEnvelope: Tone.Envelope;
        frequency: Tone.Signal;
        oscillator: Tone.Oscillator;
        setOscType(oscType: string): void;
        triggerEnvelopeAttack(time?: Tone.Time, velocity?: number): void;  // Why do we have these methods when we
        triggerEnvelopeRelease(time?: Tone.Time): void;                    // have triggerAttack in Instrument class??
    }

    var DuoSynth: {
        new(options?: Object): Tone.DuoSynth;
    }

    interface DuoSynth extends Tone.Monophonic {
        voice0: Tone.MonoSynth;
        voice1: Tone.MonoSynth;
        frequency: Tone.Signal;
        setHarmonicity(ratio: number): void;
        setVibratoAmount(amount: number): void;
        setVibratoRate(rate: number): void;
        triggerEnvelopeAttack(time?: Tone.Time, velocity?: number): void;
        triggerEnvelopeRelease(time?: Tone.Time): void;
    }


    var FMSynth: {
        new(options?: Object): Tone.FMSynth;
    }

    interface FMSynth extends Tone.Monophonic {
        carrier: Tone.MonoSynth;
        frequency: Tone.Signal;
        modulator: Tone.MonoSynth;
        setHarmonicity(ratio: number): void;
        setModulationIndex(index: number): void;
        triggerEnvelopeAttack(time?: Tone.Time, velocity?: number): void;
        triggerEnvelopeRelease(time?: Tone.Time): void;
    }

    var MultiSampler: {
        new(samples: Object, onload?: Function): Tone.MultiSampler;
    }

    interface MultiSampler extends Tone.Instrument {
        samples: Tone.Sampler;
        triggerAttack(sample: string, time?: Tone.Time, velocity?: number): void;
        triggerAttackRelease(sample: string, duration: Tone.Time, time?: Tone.Time, velocity?: number);
        triggerRelease(sample: string, time?: Tone.Time): void;

    }

    var PluckSynth : {
        new(): Tone.PluckSynth;
    }

    interface PluckSynth extends Tone.Instrument {
        attackNoise: number;
        dampening: Tone.Signal;
        resonance: Tone.Signal;
    }

    var PolySynth : {
        new(voicesAmount?: any, voice?: Function, voiceOptions?: Object): Tone.PolySynth;
    }

    interface PolySynth extends Tone.Instrument {
        set(params: Object): void;
        setPreset(presetName: string): void;
    }

    var Sampler: {
        new(url: any, load?: Function): Tone.Sampler;
    }

    interface Sampler extends Tone.Instrument {
        envelope: Tone.Envelope;
        filter: BiquadFilterNode;
        filterEnvelope: Tone.Envelope;
        player: Tone.Player;
        triggerAttack(sample: string, time?: Tone.Time, velocity?: number): void;
        triggerRelease(sample: string, time?: Tone.Time): void;
    }

    var LowpassCombFilter: {
        new(minDelay?: number): Tone.LowpassCombFilter;
    }

    interface LowpassCombFilter extends Tone {
        dampening: Tone.Signal;
        resonance: Tone.Signal;
        setDelayTime(delayAmount: number, time?: Tone.Time): void;
    }

    var Master: {
        new(): Tone.Master;
    }

    interface Master extends Tone {
        limiter: DynamicsCompressorNode;
        mute(muted: boolean): void;
        setVolume(db: number, fadeTime?: Tone.Time): void;
    }

    var Meter: {
        new(channels?: number, smoothing?: number, clipMemory?:number): Tone.Meter;
    }

    interface Meter extends Tone {
        channels: number;
        clipMemory: number;
        smoothing: number;
        getDb(channel?:number): number;
        getLevel(channel?:number): number;
        getValue(channel?:number): number;
    }

    var Note: {
        new(channel: any, time:Tone.Time, value: any): Tone.Note;
    }

    interface Note {
        value: any;
        parseScore(score: Object): Array<Tone.Note>;
        route(channel:any, callback?: Function): void;
        unroute(): void;
        dispose(): void;
    }

    var Panner: {
        new(initialPan?: number): Tone.Panner;
    }

    interface Panner extends Tone {
        pan: Tone.Signal;
        setPan(pan: number, rampTime?: Tone.Time): void;
    }

    var Route: {
        new(outputCount?: number): Tone.Route;
    }
    interface Route extends Tone {
        gate: Tone.Signal;
        //output: Array<RouteGate>;
        select(which?: number, time?: Tone.Time): void;
    }

    var Scale: {
        new(inputMin: number, inputMax: number, outputMin: number, outputMax: number): Tone.Scale;
    }

    interface Scale extends Tone {
        setInputMax(val: number): void;
        setInputMin(val: number): void;
        setOuputMax(val: number): void;
        setOuputMin(val: number): void;
    }

    var ScaleExp: {
        new(inputMin: number, inputMax: number, outputMin: number, outputMax?: number, exponent?: number): Tone.ScaleExp;
    }

    interface ScaleExp extends Tone {
        setExponent(exp: number): void;
        setInputMax(val: number): void;
        setInputMin(val: number): void;
        setOuputMax(val: number): void;
        setOuputMin(val: number): void;
    }

    var Signal: {
        new(value?: number): Tone.Signal;
    }

    interface Signal extends Tone {
        cancelScheduledValues(startTime: Tone.Time): void;
        exponentialRampToValueAtTime(value: number, endTime: Tone.Time): void;
        exponentialRampToValueNow(value: number, endTime: Tone.Time): void;
        getValue(): number;
        linearRampToValueAtTime(value: number, endTime: Tone.Time): void;
        linearRampToValueNow(value: number, endTime: Tone.Time): void;
        setCurrentValueNow(now?: number): number;
        setTargetAtTime(value: number, startTime: Tone.Time, timeConstant: number): void;
        setValue(value?: number): void;
        setValueAtTime(value: number, time: Tone.Time): void;
        setValueCurveAtTime(values: Array<number>, startTime: Tone.Time, duration: Tone.Time): void;
        sync(signal: Tone.Signal, ratio?: number): void;
        unsync(): void;
    }

    var Source: {
        new(): Tone.Source;
    }

    interface Source extends Tone {
        State: string;
        pause(time: Tone.Time): void;
        setVolume(db: number, fadeTime?: Tone.Time): void;
        start(time?: Tone.Time): void;
        stop(time?: Tone.Time): void;
        sync(delay?: Tone.Time): void;
        unsync(): void;
        state: Tone.Source.State;
    }

    module Source {
        interface State{}
    }

    var LFO: {
        new(rate: number, outputMin?: number, outputMax?: number): Tone.LFO;
    }

    interface LFO extends Tone.Source {
        frequency: Tone.Signal;
        oscillator: Tone.Oscillator;
        set(params: Object): void;
        setFrequency(val: Tone.Time, rampTime?: Tone.Time): void;
        setMax(max: number): void;
        setMin(min: number): void;
        setPhase(degrees: number): void;
        setType(type: string): void;
    }

    var Microphone: {
        new(inputNum?: number): Tone.Microphone;
    }

    interface Microphone extends Tone.Source {}

    var Noise: {
        new(type: string): Tone.Noise;
    }

    interface Noise extends Tone.Source {
        onended();
        setType(type: string, time?: Tone.Time);
    }

    var Oscillator: {
        new(frequency: number, type?: string): Tone.Oscillator;
    }

    interface Oscillator extends Tone.Source {
        defaults: Object;
        detune: Tone.Signal;
        frequency: Tone.Signal;
        state: Tone.Source.State;
        onended();
        set(params: Object): void;
        setFrequency(val: Tone.Time, rampTime?: Tone.Time): void;
        setPhase(degrees: number): void;
        setType(type: string): void;
        oscillator: OscillatorNode;
    }

    var Player: {
        new(url?: string, onload?: Function): Tone.Player;
    }

    interface Player extends Tone.Source {
        duration: number;
        loop: boolean;
        loopEnd: number;
        loopStart: number;
        retrigger: boolean;
        load(url: string, callback?: Function): void;
        onended(): void;
        setBuffer(buffer: AudioBuffer);
        setPlaybackRate(rate: number, rampTime?: Tone.Time): void;
        start(startTime?: Tone.Time, offset?: Tone.Time, duration?: Tone.Time): void;
    }

    var PulseOscillator:  {
        new(frequency?: number): Tone.PulseOscillator;
    }

    interface PulseOscillator extends Tone.Source {
        detune: Tone.Signal;
        frequency: Tone.Signal;
        state: Tone.Source.State;
        width: Tone.Signal;
        setWidth(width: number): void;
    }

    interface Time{}

    var Transport:  {
        new(): Tone.Transport;
    }

    interface Transport extends Tone {
        loop: boolean;
        state: TransportState;

        clearInterval(rmInterval: number): boolean;
        clearIntervals(): void;
        clearTimeline(timelineID: number): boolean;
        clearTimelines(): void;
        clearTimeout(timeoutID: number): boolean;
        clearTimeouts(): void;
        getBpm(): number;
        getTimeSignature(): number;
        getTransportTime(): string;
        pause(time: Tone.Time): void;
        setBpm(bpm: number, rampTime?: Tone.Time): void;
        setInterval(callback: Function, interval: Tone.Time, ctx: Object): number;
        setLoopEnd(endPosition: Tone.Time): void;
        setLoopPoints(startPosition: Tone.Time, endPosition: Tone.Time): void;
        setLoopStart(startPosition: Tone.Time): void;
        setTimeline(callback: Function, timeout: Tone.Time, ctx: Object): number;
        setTimeout(callback: Function, time: Tone.Time, ctx: Object): number;
        setTimeSignature(numerator: number, denominator?: number): void;
        setTransportTime(progress: Tone.Time): void;
        start(time: Tone.Time): void;
        stop(time: Tone.Time): void;
        syncSignal(signal: Tone.Signal): void;
        syncSource(source: Tone.Source, delay: Tone.Time): void;
        toTicks(time: Tone.Time): number;
        unsyncSource(source: Tone.Source): void;
    }


    /// -------------------  SIGNAL HELPER CLASSES --------------------------///

    var Abs: {
        new(): Tone.Abs;
    }

    interface Abs extends Tone {}

    var Add: {
        new(value:number): Tone.Add;
    }

    interface Add extends Tone {
        setValue(value: number): void;
    }

    var Equal: {
        new(value: number): Tone.Equal;
    }

    interface Equal extends Tone {
        //input: Tone.Add;
        //output: Tone.EqualZero;
        setValue(value: number): void;
    }

    var EqualZero: {
        new(): Tone.EqualZero;
    }

    interface EqualZero extends Tone {
        //input: WaveShaperNode;
        output: GainNode;
    }

    var LessThan: {
        new(value?: number): Tone.LessThan;
    }

    interface LessThan extends Tone {
        //input:Tone.Add;
        //output: Tone.Threshold;
        setValue(value: number): void;
    }

    var GreaterThan: {
        new(value?: number): Tone.GreaterThan;
    }

    interface GreaterThan extends Tone {
        //input:Tone.Add;
        //output: Tone.Threshold;
        setValue(value: number): void;
    }

    var Max: {
        new(max: number): Tone.Max;
    }

    interface Max extends Tone {
        setMax(value: number): void;
    }

    var Merge: {
        new(): Tone.Merge;
    }

    interface Merge extends Tone {
        //input: Array<GainNode>;
        left: GainNode;
        right: GainNode;
    }

    var Min: {
        new(min: number): Tone.Min;
    }

    interface Min extends Tone {
        setMin(value:number):void;
    }

    var Modulo: {
        new(modulus: number, bits?:number): Tone.Modulo;
    }

    interface Modulo extends Tone {}

    var Mono: {
        new(): Tone.Mono;
    }

    interface Mono extends Tone {}

    var Multiply: {
        new(value?: number): Tone.Multiply;
    }

    interface Multiply extends Tone {
        setValue(value: number): void;
    }

    var Negate: {
        new(): Tone.Negate;
    }

    interface Negate extends Tone {}

    var Select: {
        new(sourceCount?: number): Tone.Select;
    }

    interface Select extends Tone {
        gate: Tone.Signal;
        //input: Array<SelectGate>;
        select(which?: number, time?: Tone.Time): void;
    }

    var Split: {
        new(): Tone.Split;
    }

    interface Split extends Tone {
        gate: Tone.Signal;
        left: GainNode;
        right: GainNode;
        //output: Array<GainNode>;
    }

    var Switch: {
        new(): Tone.Switch;
    }

    interface Switch extends Tone {
        gate: Tone.Signal;
        close(time: Tone.Time): void;
        open(time: Tone.Time): void;
    }

    var Threshold: {
        new(thresh?: number): Tone.Threshold;
    }

    interface Threshold extends Tone {
        //input: WaveShaperNode;
        setThreshold(thresh: number): void;
    }

}

interface TransportState {}
