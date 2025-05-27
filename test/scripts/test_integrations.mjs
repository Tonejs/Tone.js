#!/usr/bin/env zx
import "zx/globals";
import { glob } from "tinyglobby";
import { basename, resolve } from "path";

const integrations = await glob(
	"*",
	{
		cwd: resolve(__dirname, "../integration"),
		absolute: true,
		onlyDirectories: true,
	}
);

for (let dir of integrations) {
	await within(async () => {
		cd(dir);
		console.log("Integration:", basename(dir));
		await $`npm i`;
		await $`npm run test`;
	});
}
