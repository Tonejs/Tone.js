import { expect } from "chai";

import { Context } from "./context/Context.js";
import { getContext, setContext } from "./Global.js";

describe("Global", () => {
	it("can setContext with disposeOld = true", () => {
		const origContext = getContext();
		const toneContext = new Context();

		setContext(toneContext);
		expect(getContext()).to.equal(toneContext);

		setContext(origContext, true);

		expect(getContext()).to.equal(origContext);
		expect(toneContext.disposed).to.be.true;
	});
});
