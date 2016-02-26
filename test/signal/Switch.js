define(["helper/Offline", "helper/Basic", "Tone/signal/Switch", "Tone/signal/Signal", "Test"], 
function (Offline, Basic, Switch, Signal, Test) {

	describe("Switch", function(){

		Basic(Switch);

		describe("Switching Logic", function(){

			it ("handles input and output connections", function(){
				var gate = new Switch();
				gate.connect(Test);
				Test.connect(gate);
				Test.connect(gate.gate);
				gate.dispose();
			});

			it("is closed by default", function(done){
				var signal, gate;
				var offline = new Offline();
				offline.before(function(dest){
					signal = new Signal(10);
					gate = new Switch();
					signal.connect(gate);
					gate.connect(dest);
				});
				offline.test(function(sample){
					expect(sample).to.equal(0);
				});
				offline.after(function(){
					signal.dispose();
					gate.dispose();
					done();
				});
				offline.run();
			});

			it("can be opened", function(done){
				var signal, gate;
				var offline = new Offline();
				offline.before(function(dest){
					signal = new Signal(10);
					gate = new Switch();
					signal.connect(gate);
					gate.connect(dest);
					gate.open();
				});
				offline.test(function(sample){
					expect(sample).to.equal(10);
				});
				offline.after(function(){
					signal.dispose();
					gate.dispose();
					done();
				});
				offline.run();
			});

			it("can be scheduled to close", function(done){
				var signal, gate;
				var offline = new Offline();
				offline.before(function(dest){
					signal = new Signal(10);
					gate = new Switch();
					signal.connect(gate);
					gate.connect(dest);
					gate.open();
					gate.close(0.4);
				});
				offline.test(function(sample, time){
					if (time >= 0.4){
						expect(sample).to.equal(0);
					} else {
						expect(sample).to.equal(10);
					}
				});
				offline.after(function(){
					signal.dispose();
					gate.dispose();
					done();
				});
				offline.run();
			});
		});
	});
});