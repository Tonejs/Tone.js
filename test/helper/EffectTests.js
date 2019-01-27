import OutputAudio from "helper/OutputAudio";
import Effect from "Tone/effect/Effect";
import PassAudio from "helper/PassAudio";
import PassAudioStereo from "helper/PassAudioStereo";
import Test from "helper/Test";
import Offline from "helper/Offline";
import Signal from "Tone/signal/Signal";
import Merge from "Tone/component/Merge";

export default function(Constr, args, before){

	context("Effect Tests", function(){

		it("extends Tone.Effect", function(){
			var instance = new Constr(args);
			expect(instance).to.be.an.instanceof(Effect);
			instance.dispose();
		});

		it("has an input and output", function(){
			var instance = new Constr(args);
			if (before){
				before(instance);
			}
			instance.connect(Test);
			Test.connect(instance);
			instance.dispose();
		});

		it("can set the dry/wet value", function(){
			var instance = new Constr(args);
			if (before){
				before(instance);
			}
			instance.wet.value = 0;
			expect(instance.wet.value).to.equal(0);
			instance.wet.value = 0.5;
			expect(instance.wet.value).to.equal(0.5);
			instance.dispose();
		});

		it("can be constructed with an object", function(){
			var instance = new Constr({
				"wet" : "0.25"
			});
			if (before){
				before(instance);
			}
			expect(instance.wet.value).to.equal(0.25);
			instance.dispose();
		});

		it("passes audio from input to output", function(){
			return PassAudio(function(input){
				var instance = new Constr(args);
				if (before){
					before(instance);
				}
				input.connect(instance);
				instance.toMaster();
			});
		});

		it("passes audio in both channels", function(){
			return PassAudioStereo(function(input){
				var instance = new Constr(args);
				if (before){
					before(instance);
				}
				input.connect(instance);
				instance.toMaster();
			});
		});

		it("can pass 100% dry signal", function(){
			return Offline(function(){
				var instance = new Constr(args).toMaster();
				if (before){
					before(instance);
				}
				var merge = new Merge().connect(instance);
				var signalL = new Signal(-1).connect(merge.left);
				var signalR = new Signal(1).connect(merge.right);
				//make the signals ramp
				signalL.linearRampTo(1, 1);
				signalR.linearRampTo(-1, 1);
				instance.wet.value = 0;
			}, 0.5, 2).then(function(buffer){
				buffer.forEach(function(L, R, time){
					var leftValue = (time * 2) - 1;
					var rightValue = ((1 - time) * 2) - 1;
					expect(L).to.be.closeTo(leftValue, 0.001);
					expect(R).to.be.closeTo(rightValue, 0.001);
				});
			});
		});

		it("effects the incoming signal", function(){
			return Offline(function(){
				var instance = new Constr(args).toMaster();
				if (before){
					before(instance);
				}
				var merge = new Merge().connect(instance);
				var signalL = new Signal(-1).connect(merge.left);
				var signalR = new Signal(1).connect(merge.right);
				//make the signals ramp
				signalL.linearRampTo(1, 1);
				signalR.linearRampTo(-1, 1);
				if (instance.start){
					instance.start();
				}
			}, 0.5, 2).then(function(buffer){
				var leftEffected = false;
				var rightEffected = false;
				buffer.forEach(function(L, R, time){
					var leftValue = (time * 2) - 1;
					var rightValue = ((1 - time) * 2) - 1;
					if (Math.abs(L - leftValue) > 0.01){
						leftEffected = true;
					}
					if (Math.abs(R - rightValue) > 0.01){
						rightEffected = true;
					}
				});
				expect(leftEffected).to.be.true;
				expect(rightEffected).to.be.true;
			});
		});
	});

}

