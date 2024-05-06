/**
 * @fileoverview Ensure that the unpkg link can be loaded in the browser
 */
import puppeteer from "puppeteer";
import { fileURLToPath } from "url";
import { readFile } from "fs/promises";
import { resolve } from "path";
import assert from "assert";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const rootDir = resolve(__dirname, "../../../");
const pkg = JSON.parse(
	(await readFile(resolve(rootDir, "package.json"))).toString()
);

const browser = await puppeteer.launch();
const page = await browser.newPage();
await page.addScriptTag({
	path: resolve(rootDir, pkg.unpkg),
});
const time = await page.evaluate("Tone.now()");
await browser.close();

assert(time >= 0, new Error("did not export a time value"));
