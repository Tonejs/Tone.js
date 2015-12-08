define(["helper/OutputAudio", "Tone/effect/Effect", "helper/PassAudio", 
	"helper/PassAudioStereo", "Test", "helper/Offline", "Tone/signal/Signal", "Tone/component/Merge"], 
	function (OutputAudio, Effect, PassAudio, PassAudioStereo, Test, Offline, Signal, Merge) {

	return function(Constr, args, before){


		context("Effect Tests", function(){

			it ("extends Tone.Effect", function(){
				var instance = new Constr(args);
				expect(instance).to.be.an.instanceof(Effect);
				instance.dispose();
			});

			it ("has an input and output", function(){
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

			it("passes audio from input to output", function(done){
				var instance;
				PassAudio(function(input, dest){
					instance = new Constr(args);
					if (before){
						before(instance);
					}
					input.connect(instance);
					instance.connect(dest);
				}, function(){
					instance.dispose();
					done();
				});
			});	

			it("passes audio in both channels", function(done){
				var instance;
				PassAudioStereo(function(input, dest){
					instance = new Constr(args);
					if (before){
						before(instance);
					}
					input.connect(instance);
					instance.connect(dest);
				}, function(){
					instance.dispose();
					done();
				});
			});	

			it("can pass 100% dry signal", function(done){
				var signalL, signalR, merge, instance;
				var offline = new Offline(1, 2);
				offline.before(function(dest){
					instance = new Constr(args).connect(dest);
					if (before){
						before(instance);
					}
					merge = new Merge().connect(instance);
					signalL = new Signal(-1).connect(merge.left);
					signalR = new Signal(1).connect(merge.right);
					//make the signals ramp
					signalL.linearRampToValue(1, 1);
					signalR.linearRampToValue(-1, 1);
					instance.wet.value = 0;
				});
				offline.test(function(samples, time){
					var leftValue = (time * 2) - 1;
					var rightValue = ((1 - time) * 2) - 1;
					expect(samples[0]).to.be.closeTo(leftValue, 0.001);
					expect(samples[1]).to.be.closeTo(rightValue, 0.001);
				});
				offline.after(function(){
					signalL.dispose();
					signalR.dispose();
					merge.dispose();
					instance.dispose();
					done();
				});
				offline.run();
			});	

			it("effects the incoming signal", function(done){
				var signalL, signalR, merge, instance;
				var offline = new Offline(1, 2);
				var leftEffected = false;
				var rightEffected = false;
				offline.before(function(dest){
					instance = new Constr(args).connect(dest);
					if (before){
						before(instance);
					}
					merge = new Merge().connect(instance);
					signalL = new Signal(-1).connect(merge.left);
					signalR = new Signal(1).connect(merge.right);
					//make the signals ramp
					signalL.linearRampToValue(1, 1);
					signalR.linearRampToValue(-1, 1);
					if (instance.start){
						instance.start();
					}
				});
				offline.test(function(samples, time){
					var leftValue = (time * 2) - 1;
					var rightValue = ((1 - time) * 2) - 1;
					if (Math.abs(samples[0] - leftValue) > 0.01){
						leftEffected = true;
					}
					if (Math.abs(samples[1] - rightValue) > 0.01){
						rightEffected = true;	
					}
				});
				offline.after(function(){
					expect(leftEffected).to.be.true;
					expect(rightEffected).to.be.true;
					signalL.dispose();
					signalR.dispose();
					merge.dispose();
					instance.dispose();
					done();
				});
				offline.run();
			});	
		});

	};
});