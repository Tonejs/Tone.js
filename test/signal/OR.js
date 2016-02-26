define(["helper/Offline", "helper/Basic", "Tone/signal/OR", "Tone/signal/Signal"], 
function (Offline, Basic, OR, Signal) {

	describe("OR", function(){

		Basic(OR);

		describe("Logic", function(){

			it("outputs 1 when both inputs are 1", function(done){
				var signal0, signal1, or;
				var offline = new Offline();
				offline.before(function(dest){
					signal0 = new Signal(1);
					signal1 = new Signal(1);
					or = new OR(2);
					signal0.connect(or, 0, 0);
					signal1.connect(or, 0, 1);
					or.connect(dest);
				});
				offline.test(function(sample){
					expect(sample).to.equal(1);
				});
				offline.after(function(){
					signal0.dispose();
					signal1.dispose();
					or.dispose();
					done();
				});
				offline.run();
			});

			it("outputs 1 when only one input is 1", function(done){
				var signal0, signal1, or;
				var offline = new Offline();
				offline.before(function(dest){
					signal0 = new Signal(1);
					signal1 = new Signal(0);
					or = new OR(2);
					signal0.connect(or, 0, 0);
					signal1.connect(or, 0, 1);
					or.connect(dest);
				});
				offline.test(function(sample){
					expect(sample).to.equal(1);
				});
				offline.after(function(){
					signal0.dispose();
					signal1.dispose();
					or.dispose();
					done();
				});
				offline.run();
			});

			it("outputs 0 when both the inputs are 0", function(done){
				var signal0, signal1, or;
				var offline = new Offline();
				offline.before(function(dest){
					signal0 = new Signal(0);
					signal1 = new Signal(0);
					or = new OR(2);
					signal0.connect(or, 0, 0);
					signal1.connect(or, 0, 1);
					or.connect(dest);
				});
				offline.test(function(sample){
					expect(sample).to.equal(0);
				});
				offline.after(function(){
					signal0.dispose();
					signal1.dispose();
					or.dispose();
					done();
				});
				offline.run();
			});

			it("works with three signals", function(done){
				var signal0, signal1, signal2, or;
				var offline = new Offline();
				offline.before(function(dest){
					signal0 = new Signal(0);
					signal1 = new Signal(0);
					signal2 = new Signal(1);
					or = new OR(3);
					signal0.connect(or, 0, 0);
					signal1.connect(or, 0, 1);
					signal2.connect(or, 0, 2);
					or.connect(dest);
				});
				offline.test(function(sample){
					expect(sample).to.equal(1);
				});
				offline.after(function(){
					signal0.dispose();
					signal1.dispose();
					signal2.dispose();
					or.dispose();
					done();
				});
				offline.run();
			});
		});
	});
});