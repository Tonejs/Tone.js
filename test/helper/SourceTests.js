define(["helper/OutputAudio", "Tone/source/Source", "helper/OutputAudioStereo", "Test", "helper/Offline"], 
	function (OutputAudio, Source, OutputAudioStereo, Test, Offline) {

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
				var instance = new Constr(args);
				expect(instance.state).to.equal("stopped");
				instance.start().stop("+0.2");
				setTimeout(function(){
					expect(instance.state).to.equal("started");
				}, 100);
				setTimeout(function(){
					expect(instance.state).to.equal("stopped");
					instance.dispose();
					done();
				}, 300);
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
				var offline = new Offline(0.3, 1, true);
				offline.before(function(dest){
					instance = new Constr(args);
					instance.connect(dest);
					instance.start(0.1);
				});
				offline.test(function(sample, time){
					if (sample > 0){
						expect(time).to.be.at.least(0.1);
					}
				});
				offline.after(function(){
					instance.dispose();
					done();
				});
				offline.run();
			});

			it("be scheduled to stop in the future", function(done){
				var instance;
				var offline = new Offline(0.4, 1, true);
				offline.before(function(dest){
					instance = new Constr(args);
					instance.connect(dest);
					instance.start(0).stop(0.2);
				});
				//keep a moving average of the output
				offline.test(function(sample, time){
					if (time > 0.02 && sample < 0.001){
						expect(time).to.be.gte(0.2);
					}
				});
				offline.after(function(){
					instance.dispose();
					done();
				});
				offline.run();
			});

		});

	};
});