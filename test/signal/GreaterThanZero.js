define(["helper/Offline", "helper/Basic", "Tone/signal/GreaterThanZero", "Tone/signal/Signal", "helper/Supports"], 
function (Offline, Basic, GreaterThanZero, Signal, Supports) {

	describe("GreaterThanZero", function(){

		Basic(GreaterThanZero);

		describe("Comparison", function(){

			it("Outputs 0 when the value is less than 0", function(done){
				var signal, gtz;
				var offline = new Offline();
				offline.before(function(dest){
					signal = new Signal(-1);
					gtz = new GreaterThanZero();
					signal.connect(gtz);
					gtz.connect(dest);
				});
				offline.test(function(sample){
					expect(sample).to.equal(0);
				});
				offline.after(function(){
					signal.dispose();
					gtz.dispose();
					done();
				});
				offline.run();
			});

			it("Outputs 1 when the value is greater than 0", function(done){
				var signal, gtz;
				var offline = new Offline();
				offline.before(function(dest){
					signal = new Signal(1);
					gtz = new GreaterThanZero();
					signal.connect(gtz);
					gtz.connect(dest);
				});
				offline.test(function(sample){
					expect(sample).to.equal(1);
				});
				offline.after(function(){
					signal.dispose();
					gtz.dispose();
					done();
				});
				offline.run();
			});

			if (Supports.WAVESHAPER_0_POSITION){

				it("Outputs 0 when the value is equal to 0", function(done){
					var signal, gtz;
					var offline = new Offline();
					offline.before(function(dest){
						signal = new Signal(0);
						gtz = new GreaterThanZero();
						signal.connect(gtz);
						gtz.connect(dest);
					});
					offline.test(function(sample){
						expect(sample).to.equal(0);
					});
					offline.after(function(){
						signal.dispose();
						gtz.dispose();
						done();
					});
					offline.run();
				});
			}

			it("Outputs 1 when the value is slightly above 0", function(done){
				var signal, gtz;
				var offline = new Offline();
				offline.before(function(dest){
					signal = new Signal(0.001);
					gtz = new GreaterThanZero();
					signal.connect(gtz);
					gtz.connect(dest);
				});
				offline.test(function(sample){
					expect(sample).to.equal(1);
				});
				offline.after(function(){
					signal.dispose();
					gtz.dispose();
					done();
				});
				offline.run();
			});
		});
	});
});