define(["helper/Offline", "helper/Basic", "Tone/signal/NOT", "Tone/signal/Signal"], 
function (Offline, Basic, NOT, Signal) {

	describe("NOT", function(){

		Basic(NOT);

		describe("Logic", function(){

			it("outputs 0 when the input is 1", function(done){
				var signal, not;
				var offline = new Offline();
				offline.before(function(dest){
					signal = new Signal(1);
					not = new NOT();
					signal.connect(not);
					not.connect(dest);
				});
				offline.test(function(sample){
					expect(sample).to.equal(0);
				});
				offline.after(function(){
					signal.dispose();
					not.dispose();
					done();
				});
				offline.run();
			});

			it("outputs 1 when the input is 0", function(done){
				var signal, not;
				var offline = new Offline();
				offline.before(function(dest){
					signal = new Signal(0);
					not = new NOT();
					signal.connect(not);
					not.connect(dest);
				});
				offline.test(function(sample){
					expect(sample).to.equal(1);
				});
				offline.after(function(){
					signal.dispose();
					not.dispose();
					done();
				});
				offline.run();
			});
		});
	});
});