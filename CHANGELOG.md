### r3 - Groove

* Swing parameter on Transport
* Tone.Expr: signal processing expression parser for Tone.Signal math
* All signal binary operators accept two signals as inputs
* Envelope ASDR stay in tempo-relative terms even with tempo changes
* Player loop positions stay in tempo-relative terms even with tempo changes
* Setters on PluckSynth and PulseOscillator
* new PWMOscillator
* OmniOscillator which combines PWMOscillator, Oscillator, and PulseOscillator into one
* Modified build script to accommodate using requirejs with build and min
* Deprecated Tone.Threshold - new class Tone.GreaterThanZero
* NOT, OR, AND, and IfThenElse signal logic operators
* Compressor and MultibandCompressor
* Distortion and Chebyshev distortion effects
* Convolver effect and example
* Additional signal classes: Inverse, Divide, Pow
* MidSide effect type and StereoWidener (extends MidSide)


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