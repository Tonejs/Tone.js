define(["helper/Offline", "Tone/signal/Negate", "helper/Basic", 
	"Test", "Tone/source/Oscillator", "Tone/signal/Signal"], 
	function (Offline, Negate, Basic, Test, Oscillator, Signal) {

	describe("Negate", function(){

		Basic(Negate);

		context("Negating", function(){

			it("handles input and output connections", function(){
				var negate = new Negate();
				Test.connect(negate);
				negate.connect(Test);
				negate.dispose();
			});

			it("negateates a positive value", function(done){
				var signal, negate;
				var offline = new Offline();
				offline.before(function(dest){
					signal = new Signal(1);
					negate = new Negate();
					signal.connect(negate);
					negate.connect(dest);
				}); 
				offline.test(function(sample){
					expect(sample).to.equal(-1);
				});
				offline.after(function(){
					signal.dispose();
					negate.dispose();
					done();
				});
				offline.run();
			});

			it("makes a negateative value positive", function(done){
				var signal, negate;
				var offline = new Offline();
				offline.before(function(dest){
					signal = new Signal(-10);
					negate = new Negate();
					signal.connect(negate);
					negate.connect(dest);
				}); 
				offline.test(function(sample){
					expect(sample).to.equal(10);
				});
				offline.after(function(){
					signal.dispose();
					negate.dispose();
					done();
				});
				offline.run();
			});			
		});
	});
});