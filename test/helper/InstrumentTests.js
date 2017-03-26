define(["helper/OutputAudio", "Tone/instrument/Instrument", "helper/OutputAudioStereo", 
	"Test", "helper/Offline"], 
	function (OutputAudio, Instrument, OutputAudioStereo, Test, Offline) {

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

			it("makes a sound", function(){
				return OutputAudio(function(){
					var instance = new Constr(constrArg);
					instance.toMaster();
					instance.triggerAttack(note);
				});
			});	

			it("produces sound in both channels", function(){
				return OutputAudioStereo(function(){
					var instance = new Constr(constrArg);
					instance.toMaster();
					instance.triggerAttack(note);
				});
			});	

			it("is silent before being triggered", function(){
				return Offline(function(){
					var instance = new Constr(constrArg);
					instance.toMaster();
				}).then(function(buffer){
					expect(buffer.isSilent()).to.be.true;
				});
			});	

			it("be scheduled to start in the future", function(){
				return Offline(function(){
					var instance = new Constr(constrArg);
					instance.toMaster();
					if (note){
						instance.triggerAttack(note, 0.1);
					} else {
						instance.triggerAttack(0.1);
					}
				}, 0.2).then(function(buffer){
					expect(buffer.getFirstSoundTime()).to.be.within(0.1, 0.15);
				});
			});

		});

	};
});