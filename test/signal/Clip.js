define(["helper/Offline", "Tone/signal/Clip", "helper/Basic", 
	"Test", "Tone/source/Oscillator", "Tone/signal/Signal"], 
	function (Offline, Clip, Basic, Test, Oscillator, Signal) {

	describe("Clip", function(){

		Basic(Clip);

		describe("Range Clipping", function(){

			it("handles input and output connections", function(){
				var clip = new Clip(0, 1);
				Test.connect(clip);
				clip.connect(Test);
				clip.dispose();
			});

			it("output the upper limit when signal is greater than clip", function(done){
				var signal, clip;
				var offline = new Offline(); 
				offline.before(function(dest){
					signal = new Signal(4);
					clip = new Clip(2, 3);
					signal.connect(clip);
					clip.connect(dest);
				});
				offline.test(function(sample){
					expect(sample).to.equal(3);
				});
				offline.after(function(){
					signal.dispose();
					clip.dispose();
					done();
				});
				offline.run();
			});

			it("outputs the incoming signal when in between upper and lower limit", function(done){
				var signal, clip;
				var offline = new Offline(); 
				offline.before(function(dest){
					signal = new Signal(-12);
					clip = new Clip(-14, 14);
					signal.connect(clip);
					clip.connect(dest);
				});
				offline.test(function(sample){
					expect(sample).to.equal(-12);
				});
				offline.after(function(){
					signal.dispose();
					clip.dispose();
					done();
				});
				offline.run();
			});

			it("outputs the lower limit when incoming signal is less than the lower limit", function(done){
				var signal, clip;
				var offline = new Offline(); 
				offline.before(function(dest){
					signal = new Signal(-12);
					clip = new Clip(0, 8);
					signal.connect(clip);
					clip.connect(dest);
				});
				offline.test(function(sample){
					expect(sample).to.equal(0);
				});
				offline.after(function(){
					signal.dispose();
					clip.dispose();
					done();
				});
				offline.run();
			});
		});
	});
});