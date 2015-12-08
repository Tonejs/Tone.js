define(["Tone/component/CrossFade", "helper/Basic", "helper/Offline", "Test", "Tone/signal/Signal"], 
function (CrossFade, Basic, Offline, Test, Signal) {
	describe("CrossFade", function(){

		Basic(CrossFade);

		context("Fading", function(){

			it("handles input and output connections", function(){
				var comp = new CrossFade();
				Test.connect(comp, 0);
				Test.connect(comp, 1);
				comp.connect(Test);
				comp.dispose();
			});

			it("pass 100% of input 0", function(done){
				var crossFade, drySignal, wetSignal;
				var offline = new Offline(0.1); 
				offline.before(function(dest){
					crossFade = new CrossFade();
					drySignal = new Signal(10);
					wetSignal = new Signal(20);
					drySignal.connect(crossFade, 0, 0);
					wetSignal.connect(crossFade, 0, 1);
					crossFade.fade.value = 0;
					crossFade.connect(dest);
				});
				offline.test(function(sample){
					expect(sample).to.closeTo(10, 0.01);
				}); 
				offline.after(function(){
					crossFade.dispose();
					drySignal.dispose();
					wetSignal.dispose();
					done();
				});
				offline.run();
			});

			it("pass 100% of input 1", function(done){
				var crossFade, drySignal, wetSignal;
				var offline = new Offline(0.1); 
				offline.before(function(dest){
					crossFade = new CrossFade();
					drySignal = new Signal(10);
					wetSignal = new Signal(20);
					drySignal.connect(crossFade, 0, 0);
					wetSignal.connect(crossFade, 0, 1);
					crossFade.fade.value = 1;
					crossFade.connect(dest);
				});
				offline.test(function(sample){
					expect(sample).to.closeTo(20, 0.01);
				}); 
				offline.after(function(){
					crossFade.dispose();
					drySignal.dispose();
					wetSignal.dispose();
					done();
				});
				offline.run();
			});
			
			it("can mix two signals", function(done){
				var crossFade, drySignal, wetSignal;
				var offline = new Offline(0.1); 
				offline.before(function(dest){
					crossFade = new CrossFade();
					drySignal = new Signal(2);
					wetSignal = new Signal(1);
					drySignal.connect(crossFade, 0, 0);
					wetSignal.connect(crossFade, 0, 1);
					crossFade.fade.value = 0.5;
					crossFade.connect(dest);
				});
				offline.test(function(sample){
					expect(sample).to.closeTo(2.12, 0.01);
				}); 
				offline.after(function(){
					crossFade.dispose();
					drySignal.dispose();
					wetSignal.dispose();
					done();
				});
				offline.run();
			});
		});
	});
});