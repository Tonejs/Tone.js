define(["Tone/component/Meter", "helper/Basic", "helper/Offline", "Test", 
	"Tone/signal/Signal", "helper/PassAudio", "Tone/core/Type", "Tone/component/Merge"], 
function (Meter, Basic, Offline, Test, Signal, PassAudio, Tone, Merge) {
	describe("Meter", function(){

		Basic(Meter);

		context("Metering", function(){

			it("handles input and output connections", function(){
				var meter = new Meter();
				Test.connect(meter);
				meter.connect(Test);
				meter.dispose();
			});

			it("handles getter/setter as Object", function(){
				var meter = new Meter();
				var values = {
					"clipMemory" : 0.2,
				};
				meter.set(values);
				expect(meter.get().clipMemory).to.be.closeTo(0.2, 0.001);
				meter.dispose();
			});

			it("can be constructed with an object", function(){
				var meter = new Meter({
					"bufferSize" : 256,
					"smoothing" : 0.3
				});
				expect(meter.smoothing).to.equal(0.3);
				meter.dispose();
			});

			it("passes the audio through", function(done){
				var meter;
				PassAudio(function(input, output){
					meter = new Meter({
						"bufferSize" : 512,
						"channels" : 2
					});
					input.chain(meter, output);
				}, function(){
					meter.dispose();
					done();
				});				
			});

			it("measures the incoming signal", function(done){
				var meter = new Meter();
				var signal = new Signal(2).connect(meter);
				setTimeout(function(){
					expect(meter.getValue()).to.equal(2);
					meter.dispose();
					signal.dispose();
					done();
				}, 400);
			});

			it("can get the RMS of the incoming signal", function(done){
				var meter = new Meter();
				var signal = new Signal(-10, Tone.Type.Decibels).connect(meter);
				setTimeout(function(){
					expect(meter.getDb()).to.be.closeTo(-10, 0.1);
					meter.dispose();
					signal.dispose();
					done();
				}, 400);
			});

			it("can get the RMS of a stereo signal signal", function(done){
				var meter = new Meter(2);
				var merge = new Merge().connect(meter);
				var signalL = new Signal(-20, Tone.Type.Decibels).connect(merge.left);
				var signalR = new Signal(-10, Tone.Type.Decibels).connect(merge.right);
				setTimeout(function(){
					expect(meter.getDb(0)).to.be.closeTo(-20, 0.1);
					expect(meter.getDb(1)).to.be.closeTo(-10, 0.1);
					meter.dispose();
					signalL.dispose();
					signalR.dispose();
					done();
				}, 400);
			});

		});
	});
});