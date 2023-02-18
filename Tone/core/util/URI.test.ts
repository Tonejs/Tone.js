import { expect } from "chai";
import { encodeUnencodedURIComponent } from "./URI";

describe("URI", () => {
	it("can encode a URI component without double-encoding", () => {
		expect(encodeUnencodedURIComponent("")).to.equal("");
		expect(encodeUnencodedURIComponent(" ")).to.equal("%20");
		expect(encodeUnencodedURIComponent("%20")).to.equal("%20");
		expect(encodeUnencodedURIComponent("%20 ")).to.equal("%20 "); // partially encoded strings are not encoded
		expect(encodeUnencodedURIComponent("a")).to.equal("a");
		expect(encodeUnencodedURIComponent("a%20b")).to.equal("a%20b");
		expect(encodeUnencodedURIComponent("a b")).to.equal("a%20b");
		expect(encodeUnencodedURIComponent("a+b")).to.equal("a%2Bb");
		expect(encodeUnencodedURIComponent("a%2b")).to.equal("a%2b");
		expect(encodeUnencodedURIComponent("something\t\telse")).to.equal("something%09%09else");
		expect(encodeUnencodedURIComponent("something%09%09else")).to.equal("something%09%09else");
		// Based on URL from issue reporter
		const exampleUrl = "https://some.domain.com/v0/b/test.appspot.com/o/MyFolder%2FmusicInC%23ornot.mp3?alt=media&token=qwer123-qwer-asdf-1234-asdf324234";
		expect(encodeUnencodedURIComponent(exampleUrl)).to.equal(exampleUrl);
	});
});
