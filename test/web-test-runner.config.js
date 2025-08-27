import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

import rollupCommonjs from "@rollup/plugin-commonjs";
import { fromRollup } from "@web/dev-server-rollup";
import { puppeteerLauncher } from "@web/test-runner-puppeteer";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const commonjs = fromRollup(rollupCommonjs);

const BUILD_DIR = resolve(__dirname, "../build/esm");

function getFilesInToneDir(dir) {
	return [
		resolve(BUILD_DIR, "Tone", dir, "**/*.test.js"),
		resolve(BUILD_DIR, "Tone", dir, "*.test.js"),
	];
}

export default {
	groups: [
		{
			name: "core",
			files: [
				...getFilesInToneDir("core"),
				resolve(BUILD_DIR, "Tone/*.test.js"),
			],
		},
		{
			name: "component",
			files: getFilesInToneDir("component"),
		},
		{
			name: "effect",
			files: getFilesInToneDir("effect"),
		},
		{
			name: "event",
			files: getFilesInToneDir("event"),
		},
		{
			name: "instrument",
			files: getFilesInToneDir("instrument"),
		},
		{
			name: "signal",
			files: getFilesInToneDir("signal"),
		},
		{
			name: "source",
			files: getFilesInToneDir("source"),
		},
	],
	nodeResolve: true,
	browsers: [
		puppeteerLauncher({
			launchOptions: {
				headless: true,
				args: [
					"--no-sandbox",
					"--disable-setuid-sandbox",
					"--use-fake-ui-for-media-stream",
					"--use-fake-device-for-media-stream",
					"--autoplay-policy=no-user-gesture-required",
				],
			},
		}),
	],
	testFramework: {
		config: {
			timeout: 10000,
			retries: 2,
			ui: "bdd",
		},
	},
	plugins: [
		commonjs({
			include: ["**/node_modules/**/*"],
		}),
	],
	rootDir: resolve(__dirname, "../"),
	testRunnerHtml: (testFramework) =>
		`<!DOCTYPE html>
			<html>
			<body>
				<script>window.TONE_SILENCE_LOGGING = true</script>
				<script type="module" src="${testFramework}"></script>
			</body>
		</html>`,
};
