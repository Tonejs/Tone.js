define(["helper/OutputAudio", "Tone/source/Source", "helper/OutputAudioStereo", 
	"Test", "helper/Offline2", "helper/Meter", "helper/APITest"], 
	function (OutputAudio, Source, OutputAudioStereo, Test, Offline, Meter, APITest) {

	return function(Constr, args){

		context("Source Tests", function(){

			it ("extends Tone.Source", function(){
				var instance = new Constr(args);
				expect(instance).to.be.an.instanceof(Source);
				instance.dispose();
			});

			it ("can connect the output", function(){
				var instance = new Constr(args);
				instance.connect(Test);
				instance.dispose();
			});

			it("starts and stops", function(done){

				Offline(function(output, testFn, tearDown){
					
					var instance = new Constr(args);
					expect(instance.state).to.equal("stopped");
					instance.start(0).stop(0.2);

					testFn(function(sample, time){
						if (time >= 0 && time < 0.2){
							expect(instance.state).to.equal("started");
						} else if (time > 0.2){
							expect(instance.state).to.equal("stopped");
						}
					});

					tearDown(function(){
						instance.dispose();
						done();
					});
				}, 0.3);
			});

			it("makes a sound", function(done){
				var instance;
				OutputAudio(function(dest){
					instance = new Constr(args);
					instance.connect(dest);
					instance.start();
				}, function(){
					instance.dispose();
					done();
				});
			});	

			it("produces sound in both channels", function(done){
				var instance;
				OutputAudioStereo(function(dest){
					instance = new Constr(args);
					instance.connect(dest);
					instance.start();
				}, function(){
					instance.dispose();
					done();
				});
			});	

			it("be scheduled to start in the future", function(done){
				var instance;
				var meter = new Meter(0.3);
				meter.before(function(dest){
					instance = new Constr(args);
					instance.connect(dest);
					instance.start(0.1);
				});
				meter.test(function(sample, time){
					if (sample > 0){
						expect(time).to.be.at.least(0.1);
					}
				});
				meter.after(function(){
					instance.dispose();
					done();
				});
				meter.run();
			});

			it("makes no sound if it is started and then stopped with a time at or before the start time", function(done){
				var instance;
				var meter = new Meter(1);
				meter.before(function(dest){
					instance = new Constr(args);
					instance.connect(dest);
					instance.start(0.5).stop(0);
				});
				meter.test(function(sample){
					expect(sample).to.equal(0);
				});
				meter.after(function(){
					instance.dispose();
					done();
				});
				meter.run();
			});

			it("can be muted", function(done){
				var instance;
				var meter = new Meter(0.25);
				meter.before(function(dest){
					instance = new Constr(args);
					instance.connect(dest);
					instance.start(0);
					instance.mute = true;
				});
				meter.test(function(sample){
					expect(sample).to.equal(0);
				});
				meter.after(function(){
					instance.dispose();
					done();
				});
				meter.run();
			});

			it("be scheduled to stop in the future", function(done){
				var instance;
				var meter = new Meter(0.4);
				meter.before(function(dest){
					instance = new Constr(args);
					instance.connect(dest);
					instance.start(0).stop(0.2);
				});
				//keep a moving average of the output
				meter.test(function(sample, time){
					if (time > 0.02 && sample < 0.001){
						expect(time).to.be.gte(0.2);
					}
				});
				meter.after(function(){
					instance.dispose();
					done();
				});
				meter.run();
			});

		});

		context("Source API", function(){
			APITest.method(Constr, "start", ["Time=", "Time=", "Time="], args);
			APITest.method(Constr, "stop", ["Time="], args);
		});

	};
});