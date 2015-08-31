define(["helper/Offline", "helper/Basic", "Tone/signal/AND", "Tone/signal/Signal"], 
function (Offline, Basic, AND, Signal) {

	describe("AND", function(){

		Basic(AND);

		describe("Logic", function(){

			it("outputs 1 when both inputs are 1", function(done){
				var signal0, signal1, and;
				var offline = new Offline();
				offline.before(function(dest){
					signal0 = new Signal(1);
					signal1 = new Signal(1);
					and = new AND(2);
					signal0.connect(and, 0, 0);
					signal1.connect(and, 0, 1);
					and.connect(dest);
				});
				offline.test(function(sample){
					expect(sample).to.equal(1);
				});
				offline.after(function(){
					signal0.dispose();
					signal1.dispose();
					and.dispose();
					done();
				});
				offline.run();
			});

			it("outputs 0 when only one input is 1", function(done){
				var signal0, signal1, and;
				var offline = new Offline();
				offline.before(function(dest){
					signal0 = new Signal(1);
					signal1 = new Signal(0);
					and = new AND(2);
					signal0.connect(and);
					signal1.connect(and);
					and.connect(dest);
				});
				offline.test(function(sample){
					expect(sample).to.equal(0);
				});
				offline.after(function(){
					signal0.dispose();
					signal1.dispose();
					and.dispose();
					done();
				});
				offline.run();
			});

			it("outputs 0 when only the inputs are 0", function(done){
				var signal0, signal1, and;
				var offline = new Offline();
				offline.before(function(dest){
					signal0 = new Signal(0);
					signal1 = new Signal(0);
					and = new AND(2);
					signal0.connect(and);
					signal1.connect(and);
					and.connect(dest);
				});
				offline.test(function(sample){
					expect(sample).to.equal(0);
				});
				offline.after(function(){
					signal0.dispose();
					signal1.dispose();
					and.dispose();
					done();
				});
				offline.run();
			});

			it("works with three signals", function(done){
				var signal0, signal1, signal2, and;
				var offline = new Offline();
				offline.before(function(dest){
					signal0 = new Signal(1);
					signal1 = new Signal(1);
					signal2 = new Signal(1);
					and = new AND(3);
					signal0.connect(and);
					signal1.connect(and);
					signal2.connect(and);
					and.connect(dest);
				});
				offline.test(function(sample){
					expect(sample).to.equal(1);
				});
				offline.after(function(){
					signal0.dispose();
					signal1.dispose();
					signal2.dispose();
					and.dispose();
					done();
				});
				offline.run();
			});
		});
	});
});