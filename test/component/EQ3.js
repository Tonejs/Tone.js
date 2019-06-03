import EQ3 from "Tone/component/EQ3";
import Basic from "helper/Basic";
import Offline from "helper/Offline";
import Test from "helper/Test";
import Signal from "Tone/signal/Signal";
import PassAudio from "helper/PassAudio";
import PassAudioStereo from "helper/PassAudioStereo";
describe("EQ3", function(){

	Basic(EQ3);

	context("EQing", function(){

		it("handles input and output connections", function(){
			var eq3 = new EQ3();
			Test.connect(eq3);
			eq3.connect(Test);
			eq3.dispose();
		});

		it("can be constructed with an object", function(){
			var eq3 = new EQ3({
				"low" : -8,
				"mid" : -9,
				"high" : -10,
				"lowFrequency" : 500,
				"highFrequency" : 2700
			});
			expect(eq3.low.value).to.be.closeTo(-8, 0.1);
			expect(eq3.mid.value).to.be.closeTo(-9, 0.1);
			expect(eq3.high.value).to.be.closeTo(-10, 0.1);
			expect(eq3.lowFrequency.value).to.be.closeTo(500, 0.01);
			expect(eq3.highFrequency.value).to.be.closeTo(2700, 0.01);
			eq3.dispose();
		});

		it("can be get and set through object", function(){
			var eq3 = new EQ3();
			eq3.set({
				"high" : -4,
				"lowFrequency" : 250,
			});
			expect(eq3.get().high).to.be.closeTo(-4, 0.1);
			expect(eq3.get().lowFrequency).to.be.closeTo(250, 0.01);
			eq3.dispose();
		});

		it("passes the incoming signal through", function(){
			return PassAudio(function(input){
				var eq3 = new EQ3({
					"low" : -20,
					"high" : 12
				}).toMaster();
				input.connect(eq3);
			});
		});

		it("passes the incoming stereo signal through", function(){
			return PassAudioStereo(function(input){
				var eq3 = new EQ3({
					"mid" : -2,
					"high" : 2
				}).toMaster();
				input.connect(eq3);
			});
		});
	});
});

