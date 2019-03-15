import OutputAudio from "helper/OutputAudio";
import Source from "Tone/source/Source";
import OutputAudioStereo from "helper/OutputAudioStereo";
import Test from "helper/Test";
import Offline from "helper/Offline";
import APITest from "helper/APITest";

export default function(Constr, args){

	context("Source Tests", function(){

		it("extends Tone.Source", function(){
			var instance = new Constr(args);
			expect(instance).to.be.an.instanceof(Source);
			instance.dispose();
		});

		it("can connect the output", function(){
			var instance = new Constr(args);
			instance.connect(Test);
			instance.dispose();
		});

		it("starts and stops", function(){
			return Offline(function(){
				var instance = new Constr(args);
				expect(instance.state).to.equal("stopped");
				instance.start(0).stop(0.2);
				return function(time){
					if (time >= 0 && time < 0.2){
						expect(instance.state).to.equal("started");
					} else if (time > 0.2){
						expect(instance.state).to.equal("stopped");
					}
				};
			}, 0.3);
		});

		it("makes a sound", function(){
			return OutputAudio(function(){
				var instance = new Constr(args);
				instance.toMaster();
				instance.start();
			});
		});	

		it("produces sound in both channels", function(){
			return OutputAudioStereo(function(){
				var instance = new Constr(args);
				instance.toMaster();
				instance.start();
			});
		});	

		it("be scheduled to start in the future", function(){
			return Offline(function(){
				var instance = new Constr(args).toMaster();
				instance.start(0.1);
			}, 0.3).then(function(buffer){
				buffer.forEach(function(sample, time){
					if (sample > 0){
						expect(time).to.be.at.least(0.099);
					}
				});
			});
		});

		it("makes no sound if it is started and then stopped with a time at or before the start time", function(){
			return Offline(function(){
				var instance = new Constr(args).toMaster();
				instance.start(0.1).stop(0.05);
			}, 0.3).then(function(buffer){
				expect(buffer.isSilent()).to.be.true;
			});
		});

		it("can be muted", function(){
			return Offline(function(){
				var instance = new Constr(args).toMaster();
				instance.start(0);
				instance.mute = true;
			}, 0.3).then(function(buffer){
				expect(buffer.isSilent()).to.be.true;
			});
		});

		it("be scheduled to stop in the future", function(){
			return Offline(function(){
				var instance = new Constr(args).toMaster();
				instance.start(0).stop(0.2);
			}, 0.3).then(function(buffer){
				buffer.forEach(function(sample, time){
					if (time > 0.2){
						expect(sample).to.equal(0);
					}
				});
			});
		});

		it("can be restarted", function(){
			return Offline(function(){
				var instance = new Constr(args).toMaster();
				instance.start(0).stop(0.2);
				instance.restart(0.1);
				instance.stop(0.25);
			}, 0.32).then(function(buffer){
				expect(buffer.getRmsAtTime(0)).to.be.gt(0);
				expect(buffer.getRmsAtTime(0.1)).to.be.gt(0);
				expect(buffer.getRmsAtTime(0.2)).to.be.gt(0);
				expect(buffer.getRmsAtTime(0.23)).to.be.gt(0);
				expect(buffer.getRmsAtTime(0.3)).to.equal(0);
			});
		});

	});

	context("Source API", function(){
		APITest.method(Constr, "start", ["Time=", "Time=", "Time="], args);
		APITest.method(Constr, "stop", ["Time="], args);
	});

}

