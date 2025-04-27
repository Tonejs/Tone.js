# 15.0.x

-   `set` in constructor even if AudioBuffer is not from std-audio-context ([0399687](https://github.com/Tonejs/Tone.js/commit/0399687)), closes [#991](https://github.com/Tonejs/Tone.js/issues/991)
-   ability to mute a sequence ([ac856bc](https://github.com/Tonejs/Tone.js/commit/ac856bc)), closes [#823](https://github.com/Tonejs/Tone.js/issues/823)
-   Add `"type": "module"` to `package.json` ([69055ba](https://github.com/Tonejs/Tone.js/commit/69055ba))
-   Add back `main` as ESM build ([8cc6e8a](https://github.com/Tonejs/Tone.js/commit/8cc6e8a))
-   Add Pattern.index ([205c438](https://github.com/Tonejs/Tone.js/commit/205c438))
-   Add test for duplicate events ([d5c8a25](https://github.com/Tonejs/Tone.js/commit/d5c8a25))
-   adding @category definitions for docs, fixing some typos/mistakes along the way ([0e2b5b9](https://github.com/Tonejs/Tone.js/commit/0e2b5b9))
-   adding createMediaElementSource ([301f8cd](https://github.com/Tonejs/Tone.js/commit/301f8cd)), closes [#756](https://github.com/Tonejs/Tone.js/issues/756)
-   Allow instrument and PolySynth to be scheduled to the transport stop/loop events ([954a4fc](https://github.com/Tonejs/Tone.js/commit/954a4fc)), closes [#924](https://github.com/Tonejs/Tone.js/issues/924)
-   allow worklet-based effects to be used with native contexts (#1131) ([f06ff17](https://github.com/Tonejs/Tone.js/commit/f06ff17)), closes [#1131](https://github.com/Tonejs/Tone.js/issues/1131)
-   Analyser constructor smoothing option bug fix ([afb5284](https://github.com/Tonejs/Tone.js/commit/afb5284))
-   bumping standardized-audio-context version ([cbdb596](https://github.com/Tonejs/Tone.js/commit/cbdb596))
-   Chebyshev order must be an integer ([4f9aece](https://github.com/Tonejs/Tone.js/commit/4f9aece)), closes [#844](https://github.com/Tonejs/Tone.js/issues/844)
-   correctly offset phase for each oscillator ([0ac1da5](https://github.com/Tonejs/Tone.js/commit/0ac1da5)), closes [#733](https://github.com/Tonejs/Tone.js/issues/733)
-   custom decay curve #1107 ([d463286](https://github.com/Tonejs/Tone.js/commit/d463286)), closes [#1107](https://github.com/Tonejs/Tone.js/issues/1107)
-   Don't reschedule source when offset is very small ([444d617](https://github.com/Tonejs/Tone.js/commit/444d617)), closes [#999](https://github.com/Tonejs/Tone.js/issues/999) [#944](https://github.com/Tonejs/Tone.js/issues/944)
-   Export remaining effect option interfaces (#1293) ([2b8039b](https://github.com/Tonejs/Tone.js/commit/2b8039b)), closes [#1293](https://github.com/Tonejs/Tone.js/issues/1293)
-   exporting Mono ([8b996bc](https://github.com/Tonejs/Tone.js/commit/8b996bc)), closes [#765](https://github.com/Tonejs/Tone.js/issues/765)
-   fix the wrong variable name 'event' in Emitter.ts ([46bd717](https://github.com/Tonejs/Tone.js/commit/46bd717))
-   Garbage collect nodes used for Transport syncing ([a392067](https://github.com/Tonejs/Tone.js/commit/a392067))
-   increasing attack/release above 0 to avoid distortion ([b39883e](https://github.com/Tonejs/Tone.js/commit/b39883e)), closes [#770](https://github.com/Tonejs/Tone.js/issues/770)
-   latest std-audio-context ([8915e1b](https://github.com/Tonejs/Tone.js/commit/8915e1b)), closes [#720](https://github.com/Tonejs/Tone.js/issues/720)
-   Less verbose unit types (#1181) ([9353d33](https://github.com/Tonejs/Tone.js/commit/9353d33)), closes [#1181](https://github.com/Tonejs/Tone.js/issues/1181)
-   Load only a single AudioWorklet ([75a802c](https://github.com/Tonejs/Tone.js/commit/75a802c))
-   Memoize getTicksAtTime and getSecondsAtTime ([da73385](https://github.com/Tonejs/Tone.js/commit/da73385))
-   Parse note strings with three sharps or flats. ([5cd3560](https://github.com/Tonejs/Tone.js/commit/5cd3560))
-   pass in partials to LFO ([fdc7eb4](https://github.com/Tonejs/Tone.js/commit/fdc7eb4)), closes [#814](https://github.com/Tonejs/Tone.js/issues/814)
-   polysynth does not reschedule event if disposed ([e3a611f](https://github.com/Tonejs/Tone.js/commit/e3a611f))
-   Recorder resumes if start() is called in paused state (#1266) ([ead4f21](https://github.com/Tonejs/Tone.js/commit/ead4f21)), closes [#1266](https://github.com/Tonejs/Tone.js/issues/1266)
-   remove implicit "stop" scheduling ([0b7a352](https://github.com/Tonejs/Tone.js/commit/0b7a352)), closes [#778](https://github.com/Tonejs/Tone.js/issues/778)
-   Reverb input string time (#1313) ([bf3ee91](https://github.com/Tonejs/Tone.js/commit/bf3ee91)), closes [#1313](https://github.com/Tonejs/Tone.js/issues/1313) [#1253](https://github.com/Tonejs/Tone.js/issues/1253)
-   Reverse Emitter off callback loop for correct removal of duplicate events ([b5f582e](https://github.com/Tonejs/Tone.js/commit/b5f582e))
-   Revert "fix for AudioBufferSourceNode stop time miscalculation" ([e1c6631](https://github.com/Tonejs/Tone.js/commit/e1c6631))
-   Smooth RMS values per channel in Meter ([45d2009](https://github.com/Tonejs/Tone.js/commit/45d2009)), closes [#882](https://github.com/Tonejs/Tone.js/issues/882)
-   throws error when polysynth is used with a non monophonic class ([4f5353e](https://github.com/Tonejs/Tone.js/commit/4f5353e)), closes [#939](https://github.com/Tonejs/Tone.js/issues/939)
-   use now() instead of currentTime ([9e9b3d2](https://github.com/Tonejs/Tone.js/commit/9e9b3d2))
-   Use reciprocal of tempo when syncing time signals to Transport ([64c8a29](https://github.com/Tonejs/Tone.js/commit/64c8a29)), closes [#879](https://github.com/Tonejs/Tone.js/issues/879)
-   Using web-test-runner for tests, updating import paths (#1242) ([aaf880c](https://github.com/Tonejs/Tone.js/commit/aaf880c)), closes [#1242](https://github.com/Tonejs/Tone.js/issues/1242)
-   warn if event is scheduled without using the scheduled time. ([6dd22e7](https://github.com/Tonejs/Tone.js/commit/6dd22e7)), closes [#959](https://github.com/Tonejs/Tone.js/issues/959)
-   fix: load base64 encoded sounds when baseUrl is not empty ([a771811](https://github.com/Tonejs/Tone.js/commit/a771811)), closes [#898](https://github.com/Tonejs/Tone.js/issues/898)
-   fix: loading non relative URLs ([f7bdff0](https://github.com/Tonejs/Tone.js/commit/f7bdff0))
-   feat: sub-tick scheduling ([33e14d0](https://github.com/Tonejs/Tone.js/commit/33e14d0))

### BREAKING CHANGES

-   Deprecating singleton variables, use singleton getter instead (#1233) ([3d42017](https://github.com/Tonejs/Tone.js/commit/3d42017)), closes [#1233](https://github.com/Tonejs/Tone.js/issues/1233)
-   Removing double-encoding of urls (#1254) ([de086f5](https://github.com/Tonejs/Tone.js/commit/de086f5)), closes [#1254](https://github.com/Tonejs/Tone.js/issues/1254)

# 14.7.x

### Features

-   **Converted to typescript!!!**
-   adding AudioWorkletNode constructors to Context ([f7bdd75](https://github.com/Tonejs/Tone.js/commit/f7bdd75))
-   adding ability to get the frequency at the FFT index ([22cecdc](https://github.com/Tonejs/Tone.js/commit/22cecdc281c8076c054affaef9dc422665acda2e))
-   adding AudioWorkletNode constructors to Context ([f7bdd75](https://github.com/Tonejs/Tone.js/commit/f7bdd7528fa9549740dc514df6308303c060e091))
-   adding BiquadFilter ([75617d3](https://github.com/Tonejs/Tone.js/commit/75617d341fe44ca5d332ea4e547f07c266a54753)), closes [#686](https://github.com/Tonejs/Tone.js/issues/686)
-   adding linting to jsdocs ([10ef513](https://github.com/Tonejs/Tone.js/commit/10ef513))
-   adding send/receive to Channel ([703f27a](https://github.com/Tonejs/Tone.js/commit/703f27a))
-   Adding triggerRelease to PluckSynth ([04405af](https://github.com/Tonejs/Tone.js/commit/04405af))
-   Can set the parameter after constructing Param ([23ca0f9](https://github.com/Tonejs/Tone.js/commit/23ca0f9))
-   adding onerror to Sampler ([7236600](https://github.com/Tonejs/Tone.js/commit/7236600182d336d6598f86d7d7afe8761e733774)), closes [#605](https://github.com/Tonejs/Tone.js/issues/605)
-   Chorus extends StereoFeedbackEffect ([a28f1af](https://github.com/Tonejs/Tone.js/commit/a28f1af)), closes [#575](https://github.com/Tonejs/Tone.js/issues/575)
-   Convolver is just a wrapper around the ConvolverNode, no longer an effect ([1668dec](https://github.com/Tonejs/Tone.js/commit/1668dec))
-   Get an oscillator wave as an array ([9ad519e](https://github.com/Tonejs/Tone.js/commit/9ad519e))
-   OfflineContext returns a ToneAudioBuffer ([889dafa](https://github.com/Tonejs/Tone.js/commit/889dafa))
-   OfflineContext yields thread every second of audio rendered ([1154470](https://github.com/Tonejs/Tone.js/commit/1154470)), closes [#436](https://github.com/Tonejs/Tone.js/issues/436)
-   Renaming TransportTimelineSignal to SyncedSignal ([86853fb](https://github.com/Tonejs/Tone.js/commit/86853fb))
-   es6 output ([e5d28ba](https://github.com/Tonejs/Tone.js/commit/e5d28baa5f02c19a6f1c8c50c99e98bd1551d15b))
-   Render a segment of the envelope as an array ([fc5b6f7](https://github.com/Tonejs/Tone.js/commit/fc5b6f7))
-   testing examples in jsdocs ([e306319](https://github.com/Tonejs/Tone.js/commit/e306319))
-   Wrapper around the AudioWorkletNode ([2ee8cb1](https://github.com/Tonejs/Tone.js/commit/2ee8cb1))
-   Input/Outputs are no longer arrays.
    -   simplifies connect/disconnect logic greatly. Simplifies API to just have clearly named inputs/outputs instead of overloading input/output connect numbers
-   Using "Destination" instead of "Master" for output
    -   More consistent with Web Audio API
-   FrequencyShifter - thanks @Foaly
-   PolySynth does not require a polyphony value.
    -   Voice allocation and disposing is done automatically based on demand.
-   MetalSynth and MembraneSynth extends Monophonic enabling them to be used in PolySynth
-   OnePoleFilter is a 6b-per-octave lowpass or highpass filter
    -   Using OnePoleFilter in PluckSynth and LowpassCombFilter
-   latencyHint is now set in constructor ([ba8e82b](https://github.com/Tonejs/Tone.js/commit/ba8e82b1ca8a841a23d6e774641916019c37cc92)), closes [#658](https://github.com/Tonejs/Tone.js/issues/658)
-   meter output can be normalRange in addition to decibels ([2625a13](https://github.com/Tonejs/Tone.js/commit/2625a134b62af117c1c525a4e631e4e52b25ba90))
-   option to pass in the number of input channels to Panner ([d966735](https://github.com/Tonejs/Tone.js/commit/d966735bd97bddc70039bce5a48f26413054eddc)), closes [#609](https://github.com/Tonejs/Tone.js/issues/609)

### BREAKING CHANGES

-   TransportTimelineSignal renamed SyncedSignal
-   Master renamed Destination
-   Buffer renamed ToneAudioBuffer
-   Buffer.on("loaded") is should now use: `Tone.loaded(): Promise<void>`
-   Removing bower ([71c8b3b](https://github.com/Tonejs/Tone.js/commit/71c8b3bbb96e45cfc4aa2cce8a2d8c61a092c91e)), closes [#197](https://github.com/Tonejs/Tone.js/issues/197)
-   Removing Ctrl classes ([51d06bd](https://github.com/Tonejs/Tone.js/commit/51d06bd9873b2f1936a3169930f9696f1ccfb845))
-   `Players.get(name: string)` is renamed to `Players.player(name: string)`

# 13.8.25

-   Moving to common.js-style code

### BREAKING CHANGES

-   AudioNode.prototype.connect is no longer overwritten. This means that you can no longer connect native nodes to Tone.js Nodes.
-   Tone.connect(srcNode, destNode, [ouputNum], [inputNum]) is the way to connect native Web Audio nodes with Tone.js nodes.

# 13.4.9

-   Updating semantic versioning to be more in line with other [semvers](https://semver.org/). Now version is 13.x.x
-   logging full version
-   Added Object notation for Tone.TimeBase and classes that extend it.
    -   i.e. Tone.Time({'4n' : 1, '8t' : 2})
    -   Replacement for deprecated expression strings.
-   Tone.Meter uses RMS instead of peak (thanks [@Idicious](https://github.com/Idicious))
-   Tone.Sampler supports polyphonic syntax (thanks [@zfan40](https://github.com/zfan40))
-   Building files with [webpack](https://webpack.js.org/)
-   Follower/Gate uses a single "smoothing" value instead of separate attacks and releases
-   Changing references to `window` allowing it to not throw error in node context
-   Testing examples
-   Tone.Channel combines Tone.PanVol with Tone.Solo.
-   Removing require.html example.
-   adding `partialCount` and `baseType` to Oscillator classes, helps with getting/setting complex types.

# r12

-   Consolidating all shims into [shim folder](https://github.com/Tonejs/Tone.js/tree/dev/Tone/shim)
-   Using ConstantSourceNode in Signal when available
-   switching to eslint from jshint
-   Running [CI tests](https://travis-ci.org/Tonejs/Tone.js/) on Firefox, Chrome (latest and canary) and Safari (latest and version 9).
-   [Tone.Reverb](https://tonejs.github.io/docs/Reverb) is a convolution-based stereo reverb. [Example](https://tonejs.github.io/examples/#reverb).
-   Optimizing basic Oscillator types and many Signal use-case
-   Optimizing basic connection use-case of Tone.Signal where one signal is controlling another signal
-   Testing rendered output against an existing audio file for continuity and consistency
-   Optimizing triggerAttack/Release by starting/stopping oscillators when not playing
-   [TickSource](https://tonejs.github.io/docs/TickSource) (used in Clock and Player) tracks the elapsed ticks
    -   Improved precision of tracking ticks in Transport and Clock
-   `Player.position` returns the playback position of the AudioBuffer accounting for any playbackRate changes
-   Removing `retrigger` option with Tone.Player. Tone.BufferSource should be used if retriggering is desired.

**BREAKING CHANGES:**

-   Tone.TimeBase and all classes that extend it not longer support string expressions.
    RATIONALE :
    _ Since all classes implement `valueOf`, expressions can be composed in JS instead of as strings
    _ e.g. `Time('4n') * 2 + Time('3t')` instead of `Time('4n * 2 + 3t')` \* this change greatly simplifies the code and is more performant

# r11

-   [Code coverage](https://coveralls.io/github/Tonejs/Tone.js) analysis
-   [Dev build](https://tonejs.github.io/build/dev/Tone.js) with each successful commit
-   [Versioned docs](https://tonejs.github.io/docs/Tone) plus a [dev build of the docs](https://tonejs.github.io/docs/dev/Tone) on successful commits
-   [Tone.AudioNode](https://tonejs.github.io/docs/AudioNode) is base class for all classes which generate or process audio
-   [Tone.Sampler](https://tonejs.github.io/docs/Sampler) simplifies creating multisampled instruments
-   [Tone.Solo](https://tonejs.github.io/docs/Solo) makes it easier to mute/solo audio
-   [Mixer](https://tonejs.github.io/examples/#mixer) and [sampler](https://tonejs.github.io/examples/#sampler) examples
-   Making type-checking methods static
-   [Tone.TransportTimelineSignal](https://tonejs.github.io/docs/TransportTimelineSignal) is a signal which can be scheduled along the Transport
-   [Tone.FFT](https://tonejs.github.io/docs/FFT) and [Tone.Waveform](https://tonejs.github.io/docs/Waveform) abstract Tone.Analyser
-   [Tone.Meter](https://tonejs.github.io/docs/Meter) returns decibels
-   [Tone.Envelope](https://tonejs.github.io/docs/Envelope) uses exponential approach instead of exponential curve for decay and release curves
-   [Tone.BufferSource](https://tonejs.github.io/docs/BufferSource) fadeIn/Out can be either "linear" or "exponential" curve

# r10

-   Tone.Context wraps AudioContext
-   Tone.OfflineContext wraps OfflineAudioContext
-   Tone.Offline: method for rendering audio offline
-   Rewriting tests with Tone.Offline
-   Optimizing Tone.Draw to only loop when events are scheduled: [#194](https://github.com/Tonejs/Tone.js/issues/194)
-   Time.eval->valueOf which takes advantage of build-in primitive evaluation [#205](https://github.com/Tonejs/Tone.js/issues/205)
-   [Offline example](https://tonejs.github.io/examples/#offline)

# r9

-   Tone.Clock performance and lookAhead updates.
-   Tone.Transport.lookAhead = seconds|'playback'|'interactive'|'balanced'
-   Convolver.load and Player.load returns Promise
-   Tone.ExternalInput -> Tone.UserMedia, simplified API, open() returns Promise.
-   Tone.Draw for animation-frame synced drawing
-   Compressor Parameters are now Tone.Params
-   Bug fixes

# r8

-   Transport.seconds returns the progress in seconds.
-   Buffer.from/toArray, Float32Array <-> Buffer conversions
-   Buffer.slice(start, end) slices and returns a subsection of the Buffer
-   Source.sync now syncs all subsequent calls to `start` and `stop` to the TransportTime instead of the AudioContext time.
    -   e.g. source.sync().start(0).stop(0.8); //plays source between 0 and 0.8 of the Transport
-   Transport.on("start" / "stop") callbacks are invoked just before the event.
-   Param can accept an LFO description in the constructor or .value
    -   e.g. param.value = {min : 10, max : 20, frequency : 0.4}
-   Time.TimeBase has clone/copy methods.
-   Tone.Buffer.prototype.load returns Promise
-   Using Tone.Delay and Tone.Gain everywhere
-   Patch for Chrome 53+ issue of not correctly scheduling AudioParams with setValueAtTime
-   Panner3D and Tone.Listener wrap native PannerNode and AudioListener to give 3D panning ability.

# r7

-   MetalSynth creates metallic, cymbal sounds
-   DrumSynth -> MembraneSynth
-   FMOscillator, AMOscillator types
-   FatOscillator creates multiple oscillators and detunes them slightly
-   FM, AM, Fat Oscillators incorporated into OmniOscillator
-   Simplified FM and AM Synths and APIs
-   Panner.pan is between -1,1 like the StereoPannerNode
-   Pruned away unused (or little used) Signal classes.
    -   All this functionality will be available when the AudioWorkerNode is introduced.
-   Clock uses Web Workers instead of requestAnimationFrame which allows it to run in the background.
-   Removed `startMobile`. Using [StartAudioContext](https://github.com/tambien/StartAudioContext) in examples.
-   Automated test runner using [Travis CI](https://travis-ci.org/Tonejs/Tone.js/)
-   Simplified NoiseSynth by removing filter and filter envelope.
-   Added new timing primitive types: Time, Frequency, TransportTime.
-   Switching parameter position of type and size in Tone.Analyser
-   Tone.Meter uses Tone.Analyser instead of ScriptProcessorNode.
-   Tone.Envelope has 5 new attack/release curves: "sine", "cosine", "bounce", "ripple", "step"
-   Renamed Tone.SimpleSynth -> Tone.Synth
-   Tone.Buffers combines multiple buffers
-   Tone.BufferSource a low-level wrapper, and Tone.MultiPlayer which is good for multisampled instruments.
-   Tone.GrainPlayer: granular synthesis buffer player.
-   Simplified Sampler

DEPRECATED:

-   Removed SimpleFM and SimpleAM

# r6

-   Added PitchShift and Vibrato Effect.
-   Added Timeline/TimelineState/TimelineSignal which keeps track of all scheduled state changes.
-   Clock uses requestAnimationFrame instead of ScriptProcessorNode
-   Removed `onended` event from Tone.Source
-   Refactored tests into individual files.
-   Renamed some Signal methods: `exponentialRampToValueNow`->`exponentialRampToValue`, `setCurrentValueNow`->`setRampPoint`
-   LFO no longer starts at bottom of cycle. Starts at whatever phase it's set at.
-   Transport is an event emitter. triggers events on "start", "stop", "pause", and "loop".
-   Oscillator accepts a "partials" array.
-   Microphone inherits from ExternalInput which is generalized for different inputs.
-   New scheduling methods on Transport - `schedule`, `scheduleOnce`, and `scheduleRepeat`.
-   Tone.Gain and Tone.Delay classes wrap the native Web Audio nodes.
-   Moved [MidiToScore](https://github.com/Tonejs/MidiConvert) and [TypeScript](https://github.com/Tonejs/TypeScript) definitions to separate repos.
-   Tone.Param wraps the native AudioParam and allows for unit conversion.
-   Quantization with Transport.quantize and using "@" in any Time. [Read more](https://github.com/Tonejs/Tone.js/wiki/Time).
-   Control-rate generators for value interpolation, patterns, random numbers, and markov chains.
-   schedulable musical events: Tone.Event, Tone.Loop, Tone.Part, Tone.Pattern, Tone.Sequence.
-   Player's playbackRate is now a signal and Noise includes a playbackRate signal.
-   All filterEnvelopes use new Tone.FrequencyEnvelope with frequency units and `baseFrequency` and `octaves` instead of `min` and `max`.
-   Phaser uses "octaves" instead of "depth" to be more consistent across the whole Tone.js API.
-   Presets now have [their own repo](https://github.com/Tonejs/Presets)

DEPRECATED:

-   `setTimeout`, `setInterval`, `setTimeline` in favor of new `schedule`, `scheduleOnce`, and `scheduleRepeat`.
-   Tone.Signal no longer takes an AudioParam in the first argument. Use Tone.Param instead.
-   Tone.Buffer.onload/onprogress/onerror is deprecated. Use `Tone.Buffer.on("load", callback)` instead.

# r5

-   reverse buffer for Player and Sampler.
-   Tone.Volume for simple volume control in Decibels.
-   Panner uses StereoPannerNode when available.
-   AutoFilter and Tremolo effects.
-   Made many attributes read-only. preventing this common type of error: `oscillator.frequency = 200` when it should be `oscillator.frequency.value = 200`.
-   Envelope supports "linear" and "exponential" attack curves.
-   Renamed Tone.EQ -> Tone.EQ3.
-   Tone.DrumSynth makes kick and tom sounds.
-   Tone.MidSideCompressor and Tone.MidSideSplit/Tone.MidSideMerge
-   Tone.Oscillator - can specify the number of partials in the type: i.e. "sine10", "triangle3", "square4", etc.
-   mute/unmute the master output: `Tone.Master.mute = true`.
-   3 new simplified synths: SimpleSynth, SimpleAM and SimpleFM
-   `harmonicity` is a signal-rate value for all instruments.
-   expose Q in Phaser.
-   unit conversions using Tone.Type for signals and LFO.
-   [new docs](http://tonejs.org/docs)
-   [updated examples](http://tonejs.org/examples)

# r4

-   `toFrequency` accepts notes by name (i.e. `"C4"`)
-   Envelope no longer accepts exponential scaling, only Tone.ScaledEnvelope
-   Buffer progress and load events which tracks the progress of all downloads
-   Buffer only accepts a single url
-   Sampler accepts multiple samples as an object.
-   `setPitch` in sampler -> `setNote`
-   Deprecated MultiSampler - use Sampler with PolySynth instead
-   Added [cdn](http://cdn.tonejs.org/latest/Tone.min.js) - please don't use for production code
-   Renamed DryWet to CrossFade
-   Functions return `this` to allow for chaining. i.e. `player.toMaster().start(2)`.
-   Added `units` to Signal class which allows signals to be set in terms of Tone.Time, Tone.Frequency, Numbers, or Decibels.
-   Replaced set/get method with ES5 dot notation. i.e. `player.setVolume(-10)` is now `player.volume.value = -10`.
    To ramp the volume use either `player.volume.linearRampToValueNow(-10, "4n")`, or the new `rampTo` method which automatically selects the ramp (linear|exponential) based on the type of data.
-   set/get methods for all components
-   syncSignal and unsyncSignal moved from Signal to Transport
-   Add/Multiply/Subtract/Min/Max/GreaterThan/LessThan all extend Tone.Signal which allows them to be scheduled and automated just like Tone.Signal.
-   Deprecated Tone.Divide and Tone.Inverse. They were more complicated than they were useful.

BREAKING CHANGES:

The API has been changed consistently to use `.attribute` for getting and setting instead of `getAttribute` and `setAttribute` methods. The reasoning for this is twofold: firstly, Tone.Signal attributes were previously limited in their scheduling capabilities when set through a setter function. For exactly, it was not possible to do a setValueAtTime on the `bpm` of the Transport. Secondly, the new EcmaScript 5 getter/setter approach resembles the Web Audio API much more closely, which will make intermixing the two APIs even easier.

If you're using Sublime Text, one way to transition from the old API to the new one is with a regex find/replace:
find `Tone.Transport.setBpm\((\d+)\)` and replace it with `Tone.Transport.bpm.value = $1`.

Or if setBpm was being invoked with a rampTime:
find `Tone.Transport.setBpm\((\d+)\, (\d+)\)` and replace it with `Tone.Transport.bpm.rampTo($1, $2)`.

# r3

Core Change:

-   Swing parameter on Transport
-   Player loop positions stay in tempo-relative terms even with tempo changes
-   Envelope ASDR stay in tempo-relative terms even with tempo changes
-   Modified build script to accommodate using requirejs with build and minified version

Signal Processing:

-   Tone.Expr: signal processing expression parser for Tone.Signal math
-   All signal binary operators accept two signals as inputs
-   Deprecated Tone.Threshold - new class Tone.GreaterThanZero
-   NOT, OR, AND, and IfThenElse signal logic operators
-   Additional signal classes: Inverse, Divide, Pow, AudioToGain, Subtract
-   Scale no longer accepts input min/max. Assumes [0,1] range.
-   Normalize class if scaling needs to happen from other input ranges
-   WaveShaper function wraps the WaveShaperNode

Effects:

-   Distortion and Chebyshev distortion effects
-   Compressor and MultibandCompressor
-   MidSide effect type and StereoWidener
-   Convolver effect and example

Synths:

-   Setters on PluckSynth and PulseOscillator
-   new PWMOscillator
-   OmniOscillator which combines PWMOscillator, Oscillator, and PulseOscillator into one
-   NoiseSynth

# r2

-   PluckSynth - Karplus-Strong Plucked String modeling synth
-   Freeverb
-   John Chowning Reverb (JCReverb)
-   LowpassCombFilter and FeedbackCombFilter
-   Sampler with pitch control
-   Clock tick callback is out of the audio thread using setTimeout
-   Optimized Tone.Modulo
-   Tests run using OfflineRenderingContext
-   Fixed Transport bug where timeouts/intervals and timelines were on a different tick counter
-   AmplitudeEnvelope + triggerAttackDecay on Envelope
-   Instruments inherit from Tone.Instrument base-class
-   midi<-->note conversions

# r1 - First!
