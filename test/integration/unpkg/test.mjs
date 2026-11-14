/**
 * @fileoverview Ensure that the unpkg link can be loaded in the browser
 */
import assert from "node:assert";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

import puppeteer from "puppeteer";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const rootDir = resolve(__dirname, "../../../");
const pkg = JSON.parse(
	(await readFile(resolve(rootDir, "package.json"))).toString()
);

const browser = await puppeteer.launch({
	headless: true,
	args: ["--no-sandbox", "--disable-setuid-sandbox"],
});
const page = await browser.newPage();
await page.addScriptTag({
	path: resolve(rootDir, pkg.unpkg),
});
const time = await page.evaluate("Tone.now()");
await browser.close();

assert(time >= 0, new Error("did not export a time value"));
