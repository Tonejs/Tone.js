define(["helper/Offline", "helper/Basic", "Tone/signal/Select", "Tone/signal/Signal", "Test"], 
function (Offline, Basic, Select, Signal, Test) {

	describe("Select", function(){

		Basic(Select);

		describe("Selecting Logic", function(){

			it ("handles input and output connections", function(){
				var sel = new Select();
				sel.connect(Test);
				Test.connect(sel);
				Test.connect(sel.gate);
				sel.dispose();
			});

			it("can select the first input", function(done){
				var sigA, sigB, sel;
				var offline = new Offline();
				offline.before(function(dest){
					sigA = new Signal(3);
					sigB = new Signal(4);
					sel = new Select().connect(dest);
					sigA.connect(sel, 0, 0);
					sigB.connect(sel, 0, 1);
					sel.select(0);
				});
				offline.test(function(sample){
					expect(sample).to.equal(3);
				});
				offline.after(function(){
					sigA.dispose();
					sigB.dispose();
					sel.dispose();
					done();
				});
				offline.run();
			});

			it("can select the second input", function(done){
				var sigA, sigB, sel;
				var offline = new Offline();
				offline.before(function(dest){
					sigA = new Signal(3);
					sigB = new Signal(4);
					sel = new Select().connect(dest);
					sigA.connect(sel, 0, 0);
					sigB.connect(sel, 0, 1);
					sel.select(1);
				});
				offline.test(function(sample){
					expect(sample).to.equal(4);
				});
				offline.after(function(){
					sigA.dispose();
					sigB.dispose();
					sel.dispose();
					done();
				});
				offline.run();
			});

			it("can select between 3 inputs", function(done){
				var sigA, sigB, sigC, sel;
				var offline = new Offline();
				offline.before(function(dest){
					sigA = new Signal(3);
					sigB = new Signal(4);
					sigC = new Signal(5);
					sel = new Select(3).connect(dest);
					sigA.connect(sel, 0, 0);
					sigB.connect(sel, 0, 1);
					sigC.connect(sel, 0, 2);
					sel.select(2);
				});
				offline.test(function(sample){
					expect(sample).to.equal(5);
				});
				offline.after(function(){
					sigA.dispose();
					sigB.dispose();
					sigC.dispose();
					sel.dispose();
					done();
				});
				offline.run();
			});

		});
	});
});