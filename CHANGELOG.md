### r4 - Cool is cool

* toFrequency accepts notes by name (i.e. "C4")
* Tone.Envelope no longer accepts exponential scaling, only Tone.ScaledEnvelope
* Tone.Buffer static progress and load events which tracks the progress of all downloads
* Tone.Buffer only accepts a single url
* added [cdn](cdn.tonejs.org/latest/Tone.min.js) - please don't use for production code

### r3 - Expressive Signal

Core Change:

* Swing parameter on Transport
* Player loop positions stay in tempo-relative terms even with tempo changes
* Envelope ASDR stay in tempo-relative terms even with tempo changes
* Modified build script to accommodate using requirejs with build and minified version

Signal Processing:

* Tone.Expr: signal processing expression parser for Tone.Signal math
* All signal binary operators accept two signals as inputs
* Deprecated Tone.Threshold - new class Tone.GreaterThanZero
* NOT, OR, AND, and IfThenElse signal logic operators
* Additional signal classes: Inverse, Divide, Pow, AudioToGain, Subtract
* Scale no longer accepts input min/max. Assumes [0,1] range.
* Normalize class if scaling needs to happen from other input ranges
* WaveShaper function wraps the WaveShaperNode

Effects:

* Distortion and Chebyshev distortion effects
* Compressor and MultibandCompressor
* MidSide effect type and StereoWidener
* Convolver effect and example

Synths:

* Setters on PluckSynth and PulseOscillator
* new PWMOscillator
* OmniOscillator which combines PWMOscillator, Oscillator, and PulseOscillator into one
* NoiseSynth


### r2 - Getting Physical

* PluckSynth - Karplus-Strong Plucked String modeling synth
* Freeverb
* John Chowning Reverb (JCReverb)
* LowpassCombFilter and FeedbackCombFilter
* Sampler with pitch control
* Clock tick callback is out of the audio thread using setTimeout
* Optimized Tone.Modulo
* Tests run using OfflineRenderingContext
* Fixed Transport bug where timeouts/intervals and timelines were on a different tick counter
* AmplitudeEnvelope + triggerAttackDecay on Envelope
* Instruments inherit from Tone.Instrument base-class
* midi<-->note conversions


### r1 - First!