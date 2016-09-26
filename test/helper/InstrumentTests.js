define(["helper/OutputAudio", "Tone/instrument/Instrument", "helper/OutputAudioStereo", 
	"Test", "helper/Offline", "helper/Meter"], 
	function (OutputAudio, Instrument, OutputAudioStereo, Test, Offline, Meter) {

	return function(Constr, note, constrArg){

		context("Instrument Tests", function(){

			it ("extends Tone.Instrument", function(){
				var instance = new Constr(constrArg);
				expect(instance).to.be.an.instanceof(Instrument);
				instance.dispose();
			});

			it ("can connect the output", function(){
				var instance = new Constr(constrArg);
				instance.connect(Test);
				instance.dispose();
			});

			it ("can set the volume", function(){
				var instance = new Constr({
					"volume" : -10
				});
				expect(instance.volume.value).to.be.closeTo(-10, 0.1);
				instance.dispose();
			});

			it("makes a sound", function(done){
				var instance;
				OutputAudio(function(dest){
					instance = new Constr(constrArg);
					instance.connect(dest);
					instance.triggerAttack(note);
				}, function(){
					instance.dispose();
					done();
				});
			});	

			it("produces sound in both channels", function(done){
				var instance;
				OutputAudioStereo(function(dest){
					instance = new Constr(constrArg);
					instance.connect(dest);
					instance.triggerAttack(note);
				}, function(){
					instance.dispose();
					done();
				});
			});	

			it("is silent before being triggered", function(done){
				var instance;
				var meter = new Meter(0.3);
				meter.before(function(dest){
					instance = new Constr(constrArg);
					instance.connect(dest);
				});
				meter.test(function(level){
					expect(level).to.equal(0);
				});
				meter.after(function(){
					instance.dispose();
					done();
				});
				meter.run();
			});	

			it("be scheduled to start in the future", function(done){
				var instance;
				var meter = new Meter(0.3);
				meter.before(function(dest){
					instance = new Constr(constrArg);
					instance.connect(dest);
					if (note){
						instance.triggerAttack(note, 0.1);
					} else {
						instance.triggerAttack(0.1);
					}
				});
				meter.test(function(sample, time){
					if (sample > 0.2){
						expect(time).to.be.at.least(0.1);
					}
				});
				meter.after(function(){
					instance.dispose();
					done();
				});
				meter.run();
			});

		});

	};
});