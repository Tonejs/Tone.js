const puppeteer = require("puppeteer");
const { resolve } = require("path");
const fs = require("fs");

function runPage(path){
	return new Promise(async (done, error) => {
		const browser = await puppeteer.launch({ args : ["--no-sandbox"] });
		const page = await browser.newPage();
		page.on("pageerror", e => error(e));
		await page.goto(`file://${path}`, { waitFor : "networkidle0" });
		await browser.close();
		done();
	});
}

context("HTML Tests", () => {

	it("can run multiple contexts at once", () => {
		return runPage(resolve(__dirname, "multiple_instances.html"));
	});

	it("has the same transport after offline test", () => {
		return runPage(resolve(__dirname, "same_transport.html"));
	});

});

context("Examples", () => {

	const exampleDir = resolve(__dirname, "../../examples/");

	const files = fs.readdirSync(exampleDir).filter(f => f.endsWith(".html"));

	files.forEach(f => {
		it(`can run example ${f}`, () => {
			return runPage(resolve(exampleDir, f));
		});
	});
});
