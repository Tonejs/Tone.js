import { BasicTests } from "test/helper/Basic";
import { Pattern } from "./Pattern";
import { Offline } from "test/helper/Offline";
import { Time } from "Tone/core/type/Time";
import { expect } from "chai";

describe("Pattern", () => {

	BasicTests(Pattern);

	context("Constructor", () => {

		it("takes a callback, an array of values and a pattern name", () => {
			return Offline(() => {
				const callback = function() {};
				const pattern = new Pattern(callback, [0, 1, 2, 3], "down");
				expect(pattern.callback).to.equal(callback);
				expect(pattern.values).to.deep.equal([0, 1, 2, 3]);
				expect(pattern.pattern).to.equal("down");
				pattern.dispose();
			});
		});

		it("can be constructed with no arguments", () => {
			return Offline(() => {
				const pattern = new Pattern();
				pattern.dispose();
			});
		});

		it("can pass in arguments in options object", () => {
			return Offline(() => {
				const callback = function() {};
				const pattern = new Pattern({
					callback: callback,
					iterations: 4,
					probability: 0.3,
					interval: "8t",
					values: [1, 2, 3],
					pattern: "upDown"
				});
				expect(pattern.callback).to.equal(callback);
				expect(pattern.interval.valueOf()).to.equal(Time("8t").valueOf());
				expect(pattern.iterations).to.equal(4);
				expect(pattern.values).to.deep.equal([1, 2, 3]);
				expect(pattern.probability).to.equal(0.3);
				expect(pattern.pattern).to.equal("upDown");
				pattern.dispose();
			});
		});
	});

	context("Get/Set", () => {

		it("can set values with object", () => {
			return Offline(() => {
				const callback = function() {};
				const pattern = new Pattern();
				pattern.set({
					callback: callback,
					values: ["a", "b", "c"],
				});
				expect(pattern.callback).to.equal(callback);
				expect(pattern.values).to.deep.equal(["a", "b", "c"]);
				pattern.dispose();
			});
		});

		it("can set get a the values as an object", () => {
			return Offline(() => {
				const callback = function() {};
				const pattern = new Pattern({
					callback: callback,
					pattern: "random",
					probability: 0.3,
				});
				const values = pattern.get();
				expect(values.pattern).to.equal("random");
				values.pattern = "upDown";
				expect(values.pattern).to.equal("upDown");
				expect(values.probability).to.equal(0.3);
				pattern.dispose();
			});
		});
	});

	context("Callback", () => {

		it("is invoked after it's started", () => {
			let invoked = false;
			return Offline(({ transport }) => {
				let index = 0;
				const pattern = new Pattern((() => {
					invoked = true;
					expect(pattern.value).to.equal(index);
					index++;
				}), [0, 1, 2]).start(0);
				transport.start();
			}, 0.2).then(() => {
				expect(invoked).to.be.true;
			});
		});

		it("passes in the scheduled time and pattern index to the callback", () => {
			let invoked = false;
			return Offline(({ transport }) => {
				const startTime = 0.05;
				const pattern = new Pattern(((time, note) => {
					expect(time).to.be.a("number");
					expect(time - startTime).to.be.closeTo(0.3, 0.01);
					expect(note).to.be.equal("a");
					invoked = true;
				}), ["a"], "up");
				transport.start(startTime);
				pattern.start(0.3);
			}, 0.4).then(() => {
				expect(invoked).to.be.true;
			});
		});

		it("passes in the next note of the pattern", () => {
			let counter = 0;
			return Offline(({ transport }) => {
				const pattern = new Pattern(((time, note) => {
					expect(note).to.equal(counter % 3);
					counter++;
				}), [0, 1, 2], "up").start(0);
				pattern.interval = "16n";
				transport.start(0);
			}, 0.7).then(() => {
				expect(counter).to.equal(6);
			});
		});
	});

});

