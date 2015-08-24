define(["helper/Offline", "Tone/signal/Modulo", "helper/Basic", 
	"Test", "Tone/signal/Signal"], 
	function (Offline, Modulo, Basic, Test, Signal) {

	describe("Modulo", function(){

		Basic(Modulo);

		context("Exponential Scaling", function(){

			it("handles input and output connections", function(){
				var mod = new Modulo();
				Test.connect(mod);
				mod.connect(Test);
				mod.dispose();
			});

			it("can evaluate 0.45 % 0.3", function(done){
				var signal, mod;
				var offline = new Offline();
				offline.before(function(dest){
					signal = new Signal(0.45);
					mod = new Modulo(0.3);
					signal.connect(mod);
					mod.connect(dest);
				}); 
				offline.test(function(sample){
					expect(sample).to.be.closeTo(0.15, 0.0001);
				});
				offline.after(function(){
					signal.dispose();
					mod.dispose();
					done();
				});
				offline.run();
			});

			it("can evaluate 0.1 % 0.2", function(done){
				var signal, mod;
				var offline = new Offline();
				offline.before(function(dest){
					signal = new Signal(0.1);
					mod = new Modulo(0.2);
					signal.connect(mod);
					mod.connect(dest);
				}); 
				offline.test(function(sample){
					expect(sample).to.be.closeTo(0.1, 0.0001);
				});
				offline.after(function(){
					signal.dispose();
					mod.dispose();
					done();
				});
				offline.run();
			});

			it("can set a new modulo value", function(done){
				var signal, mod;
				var offline = new Offline();
				offline.before(function(dest){
					signal = new Signal(0.4);
					mod = new Modulo(0.1);
					mod.value = 0.35;
					expect(mod.value).to.be.closeTo(0.35, 0.001);
					signal.connect(mod);
					mod.connect(dest);
				}); 
				offline.test(function(sample){
					expect(sample).to.be.closeTo(0.05, 0.0001);
				});
				offline.after(function(){
					signal.dispose();
					mod.dispose();
					done();
				});
				offline.run();
			});
		});
	});
});