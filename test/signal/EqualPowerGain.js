define(["helper/Offline", "Tone/signal/EqualPowerGain", "helper/Basic", 
	"Test", "Tone/source/Oscillator", "Tone/signal/Signal", "helper/PassAudio"], 
	function (Offline, EqualPowerGain, Basic, Test, Oscillator, Signal, PassAudio) {

	describe("EqualPowerGain", function(){

		Basic(EqualPowerGain);

		context("Equal Power Gain", function(){

			it("handles input and output connections", function(){
				var eqGain = new EqualPowerGain();
				Test.connect(eqGain);
				eqGain.connect(Test);
				eqGain.dispose();
			});

			it ("passes audio through", function(done){
				var eqGain;
				PassAudio(function(input, output){
					eqGain = new EqualPowerGain();
					input.chain(eqGain, output);
				}, function(){
					eqGain.dispose();
					done();
				});
			});

			it("scales the input on an equal power scale", function(done){
				//make an oscillator to drive the signal
				var sig, eqGain;
				var offline = new Offline(1);
				offline.before(function(dest){
					sig = new Signal(0);
					eqGain = new EqualPowerGain();
					sig.connect(eqGain);
					eqGain.connect(dest);
					sig.setValueAtTime(0, 0);
					sig.linearRampToValueAtTime(1, 1);
				}); 
				offline.test(function(sample, time){
					expect(sample).to.be.closeTo(eqGain.equalPowerScale(time), 0.01);
				});
				offline.after(function(){
					sig.dispose();
					eqGain.dispose();
					done();
				});
				offline.run();
			});
		});
	});
});