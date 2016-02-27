define(["helper/Offline", "Tone/signal/AudioToGain", "helper/Basic", 
	"Test", "Tone/source/Oscillator", "Tone/signal/Signal", "Tone/signal/Zero"], 
	function (Offline, AudioToGain, Basic, Test, Oscillator, Signal, Zero) {

	describe("AudioToGain", function(){

		Basic(AudioToGain);

		it("handles input and output connections", function(){
			var a2g = new AudioToGain();
			a2g.connect(Test);
			Test.connect(a2g);
			a2g.dispose();
		});

		it("normalizes an oscillator to 0,1", function(done){
			//make an oscillator to drive the signal
			var osc, a2g;
			var offline = new Offline();
			offline.before(function(dest){
				osc = new Oscillator(1000);
				a2g = new AudioToGain();
				osc.connect(a2g);
				a2g.connect(dest);
			});
			offline.test(function(sample){
				expect(sample).to.be.within(0, 1);
			});
			offline.after(function(){
				osc.dispose();
				a2g.dispose();
				done();
			});
			offline.run();
		});

		it("outputs 0.5 for an input value of 0", function(done){
			//make an oscillator to drive the signal
			var sig, a2g;
			var offline = new Offline();
			offline.before(function(dest){
				sig = new Zero();
				a2g = new AudioToGain();
				sig.connect(a2g);
				a2g.connect(dest);
			});
			offline.test(function(sample){
				expect(sample).to.be.closeTo(0.5, 0.01);
			});
			offline.after(function(){
				sig.dispose();
				a2g.dispose();
				done();
			});
			offline.run();
		});

		it("outputs 1 for an input value of 1", function(done){
			//make an oscillator to drive the signal
			var sig, a2g;
			var offline = new Offline();
			offline.before(function(dest){
				sig = new Signal(1);
				a2g = new AudioToGain();
				sig.connect(a2g);
				a2g.connect(dest);
			});
			offline.test(function(sample){
				expect(sample).to.be.closeTo(1, 0.01);
			});
			offline.after(function(){
				sig.dispose();
				a2g.dispose();
				done();
			});
			offline.run();
		});

		it("outputs 0 for an input value of -1", function(done){
			//make an oscillator to drive the signal
			var sig, a2g;
			var offline = new Offline();
			offline.before(function(dest){
				sig = new Signal(-1);
				a2g = new AudioToGain();
				sig.connect(a2g);
				a2g.connect(dest);
			});
			offline.test(function(sample){
				expect(sample).to.be.closeTo(0, 0.01);
			});
			offline.after(function(){
				sig.dispose();
				a2g.dispose();
				done();
			});
			offline.run();
		});
	});
});