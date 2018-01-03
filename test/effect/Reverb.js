define(["Tone/effect/Reverb", "helper/Basic", "helper/Offline",
	"Tone/source/Oscillator"],
function(Reverb, Basic, Offline, Oscillator) {

	describe("Reverb", function(){

		Basic(Reverb);

		context("API", function(){

			it("can pass in options in the constructor", function(){
				var reverb = new Reverb({
					"decay" : 2,
					"preDelay" : 0.1
				});
				expect(reverb.decay).to.be.closeTo(2, 0.001);
				expect(reverb.preDelay).to.be.closeTo(0.1, 0.001);
				reverb.dispose();
			});

			it("can get/set the options", function(){
				var reverb = new Reverb();
				reverb.set({
					"decay" : 0.4,
				});
				expect(reverb.get().decay).to.be.closeTo(0.4, 0.001);
				reverb.dispose();
			});

			it("can generate an IR", function(){
				var reverb = new Reverb();
				var promise = reverb.generate();
				expect(promise).to.be.instanceOf(Promise);
				return promise.then(function(){
					reverb.dispose();
				});
			});

			it("is silent before the reverb is generated", function(){
				return Offline(function(){
					var osc = new Oscillator();
					osc.start(0).stop(0.1);
					var reverb = new Reverb(0.2).toMaster();
					osc.connect(reverb);
				}).then(function(buffer){
					expect(buffer.isSilent()).to.be.true;
				});
			});

			it("passes audio from input to output", function(){
				return Offline(function(){
					var osc = new Oscillator();
					osc.start(0).stop(0.1);
					var reverb = new Reverb(0.2).toMaster();
					osc.connect(reverb);
					return reverb.generate();
				}, 0.3).then(function(buffer){
					expect(buffer.getRmsAtTime(0.05)).to.be.greaterThan(0.01);
					expect(buffer.getRmsAtTime(0.1)).to.be.greaterThan(0.001);
					expect(buffer.getRmsAtTime(0.2)).to.be.greaterThan(0.0001);
				});
			});
		});
	});
});
