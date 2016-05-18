define(["Tone/component/Meter", "helper/Basic", "helper/Offline", "Test", 
	"Tone/signal/Signal", "helper/PassAudio", "Tone/type/Type", 
	"Tone/component/Merge", "Tone/source/Oscillator"], 
function (Meter, Basic, Offline, Test, Signal, PassAudio, Tone, Merge, Oscillator) {
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
					"type" : "signal",
					"smoothing" : 0.2
				};
				meter.set(values);
				expect(meter.get().type).to.equal("signal");
				expect(meter.get().smoothing).to.equal(0.2);
				meter.dispose();
			});

			it("can be constructed with an object", function(){
				var meter = new Meter({
					"smoothing" : 0.3
				});
				expect(meter.smoothing).to.equal(0.3);
				meter.dispose();
			});

			it("passes the audio through", function(done){
				var meter;
				PassAudio(function(input, output){
					meter = new Meter();
					input.chain(meter, output);
				}, function(){
					meter.dispose();
					done();
				});				
			});

			it("measures the incoming signal", function(done){
				var meter = new Meter("signal");
				var signal = new Signal(1).connect(meter);
				setTimeout(function(){
					expect(meter.value).to.be.closeTo(1, 0.05);
					meter.dispose();
					signal.dispose();
					done();
				}, 400);
			});

			it("can get the level of the incoming signal", function(done){
				var meter = new Meter();
				var osc = new Oscillator().connect(meter).start();
				osc.volume.value = -6;
				setTimeout(function(){
					expect(meter.value).to.be.closeTo(1, 0.1);
					meter.dispose();
					osc.dispose();
					done();
				}, 400);
			});
		});
	});
});