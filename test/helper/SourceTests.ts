// import APITest from "helper/APITest";
import { expect } from "chai";

import { connectTo } from "./Connect.js";
import { Offline } from "./Offline.js";
import { OutputAudio } from "./OutputAudio.js";

export function SourceTests(Constr, args?): void {
	context("Source Tests", () => {
		it("can connect the output", () => {
			const instance = new Constr(args);
			instance.connect(connectTo());
			instance.dispose();
		});

		it("has no input", () => {
			const instance = new Constr(args);
			// has no input
			expect(instance.numberOfInputs).to.equal(0);
			instance.dispose();
		});

		it("starts and stops", () => {
			return Offline(() => {
				const instance = new Constr(args);
				expect(instance.state).to.equal("stopped");
				instance.start(0).stop(0.2);
				return (time) => {
					if (time >= 0 && time < 0.2) {
						expect(instance.state).to.equal("started");
					} else if (time > 0.2) {
						expect(instance.state).to.equal("stopped");
					}
				};
			}, 0.3);
		});

		it("makes a sound", () => {
			return OutputAudio(() => {
				const instance = new Constr(args);
				instance.toDestination();
				instance.start();
			});
		});

		it("invokes the onstop method the source is stopped", () => {
			let wasInvoked = false;
			return Offline(() => {
				const instance = new Constr(args);
				instance.toDestination();
				instance.onstop = () => (wasInvoked = true);
				instance.start(0).stop(0.1);
			}, 0.2).then(() => {
				expect(wasInvoked).to.equal(true);
			});
		});

		it("be scheduled to start in the future", () => {
			return Offline(() => {
				const instance = new Constr(args).toDestination();
				instance.start(0.1);
			}, 0.3).then((buffer) => {
				buffer.forEach((sample, time) => {
					if (sample > 0) {
						expect(time).to.be.at.least(0.099);
					}
				});
			});
		});

		it("makes no sound if it is started and then stopped with a time at or before the start time", () => {
			return Offline(() => {
				const instance = new Constr(args).toDestination();
				instance.start(0.1).stop(0.05);
			}, 0.3).then((buffer) => {
				expect(buffer.isSilent()).to.equal(true);
			});
		});

		it("can be muted", () => {
			return Offline(() => {
				const instance = new Constr(args).toDestination();
				instance.start(0);
				instance.mute = true;
			}, 0.3).then((buffer) => {
				expect(buffer.isSilent()).to.equal(true);
			});
		});

		it("be scheduled to stop in the future", () => {
			return Offline(() => {
				const instance = new Constr(args).toDestination();
				instance.start(0).stop(0.2);
			}, 0.3).then((buffer) => {
				buffer.forEach((sample, time) => {
					if (time > 0.2) {
						expect(sample).to.equal(0);
					}
				});
			});
		});

		it("can be restarted", () => {
			return Offline(() => {
				const instance = new Constr(args).toDestination();
				instance.start(0).stop(0.2);
				instance.restart(0.1);
				instance.stop(0.25);
			}, 0.32).then((buffer) => {
				expect(buffer.getRmsAtTime(0)).to.be.gt(0);
				expect(buffer.getRmsAtTime(0.1)).to.be.gt(0);
				expect(buffer.getRmsAtTime(0.2)).to.be.gt(0);
				expect(buffer.getRmsAtTime(0.23)).to.be.gt(0);
				expect(buffer.getRmsAtTime(0.3)).to.equal(0);
			});
		});

		it("calling restart before calling start has no effect", () => {
			return Offline(() => {
				const instance = new Constr(args).toDestination();
				instance.restart(0.1);
			}, 0.2).then((buffer) => {
				expect(buffer.isSilent()).to.be.true;
			});
		});
	});
}
