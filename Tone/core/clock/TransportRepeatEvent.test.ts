import { expect } from "chai";
import { Offline } from "test/helper/Offline";
import { Transport } from "./Transport";
import { TransportRepeatEvent } from "./TransportRepeatEvent";

describe("TransportRepeatEvent", () => {

	it("can be created and disposed", () => {
		return Offline((context) => {
			const transport = new Transport({ context });
			const event = new TransportRepeatEvent(transport, {
				duration: 100,
				interval: 4,
				time: 0,
			});
			event.dispose();
		});
	});

	it("generates a unique event ID", () => {
		return Offline((context) => {
			const transport = new Transport({ context });
			const event = new TransportRepeatEvent(transport, {
				time: 0,
			});
			expect(event.id).to.be.a("number");
			event.dispose();
		});
	});

	it("is removed from the Transport when disposed", () => {
		return Offline((context) => {
			const transport = new Transport({ context });
			const event = new TransportRepeatEvent(transport, {
				time: 0,
			});
			event.dispose();
			// @ts-ignore
			expect(transport._timeline.length).to.equal(0);
		});
	});

});
