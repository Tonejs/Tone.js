import { expect } from "chai";
import "../../Tone/core/clock/Transport.js";
import "../../Tone/core/context/Destination.js";
import { OfflineContext } from "../../Tone/core/context/OfflineContext.js";
import { ToneWithContext } from "../../Tone/core/context/ToneWithContext.js";
import { Tone } from "../../Tone/core/Tone.js";
import { ConnectTest } from "./Connect.js";
import { setLogger } from "../../Tone/core/util/Debug.js";
import { ToneAudioNode } from "../../Tone/core/context/ToneAudioNode.js";
import { getContext } from "../../Tone/core/Global.js";
import * as Classes from "../../Tone/classes.js";
import { isFunction } from "../../Tone/core/util/TypeCheck.js";
import { noOp } from "../../Tone/core/util/Interface.js";

export const testAudioContext = new OfflineContext(1, 1, 11025);

export function BasicTests(Constr, ...args: any[]): void {
	context("Basic", () => {
		before(() => {
			return getContext().resume();
		});

		it("can be created and disposed", () => {
			const instance = new Constr(...args);
			instance.dispose();
			// check that all of the attributes were disposed
			expect(instance.disposed).to.equal(true);
			// also check all of it's attributes to see if they also have the right context
			for (const member in instance) {
				if (instance[member] instanceof Tone && member !== "context") {
					expect(
						instance[member].disposed,
						`member ${member}`
					).to.equal(true);
				}
			}
			// check that all callback functions are assigned to noOp
			for (const member in instance) {
				if (isFunction(instance[member]) && member.startsWith("on")) {
					expect(instance[member]).to.equal(noOp);
				}
			}
		});

		it("extends Tone", () => {
			const instance = new Constr(...args);
			expect(instance).to.be.an.instanceof(Tone);
			instance.dispose();
		});

		it("can specify the AudioContext", () => {
			const instance = new Constr(
				Object.assign(
					{
						context: testAudioContext,
					},
					...args
				)
			);
			if (instance instanceof ToneWithContext) {
				expect(instance.context).to.equal(testAudioContext);
				// also check all of it's attributes to see if they also have the right context
				for (const member in instance) {
					if (instance[member] instanceof ToneWithContext) {
						expect(
							instance[member].context,
							`member: ${member}`
						).to.equal(testAudioContext);
					}
				}
			}
			instance.dispose();
		});

		it("can be serialized to JSON", () => {
			const instance = new Constr(...args);
			if (instance instanceof ToneAudioNode) {
				const json = instance.get();
				// this throws an error if the object is recursive
				JSON.stringify(json);
			}
		});

		ConnectTest(Constr, ...args);
	});

	it("exports its class name", () => {
		// find the constructor
		for (const className in Classes) {
			if (Classes[className] === Constr) {
				const instance = new Constr(...args);
				expect(instance.toString()).to.equal(className);
				instance.dispose();
			}
		}
	});
}

/**
 * Assert that the function triggers a warning
 */
export async function warns(fn: (...args: any[]) => any): Promise<void> {
	let wasInvoked = false;
	setLogger({
		log: () => {},
		warn: () => (wasInvoked = true),
	});
	const ret = fn();
	if (ret instanceof Promise) {
		await ret;
	}
	expect(wasInvoked).to.equal(true);
	// return to the original logger
	setLogger(console);
}
