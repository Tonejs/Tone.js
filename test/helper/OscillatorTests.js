define(["helper/OutputAudio", "Tone/source/Oscillator", "helper/Offline", "Test", "helper/Meter"], 
	function (OutputAudio, Oscillator, Offline, Test, Meter) {

	return function(Constr, args){

		context("Oscillator Tests", function(){

			it ("extends Tone.Oscillator", function(){
				var instance = new Constr(args);
				expect(instance).to.be.an.instanceof(Oscillator);
				instance.dispose();
			});

			it("can be created with an options object", function(){
				var instance = new Constr({
					"frequency" : 200,
					"detune" : -20
				});
				expect(instance.frequency.value).to.equal(200);
				expect(instance.detune.value).to.equal(-20);
				instance.dispose();
			});

			it("can set/set the frequency", function(){
				var instance = new Constr(args);
				instance.frequency.value = 110;
				expect(instance.frequency.value).to.equal(110);
				instance.start();
				instance.frequency.value = 220;
				expect(instance.frequency.value).to.equal(220);
				instance.dispose();
			});

			it("can set/set the detune", function(){
				var instance = new Constr(args);
				instance.detune.value = -50;
				expect(instance.detune.value).to.equal(-50);
				instance.start();
				instance.detune.value = 92;
				expect(instance.detune.value).to.equal(92);
				instance.dispose();
			});

			it("can connect to detune and frequency", function(){
				var instance = new Constr(args);
				Test.connect(instance.frequency);
				Test.connect(instance.detune);
				instance.dispose();
			});

			it ("can get/set the phase", function(){
				var osc = new Constr({
					"phase" : 180,
				});
				expect(osc.phase).to.be.closeTo(180, 0.001);
				osc.dispose();
			});

			it ("does not clip in volume", function(done){
				var osc;
				var meter = new Meter(0.2);
				meter.before(function(dest){
					osc = new Constr(args).connect(dest).start(0);
				});
				meter.test(function(level){
					if (level > 1){
						throw new Error("audio clipped with level "+level);
					}
				});
				meter.after(function(){
					osc.dispose();
					done();
				});
				meter.run();
			});
			
		});

	};
});