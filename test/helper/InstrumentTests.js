import OutputAudio from "helper/OutputAudio";
import Instrument from "Tone/instrument/Instrument";
import OutputAudioStereo from "helper/OutputAudioStereo";
import Test from "helper/Test";
import Offline from "helper/Offline";
import Tone from "Tone/core/Tone";
import Meter from "helper/Meter";

export default function(Constr, note, constrArg, optionsIndex){

	context("Instrument Tests", function(){

		it("extends Tone.Instrument", function(){
			var instance = new Constr(constrArg);
			expect(instance).to.be.an.instanceof(Instrument);
			instance.dispose();
		});

		it("can connect the output", function(){
			var instance = new Constr(constrArg);
			instance.connect(Test);
			instance.dispose();
		});

		it("can set the volume", function(){
			if (!optionsIndex){
				var instance = new Constr({
					"volume" : -10
				});
			} else if (optionsIndex === 1){
				var instance = new Constr(constrArg, {
					"volume" : -10
				});
			}
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

		if (Constr.prototype.triggerRelease){

			it("can trigger release after attack", function(){
				return Offline(function(){
					var instance = new Constr(constrArg);
					instance.toMaster();
					if (note){
						instance.triggerAttack(note, 0.05);
					} else {
						instance.triggerAttack(0.05);
					}
					instance.triggerRelease(0.1);
				}, 1).then(function(buffer){
					expect(buffer.getFirstSoundTime()).to.be.within(0.05, 0.1);
				});
			});

			it("can trigger another attack before the release has ended", function(){
				//compute the end time
				return Offline(function(){
					var instance = new Constr(constrArg);
					instance.toMaster();
					if (note){
						instance.triggerAttack(note, 0.05);
					} else {
						instance.triggerAttack(0.05);
					}
					instance.triggerRelease(0.1);
				}, 1).then(function(buffer){
					return buffer.getLastSoundTime();
				}).then(function(bufferDuration){
					var secondTrigger = 0.15;
					return Offline(function(){
						var instance = new Constr(constrArg);
						instance.toMaster();
						if (note){
							instance.triggerAttack(note, 0.05);
						} else {
							instance.triggerAttack(0.05);
						}
						instance.triggerRelease(0.1);
						//star the note again before the last one has finished
						if (note){
							instance.triggerAttack(note, secondTrigger);
						} else {
							instance.triggerAttack(secondTrigger);
						}
					}, bufferDuration + secondTrigger * 2).then(function(buffer){
						expect(buffer.getLastSoundTime()).to.be.gt(bufferDuration);
					});
				});
			});

			it("can combine triggerAttack and triggerRelease", function(){
				return Offline(function(){
					var instance = new Constr(constrArg);
					instance.toMaster();
					if (note){
						instance.triggerAttackRelease(note, 0.1, 0.05);
					} else {
						instance.triggerAttackRelease(0.1, 0.05);
					}
				}, 0.2).then(function(buffer){
					expect(buffer.getFirstSoundTime()).to.be.within(0.05, 0.1);
				});
			});
		}

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

		it("can sync triggerAttack to the Transport", function(){
			return Offline(function(Transport){
				var instance = new Constr(constrArg);
				instance.toMaster();
				instance.sync();
				if (note){
					instance.triggerAttack(note, 0.1);
				} else {
					instance.triggerAttack(0.1);
				}
				Transport.start(0.1);
			}, 0.3).then(function(buffer){
				expect(buffer.getFirstSoundTime()).to.be.within(0.19, 0.25);
			});
		});

		it("can unsync triggerAttack to the Transport", function(){
			return Offline(function(Transport){
				var instance = new Constr(constrArg);
				instance.toMaster();
				instance.sync();
				if (note){
					instance.triggerAttack(note, 0.1);
				} else {
					instance.triggerAttack(0.1);
				}
				instance.unsync();
				Transport.start(0.1);
			}, 0.3).then(function(buffer){
				expect(buffer.isSilent()).to.be.true;
			});
		});

		it("can sync triggerAttackRelease to the Transport", function(){
			return Offline(function(Transport){
				var instance = new Constr(constrArg);
				instance.toMaster();
				instance.sync();
				if (note){
					instance.triggerAttackRelease(note, 0.25, 0.1);
				} else {
					instance.triggerAttackRelease(0.25, 0.1);
				}
				Transport.start(0.1);
			}, 1).then(function(buffer){
				expect(buffer.getFirstSoundTime()).to.be.within(0.19, 0.25);
				//test a sample enough in the future for the decay to die down
				var endSample = Math.floor(0.9 * Tone.context.sampleRate);
				expect(buffer.getRMS()[endSample]).to.be.closeTo(0, 0.1);
			});
		});

	});

}

