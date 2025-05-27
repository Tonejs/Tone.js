import { BasicTests } from "../../../test/helper/Basic.js";
import { connectFrom, connectTo } from "../../../test/helper/Connect.js";
import { PassAudio } from "../../../test/helper/PassAudio.js";
import { MidSideMerge } from "./MidSideMerge.js";

describe("MidSideMerge", () => {
	BasicTests(MidSideMerge);

	context("Merging", () => {
		it("handles inputs and outputs", () => {
			const merge = new MidSideMerge();
			merge.connect(connectTo());
			connectFrom().connect(merge.mid);
			connectFrom().connect(merge.side);
			merge.dispose();
		});

		it("passes the mid signal through", () => {
			return PassAudio((input) => {
				const merge = new MidSideMerge().toDestination();
				input.connect(merge.mid);
			});
		});
	});
});
