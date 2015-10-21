define(["Tone/component/Volume", "helper/Basic", "helper/Meter", "Test", 
	"Tone/signal/Signal", "helper/PassAudio", "helper/PassAudioStereo"], 
function (Volume, Basic, Meter, Test, Signal, PassAudio, PassAudioStereo) {
	describe("Volume", function(){

		Basic(Volume);

		context("Volume", function(){

			it("handles input and output connections", function(){
				var volume = new Volume();
				Test.connect(volume);
				volume.connect(Test);
				volume.dispose();
			});

			it("can be constructed volume value", function(){
				var volume = new Volume(-12);
				expect(volume.value).to.be.closeTo(-12, 0.1);
				volume.dispose();
			});

			it("can be constructed with an options object", function(){
				var volume = new Volume({
					"value" : 2
				});
				expect(volume.value).to.be.closeTo(2, 0.1);
				volume.dispose();
			});

			it("can set/get with an object", function(){
				var volume = new Volume();
				volume.set({
					"value" : -10
				});
				expect(volume.get().value).to.be.closeTo(-10, 0.1);
				volume.dispose();
			});

			it("passes the incoming signal through", function(done){
				var volume;
				PassAudio(function(input, output){
					volume = new Volume();
					input.connect(volume);
					volume.connect(output);
				}, function(){
					volume.dispose();
					done();
				});
			});

			it("passes the incoming stereo signal through", function(done){
				var volume;
				PassAudioStereo(function(input, output){
					volume = new Volume();
					input.connect(volume);
					volume.connect(output);
				}, function(){
					volume.dispose();
					done();
				});
			});

			it("can lower the volume", function(done){
				var volume;
				var signal;
				var meter = new Meter();
				meter.before(function(output){
					volume = new Volume(-10).connect(output);
					signal = new Signal(1).connect(volume);
				});
				meter.test(function(level){
					expect(level).to.be.closeTo(volume.dbToGain(-10), 0.01);
				});
				meter.after(function(){
					volume.dispose();
					signal.dispose();
					done();
				});
				meter.run();
			});

		});
	});
});