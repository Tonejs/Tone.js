#!/usr/bin/env zx
import "zx/globals";

import { basename, resolve } from "node:path";

import { glob } from "tinyglobby";

import { ROOT_DIR } from "./utils.mjs";

const integrations = await glob(
	resolve(ROOT_DIR, "test/integration/*"),
	{ absolute: true, onlyDirectories: true }
);

for (let dir of integrations) {
	await within(async () => {
		cd(dir);
		console.log("Integration:", basename(dir));
		await $`npm i`;
		await $`npm run test`;
	});
}
