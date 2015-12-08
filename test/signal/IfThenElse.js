define(["helper/Offline", "helper/Basic", "Tone/signal/IfThenElse", "Tone/signal/Signal", "Test"], 
function (Offline, Basic, IfThenElse, Signal, Test) {

	describe("IfThenElse", function(){

		Basic(IfThenElse);

		describe("Conditional", function(){

			it ("handles input and output connections", function(){
				var ite = new IfThenElse();
				ite.connect(Test);
				Test.connect(ite);
				Test.connect(ite.if);
				Test.connect(ite.then);
				Test.connect(ite.else);
				ite.dispose();
			});

			it("selects the second input (then) when input 0 (if) is 1", function(done){
				var ifSignal, thenSignal, elseSignal, ite;
				var offline = new Offline();
				offline.before(function(dest){
					ifSignal = new Signal(1);
					thenSignal = new Signal(10);
					elseSignal = new Signal(20);
					ite = new IfThenElse();
					ifSignal.connect(ite, 0, 0);
					thenSignal.connect(ite, 0, 1);
					elseSignal.connect(ite, 0, 2);
					ite.connect(dest);
				});
				offline.test(function(sample){
					expect(sample).to.equal(10);
				});
				offline.after(function(){
					ifSignal.dispose();
					thenSignal.dispose();
					elseSignal.dispose();
					ite.dispose();
					done();
				});
				offline.run();
			});

			it("selects the third input (else) when input 0 (if) is 0", function(done){
				var ifSignal, thenSignal, elseSignal, ite;
				var offline = new Offline();
				offline.before(function(dest){
					ifSignal = new Signal(0);
					thenSignal = new Signal(10);
					elseSignal = new Signal(20);
					ite = new IfThenElse();
					ifSignal.connect(ite, 0, 0);
					thenSignal.connect(ite, 0, 1);
					elseSignal.connect(ite, 0, 2);
					ite.connect(dest);
				});
				offline.test(function(sample){
					expect(sample).to.equal(20);
				});
				offline.after(function(){
					ifSignal.dispose();
					thenSignal.dispose();
					elseSignal.dispose();
					ite.dispose();
					done();
				});
				offline.run();
			});

			it("changes output when the if signal changes", function(done){
				var ifSignal, thenSignal, elseSignal, ite;
				var offline = new Offline(0.5);
				offline.before(function(dest){
					ifSignal = new Signal(0);
					thenSignal = new Signal(5);
					elseSignal = new Signal(15);
					ite = new IfThenElse();
					ifSignal.connect(ite, 0, 0);
					thenSignal.connect(ite, 0, 1);
					elseSignal.connect(ite, 0, 2);
					ite.connect(dest);
					ifSignal.setValueAtTime(1, 0.2);
				});
				offline.test(function(sample, time){
					if (time >= 0.2){
						expect(sample).to.equal(5);
					} else {
						expect(sample).to.equal(15);
					}
				});
				offline.after(function(){
					ifSignal.dispose();
					thenSignal.dispose();
					elseSignal.dispose();
					ite.dispose();
					done();
				});
				offline.run();
			});
		});
	});
});