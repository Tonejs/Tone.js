const puppeteer = require("puppeteer");
const { resolve } = require("path");
const fs = require("fs");
const { spawn } = require("child_process");

function runPage(name){
	return new Promise(async (done, error) => {
		const browser = await puppeteer.launch({ args : ["--no-sandbox"] });
		const page = await browser.newPage();
		page.on("pageerror", e => error(e));
		await page.goto(`http://localhost:9999/examples/${name}`, { waitFor : "networkidle0" });
		await browser.close();
		done();
	});
}

describe("TEST", () => {

	let serverProcess = null;

	before((done) => {
		const serverCommand = resolve(__dirname, "../../node_modules/.bin/http-server");
		serverProcess = spawn(serverCommand, ["-p", "9999"]);
		//give it a second for the server to start
		setTimeout(() => done(), 1000);
	});

	after(() => {
		serverProcess.kill();
	});

	context("HTML Tests", () => {

		it("can run multiple contexts at once", () => {
			return runPage("../test/html/multiple_instances.html");
		});

		it("has the same transport after offline test", () => {
			return runPage("../test/html/same_transport.html");
		});

	});

	context("Examples", () => {

		const exampleDir = resolve(__dirname, "../../examples/");

		const files = fs.readdirSync(exampleDir).filter(f => f.endsWith(".html"));

		files.forEach(f => {
			it(`can run example ${f}`, () => {
				return runPage(f);
			});
		});
	});
});

