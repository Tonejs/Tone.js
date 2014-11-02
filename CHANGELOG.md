### r3 - Expressive Signal

Core Change:
* Swing parameter on Transport
* Player loop positions stay in tempo-relative terms even with tempo changes
* Envelope ASDR stay in tempo-relative terms even with tempo changes
* Modified build script to accommodate using requirejs with build and min
Signal Processing:
* Tone.Expr: signal processing expression parser for Tone.Signal math
* All signal binary operators accept two signals as inputs
* Deprecated Tone.Threshold - new class Tone.GreaterThanZero
* NOT, OR, AND, and IfThenElse signal logic operators
* Additional signal classes: Inverse, Divide, Pow
Effects:
* Distortion and Chebyshev distortion effects
* Compressor and MultibandCompressor
* MidSide effect type and StereoWidener (extends MidSide)
* Convolver effect and example
Synths:
* Setters on PluckSynth and PulseOscillator
* new PWMOscillator
* OmniOscillator which combines PWMOscillator, Oscillator, and PulseOscillator into one


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