define(["Tone/component/Meter", "helper/Basic", "helper/Offline", "Test",
	"Tone/signal/Signal", "helper/PassAudio", "Tone/type/Type",
	"Tone/component/Merge", "Tone/source/Oscillator", "helper/Supports"],
function (Meter, Basic, Offline, Test, Signal, PassAudio, Tone, Merge, Oscillator, Supports) {
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
					"smoothing" : 0.2
				};
				meter.set(values);
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

			it("passes the audio through", function(){
				var meter;
				return PassAudio(function(input){
					meter = new Meter();
					input.chain(meter, Tone.Master);
				});
			});

			it("defaults to rms level of incoming signal", function(){
				var meter = new Meter();
				expect(meter.type).to.equal("rms");
				meter.dispose();
			});

			it("throws when invalid type is set", function(){
				var meter = new Meter();
				expect(function() {
					meter.type = "shouldThrow";
				}).to.throw("Tone.Meter: invalid type: shouldThrow");
				meter.dispose();

				expect(function(){
					new Meter({ type: "shouldThrow" });
				}).to.throw("Tone.Meter: invalid type: shouldThrow");
			});

			it("can change type", function(){
				var meter = new Meter();
				expect(meter.type).to.equal("rms");

				meter.type = "peak";
				expect(meter.type).to.equal("peak");

				meter.type = "rms";
				expect(meter.type).to.equal("rms");

				meter.dispose();
			});

			it("gets peak value correctly", function(){
				var values = [1.0, -2.0, 3.0, -4.0, 5.0, -6.0, 7.0, -8.0, 9.0, -10.0];
				var meter = new Meter();
				var peak = meter.getPeakFloatValue(values);
				expect(peak).to.equal(10);

				meter.dispose();
			});

			// Based on https://rosettacode.org/wiki/Averages/Root_mean_square#JavaScript
			it("gets rms value correctly", function(){
				var values = [-1.0, 2.0, -3.0, 4.0, -5.0, 6.0, -7.0, 8.0, -9.0, 10.0];
				var meter = new Meter();
				var peak = meter.getRmsFloatValue(values);
				expect(peak).to.be.closeTo(6.2048, 0.0001);

				meter.dispose();
			});

			// Based on https://en.wikipedia.org/wiki/Decibel
			it("gets dB values correctly", function(){
				var meter = new Meter();

				// Asserts that amplitude ratio of 1 equals 0dB
				var floatValue = 1.0;
				var db = meter.convertFloatToDb(floatValue);
				expect(db).to.be.closeTo(0, 0.01);

				// Asserts that amplitude ratio of 0 is less than -100dB
				floatValue = 0;
				db = meter.convertFloatToDb(floatValue);
				expect(db).to.be.lte(-100);

				// Correctly detects values greater than 0dB (clipping)
				floatValue = 31.62;
				db = meter.convertFloatToDb(floatValue);
				expect(db).to.be.closeTo(30, 0.01);

				// Asserts that amplitude ratio of 0.1 equals -20dB
				floatValue = 0.1;
				db = meter.convertFloatToDb(floatValue);
				expect(db).to.be.closeTo(-20, 0.01);

				// Asserts that amplitude ratio of 0.03162 equals -30dB
				floatValue = 0.03162;
				db = meter.convertFloatToDb(floatValue);
				expect(db).to.be.closeTo(-30, 0.01);

				meter.dispose();
			});

			if (Supports.ONLINE_TESTING) {
				it("measures the peak incoming signal", function(done){
					var meter = new Meter({ type: "peak" });
					var signal = new Signal(1).connect(meter);
					setTimeout(function(){
						expect(meter.getValue()).to.be.closeTo(1, 0.05);
						meter.dispose();
						signal.dispose();
						done();
					}, 400);
				});

				it("measures the rms incoming signal", function(done){
					var meter = new Meter({ type: "rms" });
					var signal = new Signal(1).connect(meter);
					setTimeout(function(){
						expect(meter.getValue()).to.be.closeTo(1, 0.05);
						meter.dispose();
						signal.dispose();
						done();
					}, 400);
				});

				it("can get the peak level of the incoming signal", function(done){
					var meter = new Meter({ type: "peak" });
					var osc = new Oscillator().connect(meter).start();
					osc.volume.value = -6;
					setTimeout(function(){
						expect(meter.getLevel()).to.be.closeTo(-6, 6);
						meter.dispose();
						osc.dispose();
						done();
					}, 400);
				});

				it("can get the rms level of the incoming signal", function(done){
					var meter = new Meter({ type: "rms" });
					var osc = new Oscillator().connect(meter).start();
					osc.volume.value = -6;
					setTimeout(function(){
						expect(meter.getLevel()).to.be.closeTo(-9, 1);
						meter.dispose();
						osc.dispose();
						done();
					}, 400);
				});
			}
		});
	});
});
