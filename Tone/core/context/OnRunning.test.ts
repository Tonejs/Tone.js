import { expect } from "chai";

import { Context } from "./Context.js";
import { OfflineContext } from "./OfflineContext.js";
import { onContextRunning } from "./OnRunning.js";

context("onContextRunning", () => {
	it("callback is invoked immediately when offline context is used", () => {
		const ctx = new OfflineContext(1, 0.1, 44100);
		let wasInvoked = false;

		onContextRunning(ctx, () => {
			wasInvoked = true;
		});

		expect(wasInvoked).to.be.true;
		ctx.dispose();
	});

	it("callback is invoked immediately when context is already running", async () => {
		const ctx = new Context();
		await ctx.resume();
		let wasInvoked = false;

		onContextRunning(ctx, () => {
			wasInvoked = true;
		});

		expect(wasInvoked).to.be.true;
		ctx.dispose();
	});

	it("callback is invoked when the context starts running", async () => {
		const ctx = new Context();
		let wasInvoked = false;

		onContextRunning(ctx, () => {
			wasInvoked = true;
		});

		expect(wasInvoked).to.be.false;

		await ctx.resume();
		expect(wasInvoked).to.be.true;

		ctx.dispose();
	});

	it("can remove the callback with the returned function", async () => {
		const ctx = new Context();
		let wasInvoked = false;
		const remove = onContextRunning(ctx, () => {
			wasInvoked = true;
		});
		expect(wasInvoked).to.be.false;
		remove();

		await ctx.resume();

		expect(wasInvoked).to.be.false;
		ctx.dispose();
	});
});
