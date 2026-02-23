import { expect, use } from "chai";
import sinon from "sinon";
import sinonChai from "sinon-chai";
use(sinonChai);

import { BasicTests } from "../../test/helper/Basic.js";
import { Context } from "../core/context/Context.js";
import { OfflineContext } from "../core/context/OfflineContext.js";
import { UserMedia } from "./UserMedia.js";

describe("UserMedia", () => {
	// run the common tests
	BasicTests(UserMedia);

	context("Source Tests", () => {
		it("can be constructed with the input number", () => {
			const extIn = new UserMedia();
			extIn.dispose();
		});

		it("can be constructed with an options object", () => {
			const extIn = new UserMedia({
				volume: -10,
				mute: false,
			});
			expect(extIn.volume.value).to.be.closeTo(-10, 0.1);
			expect(extIn.mute).to.be.false;
			extIn.dispose();
		});

		it("properties return undefined before open", () => {
			const extIn = new UserMedia();
			expect(extIn.deviceId).to.be.undefined;
			expect(extIn.groupId).to.be.undefined;
			expect(extIn.label).to.be.undefined;
			extIn.dispose();
		});

		it("indicates if the browser has UserMedia support", () => {
			expect(UserMedia.supported).to.be.a("boolean");
		});
	});

	context("Opening and closing", () => {
		beforeEach(() => {
			const mockTrack = { stop: sinon.stub() };
			const mockStream = {
				active: true,
				getAudioTracks: () => [mockTrack],
			} as unknown as MediaStream;
			const mockMediaStreamSource = {
				connect: sinon.stub(),
				disconnect: sinon.stub(),
				numberOfOutputs: 1,
			} as unknown as MediaStreamAudioSourceNode;
			sinon.stub(UserMedia, "enumerateDevices").resolves([
				{
					deviceId: "default",
					groupId: "default",
					label: "Default Device",
				},
				{
					deviceId: "other",
					groupId: "default",
					label: "Other Device",
				},
			] as MediaDeviceInfo[]);
			sinon
				.stub(navigator.mediaDevices, "getUserMedia")
				.resolves(mockStream);
			sinon
				.stub(Context.prototype, "createMediaStreamSource")
				.returns(mockMediaStreamSource);
		});

		afterEach(() => {
			sinon.restore();
		});

		it("open returns a promise", async () => {
			const extIn = new UserMedia();
			const promise = extIn.open();
			expect(promise).to.be.instanceOf(Promise);
			await promise;
			extIn.dispose();
		});

		it("can open an input", async () => {
			const extIn = new UserMedia();
			await extIn.open();
			extIn.dispose();
		});

		it("can open an input by name", async () => {
			const extIn = new UserMedia();
			const devices = await UserMedia.enumerateDevices();
			const name = devices[0].deviceId;

			await extIn.open(name);

			expect(extIn.deviceId).to.equal(name);
			expect(navigator.mediaDevices.getUserMedia).to.have.been.calledWith(
				sinon.match.hasNested("audio.deviceId", name)
			);
			extIn.dispose();
		});

		it("can open an input by index", async () => {
			const extIn = new UserMedia();

			await extIn.open(0);

			expect(navigator.mediaDevices.getUserMedia).to.have.been.calledWith(
				sinon.match.hasNested("audio.deviceId", "default")
			);
			extIn.dispose();
		});

		it("can pass in additional constraints", async () => {
			const extIn = new UserMedia();
			await extIn.open({
				preferCurrentTab: true,
			});
			expect(navigator.mediaDevices.getUserMedia).to.have.been.calledWith(
				sinon.match.hasNested("preferCurrentTab", true)
			);
			extIn.dispose();
		});

		it("throws an error if it cant find the device name", async () => {
			const extIn = new UserMedia();
			try {
				await extIn.open("doesn't exist");
				throw new Error("shouldn't reach here");
			} catch {
				extIn.dispose();
			}
		});

		it("is 'started' after media is open and 'stopped' otherwise", async () => {
			const extIn = new UserMedia();
			expect(extIn.state).to.equal("stopped");

			await extIn.open();

			expect(extIn.state).to.equal("started");
			extIn.dispose();
		});

		it("has a label, group and device id when open", async () => {
			const extIn = new UserMedia();
			expect(extIn.deviceId).to.be.undefined;
			expect(extIn.groupId).to.be.undefined;
			expect(extIn.label).to.be.undefined;

			await extIn.open();

			expect(extIn.deviceId).to.be.a("string");
			expect(extIn.groupId).to.be.a("string");
			expect(extIn.label).to.be.a("string");
			extIn.dispose();
		});

		it("can reopen an input", async () => {
			const extIn = new UserMedia();
			await extIn.open();
			extIn.close();
			await extIn.open();
			extIn.dispose();
		});

		it("can close an input", async () => {
			const extIn = new UserMedia();
			await extIn.open();
			extIn.close();
			extIn.dispose();
		});

		it("can enumerate devices", async () => {
			const devices = await UserMedia.enumerateDevices();
			expect(devices).to.be.instanceOf(Array);
		});

		it("doesn't work in OfflineContext", async () => {
			const context = new OfflineContext(2, 2, 44100);
			const extIn = new UserMedia({ context });
			try {
				await extIn.open();
				throw new Error("shouldn't reach here");
			} catch {
				// expected to throw in OfflineContext
			}
		});
	});
});
