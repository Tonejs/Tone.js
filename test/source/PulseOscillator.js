define(["helper/Basic", "Tone/source/PulseOscillator", "helper/Offline", "helper/SourceTests", "helper/OscillatorTests"], 
	function (BasicTests, PulseOscillator, Offline, SourceTests, OscillatorTests) {

	describe("PulseOscillator", function(){

		//run the common tests
		BasicTests(PulseOscillator);
		SourceTests(PulseOscillator);
		OscillatorTests(PulseOscillator);

		context("Phase Rotation", function(){
			it ("can change the phase to 90", function(done){
				var instance;
				var offline = new Offline(1);
				offline.before(function(dest){
					instance = new PulseOscillator({
						"phase" : 90,
						"frequency" : 1
					});
					instance.connect(dest);
					instance.start(0);
				});
				offline.test(function(sample, time){
					if (time < 0.25){
						expect(sample).to.be.within(-1, 0);
					} else if (time < 0.5){
						expect(sample).to.be.within(0, 1);
					}
				});
				offline.after(function(){
					instance.dispose();
					done();
				});
				offline.run();
			});

			it ("can change the phase to -90", function(done){
				var instance;
				var offline = new Offline(1);
				offline.before(function(dest){
					instance = new PulseOscillator({
						"phase" : 270,
						"frequency" : 1
					});
					instance.connect(dest);
					instance.start(0);
				});
				offline.test(function(sample, time){
					if (time < 0.25){
						expect(sample).to.be.within(0, 1);
					} else if (time < 0.5){
						expect(sample).to.be.within(-1, 0);
					}
				});
				offline.after(function(){
					instance.dispose();
					done();
				});
				offline.run();
			});
			
		});

		context("Width", function(){

			it ("can set the width", function(){
				var osc = new PulseOscillator({
					"width" : 0.2,
				});
				expect(osc.width.value).to.be.closeTo(0.2, 0.001);
				osc.dispose();
			});

			it ("outputs correctly with a width of 0", function(done){
				var osc;
				var offline = new Offline(1);
				offline.before(function(dest){
					osc = new PulseOscillator({
						"width" : 0,
						"frequency" : 1
					});
					osc.connect(dest);
					osc.start(0);
				});
				var lastTime = 0;
				offline.test(function(sample, time){
					lastTime = time;
					if (time > 0.5){
						expect(sample).to.be.within(-1, 0);
					} 
				});
				offline.after(function(){
					osc.dispose();
					done();
				});
				offline.run();
			});

			it ("outputs correctly with a width of 0.5", function(done){
				var osc;
				var offline = new Offline(1);
				offline.before(function(dest){
					osc = new PulseOscillator({
						"width" : 0.5,
						"frequency" : 1
					});
					osc.connect(dest);
					osc.start(0);
				});
				var lastTime = 0;
				offline.test(function(sample, time){
					lastTime = time;
					if (time <= 0.5){
						expect(sample).to.be.within(0, 1);
					} else if (time >= 0.51 && time <= 0.7){
						expect(sample).to.be.within(-1, 0);
					} else if (time > 0.71){
						expect(sample).to.be.within(0, 1);
					}
				});
				offline.after(function(){
					osc.dispose();
					done();
				});
				offline.run();
			});
		});

	});
});