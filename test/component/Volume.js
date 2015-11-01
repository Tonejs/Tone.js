define(["Tone/component/Volume", "helper/Basic", "helper/Meter", "Test", 
	"Tone/signal/Signal", "helper/PassAudio", "helper/PassAudioStereo"], 
function (Volume, Basic, Meter, Test, Signal, PassAudio, PassAudioStereo) {
	describe("Volume", function(){

		Basic(Volume);

		context("Volume", function(){

			it("handles input and output connections", function(){
				var vol = new Volume();
				Test.connect(vol);
				vol.connect(Test);
				vol.dispose();
			});

			it("can be constructed with volume value", function(){
				var vol = new Volume(-12);
				expect(vol.volume.value).to.be.closeTo(-12, 0.1);
				vol.dispose();
			});

			it("can be constructed with an options object", function(){
				var vol = new Volume({
					"volume" : 2
				});
				expect(vol.volume.value).to.be.closeTo(2, 0.1);
				vol.dispose();
			});

			it("can set/get with an object", function(){
				var vol = new Volume();
				vol.set({
					"volume" : -10
				});
				expect(vol.get().volume).to.be.closeTo(-10, 0.1);
				vol.dispose();
			});

			it("passes the incoming signal through", function(done){
				var vol;
				PassAudio(function(input, output){
					vol = new Volume();
					input.connect(vol);
					vol.connect(output);
				}, function(){
					vol.dispose();
					done();
				});
			});

			it("passes the incoming stereo signal through", function(done){
				var vol;
				PassAudioStereo(function(input, output){
					vol = new Volume();
					input.connect(vol);
					vol.connect(output);
				}, function(){
					vol.dispose();
					done();
				});
			});

			it("can lower the volume", function(done){
				var vol;
				var signal;
				var meter = new Meter();
				meter.before(function(output){
					vol = new Volume(-10).connect(output);
					signal = new Signal(1).connect(vol);
				});
				meter.test(function(level){
					expect(level).to.be.closeTo(vol.dbToGain(-10), 0.01);
				});
				meter.after(function(){
					vol.dispose();
					signal.dispose();
					done();
				});
				meter.run();
			});

		});
	});
});