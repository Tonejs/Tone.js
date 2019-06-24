import { expect } from "chai";
import { BasicTests } from "test/helper/Basic";
import { connectFrom, connectTo } from "test/helper/Connect";
import { Offline } from "test/helper/Offline";
import { EQ3 } from './EQ3';
import { PassAudio } from "test/helper/PassAudio";

describe("EQ3", () => {

	BasicTests(EQ3);

	context("EQing", () => {

		it("handles input and output connections", () => {
			const eq3 = new EQ3();
			connectFrom().connect(eq3);
			eq3.dispose();
		});

		it("can be constructed with an object", () => {
			const eq3 = new EQ3({
				low : -8,
				mid : -9,
				high : -10,
				lowFrequency : 500,
				highFrequency : 2700
			});
			expect(eq3.low.value).to.be.closeTo(-8, 0.1);
			expect(eq3.mid.value).to.be.closeTo(-9, 0.1);
			expect(eq3.high.value).to.be.closeTo(-10, 0.1);
			expect(eq3.lowFrequency.value).to.be.closeTo(500, 0.01);
			expect(eq3.highFrequency.value).to.be.closeTo(2700, 0.01);
			eq3.dispose();
		});

		it("can be get and set through object", () => {
			var eq3 = new EQ3();
			eq3.set({
				high : -4,
				lowFrequency : 250,
			});
			expect(eq3.get().high).to.be.closeTo(-4, 0.1);
			expect(eq3.get().lowFrequency).to.be.closeTo(250, 0.01);
			eq3.dispose();
		});

		it("passes the incoming signal through", () => {
			return PassAudio(function(input){
				var eq3 = new EQ3({
					"low" : -20,
					"high" : 12
				}).toMaster();
				input.connect(eq3);
			});
		});

		it.skip("passes the incoming stereo signal through", () => {
			// return PassAudioStereo(function(input){
			// 	var eq3 = new EQ3({
			// 		"mid" : -2,
			// 		"high" : 2
			// 	}).toMaster();
			// 	input.connect(eq3);
			// });
		});
	});
});

