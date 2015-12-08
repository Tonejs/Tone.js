define(["helper/Offline", "helper/Basic", "Tone/signal/EqualZero", "Tone/signal/Signal"], 
function (Offline, Basic, EqualZero, Signal) {

	describe("EqualZero", function(){

		Basic(EqualZero);

		describe("Comparison", function(){

			it("outputs 0 when the value is less than 0", function(done){
				var signal, eq0;
				var offline = new Offline();
				offline.before(function(dest){
					signal = new Signal(-1);
					eq0 = new EqualZero();
					signal.connect(eq0);
					eq0.connect(dest);
				});
				offline.test(function(sample){
					expect(sample).to.equal(0);
				});
				offline.after(function(){
					signal.dispose();
					eq0.dispose();
					done();
				});
				offline.run();
			});

			it("outputs 0 when the value is greater than 0", function(done){
				var signal, eq0;
				var offline = new Offline();
				offline.before(function(dest){
					signal = new Signal(1);
					eq0 = new EqualZero();
					signal.connect(eq0);
					eq0.connect(dest);
				});
				offline.test(function(sample){
					expect(sample).to.equal(0);
				});
				offline.after(function(){
					signal.dispose();
					eq0.dispose();
					done();
				});
				offline.run();
			});

			it("outputs 1 when the value is equal to 0", function(done){
				var signal, eq0;
				var offline = new Offline();
				offline.before(function(dest){
					signal = new Signal(0);
					eq0 = new EqualZero();
					signal.connect(eq0);
					eq0.connect(dest);
				});
				offline.test(function(sample){
					expect(sample).to.equal(1);
				});
				offline.after(function(){
					signal.dispose();
					eq0.dispose();
					done();
				});
				offline.run();
			});

			it("outputs 0 when the value is slightly above 0", function(done){
				var signal, eq0;
				var offline = new Offline();
				offline.before(function(dest){
					signal = new Signal(0.001);
					eq0 = new EqualZero();
					signal.connect(eq0);
					eq0.connect(dest);
				});
				offline.test(function(sample){
					expect(sample).to.equal(0);
				});
				offline.after(function(){
					signal.dispose();
					eq0.dispose();
					done();
				});
				offline.run();
			});
		});
	});
});