define(["helper/Offline", "helper/Basic", "Tone/signal/Equal", "Tone/signal/Signal", "Test"], 
function (Offline, Basic, Equal, Signal, Test) {
	describe("Equal", function(){

		Basic(Equal);

		context("Comparison", function(){

			it("handles input and output connections", function(){
				var eq = new Equal();
				Test.connect(eq);
				Test.connect(eq, 0);
				Test.connect(eq, 1);
				eq.connect(Test);
				eq.dispose();
			});

			it("outputs 0 when values are not equal", function(done){
				var signal, eq;
				var offline = new Offline();
				offline.before(function(dest){
					signal = new Signal(1);
					eq = new Equal(3);
					signal.connect(eq);
					eq.connect(dest);
				});
				offline.test(function(sample){
					expect(sample).to.equal(0);
				});
				offline.after(function(){
					signal.dispose();
					eq.dispose();
					done();
				});
				offline.run();
			});

			it("outputs 1 when values are equal", function(done){
				var signal, eq;
				var offline = new Offline();
				offline.before(function(dest){
					signal = new Signal(40);
					eq = new Equal(40);
					signal.connect(eq);
					eq.connect(dest);
				});
				offline.test(function(sample){
					expect(sample).to.equal(1);
				});
				offline.after(function(){
					signal.dispose();
					eq.dispose();
					done();
				});
				offline.run();
			});

			it("can handle negative values", function(done){
				var signal, eq;
				var offline = new Offline();
				offline.before(function(dest){
					signal = new Signal(-1);
					eq = new Equal(-1);
					signal.connect(eq);
					eq.connect(dest);
				});
				offline.test(function(sample){
					expect(sample).to.equal(1);
				});
				offline.after(function(){
					signal.dispose();
					eq.dispose();
					done();
				});
				offline.run();
			});

			it("can set a new value", function(done){
				var signal, eq;
				var offline = new Offline();
				offline.before(function(dest){
					signal = new Signal(2);
					eq = new Equal(-100);
					eq.value = 2;
					signal.connect(eq);
					eq.connect(dest);
				});
				offline.test(function(sample){
					expect(sample).to.equal(1);
				});
				offline.after(function(){
					signal.dispose();
					eq.dispose();
					done();
				});
				offline.run();
			});

			it("can compare unequal signals", function(done){
				var sigA, sigB, eq;
				var offline = new Offline();
				offline.before(function(dest){
					sigA = new Signal(1);
					sigB = new Signal(4);
					eq = new Equal();
					sigA.connect(eq, 0, 0);
					sigB.connect(eq, 0, 1);
					eq.connect(dest);
				});
				offline.test(function(sample){
					expect(sample).to.equal(0);
				});
				offline.after(function(){
					sigA.dispose();
					sigB.dispose();
					eq.dispose();
					done();
				});
				offline.run();
			});

			it("can compare equal signals", function(done){
				var sigA, sigB, eq;
				var offline = new Offline();
				offline.before(function(dest){
					sigA = new Signal(12.01);
					sigB = new Signal(12.01);
					eq = new Equal();
					sigA.connect(eq, 0, 0);
					sigB.connect(eq, 0, 1);
					eq.connect(dest);
				});
				offline.test(function(sample){
					expect(sample).to.equal(1);
				});
				offline.after(function(){
					sigA.dispose();
					sigB.dispose();
					eq.dispose();
					done();
				});
				offline.run();
			});
		});
	});
});