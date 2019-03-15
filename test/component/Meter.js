import Meter from "Tone/component/Meter";
import Basic from "helper/Basic";
import Offline from "helper/Offline";
import Test from "helper/Test";
import Signal from "Tone/signal/Signal";
import PassAudio from "helper/PassAudio";
import Tone from "Tone/type/Type";
import Merge from "Tone/component/Merge";
import Oscillator from "Tone/source/Oscillator";
import Supports from "helper/Supports";
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

		it("can be constructed with the smoothing", function(){
			var meter = new Meter(0.5);
			expect(meter.smoothing).to.equal(0.5);
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
		
		if (Supports.ONLINE_TESTING){
	
			it("measures the rms incoming signal", function(done){
				var meter = new Meter();
				var signal = new Signal(1).connect(meter);
				setTimeout(function(){
					expect(meter.getValue()).to.be.closeTo(1, 0.05);
					meter.dispose();
					signal.dispose();
					done();
				}, 400);
			});

			it("can get the rms level of the incoming signal", function(done){
				var meter = new Meter();
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

