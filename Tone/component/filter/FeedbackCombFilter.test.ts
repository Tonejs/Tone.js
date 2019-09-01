
import { expect } from "chai";
import { FeedbackCombFilter, FeedbackCombFilterOptions } from "./FeedbackCombFilter";
import { BasicTests } from "test/helper/Basic";
import Test from "helper/Test";
import { PassAudio } from "test/helper/PassAudio";
import { PassAudioStereo } from "test/helper/PassAudioStereo";

describe("FeedbackCombFilter", () => {

	BasicTests(FeedbackCombFilter);

	context("Comb Filtering", () => {

		it("handles input and output connections", () => {
			const fbcf = new FeedbackCombFilter();
			Test.connect(fbcf);
			fbcf.connect(Test);
			fbcf.dispose();
		});

		it("can be constructed with an object", () => {
			const fbcf = new FeedbackCombFilter({
				delayTime: 0.2,
				resonance: 0.3,
			});
			expect(fbcf.delayTime.value).to.be.closeTo(0.2, 0.001);
			expect(fbcf.resonance.value).to.be.closeTo(0.3, 0.001);
			fbcf.dispose();
		});

		it("can be get and set through object", () => {
			const fbcf = new FeedbackCombFilter();
			fbcf.set<FeedbackCombFilterOptions>({
				delayTime: 0.2,
				resonance: 0.3,
            });
            const values = fbcf.get<FeedbackCombFilter, FeedbackCombFilterOptions>();
			expect(values.delayTime).to.be.closeTo(0.2, 0.001);
			expect(values.resonance).to.be.closeTo(0.3, 0.001);
			fbcf.dispose();
		});

		it("passes the incoming signal through", () => {
			return PassAudio(input => {
				const fbcf = new FeedbackCombFilter({
                    delayTime: 0,
                }).toMaster();
				input.connect(fbcf);
			});
		});

		it("passes the incoming stereo signal through", () => {
			return PassAudioStereo(input => {
				const fbcf = new FeedbackCombFilter({
                    delayTime: 0,
                }).toMaster();
				input.connect(fbcf);
			});
		});
	});
});

