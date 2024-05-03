#!/usr/bin/env zx
import "zx/globals";
import { glob } from "glob";
import { resolve, basename } from "path";

const integrations = await glob(resolve(__dirname, "../integration/*"));
for (let dir of integrations) {
	await within(async () => {
		cd(dir);
		// eslint-disable-next-line no-console
		console.log("Integration:", basename(dir));
		await $`npm i`;
		await $`npm run test`;
	});
}
