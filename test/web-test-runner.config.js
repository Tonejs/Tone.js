import rollupCommonjs from "@rollup/plugin-commonjs";
import { esbuildPlugin } from "@web/dev-server-esbuild";
import { fromRollup } from "@web/dev-server-rollup";
import { puppeteerLauncher } from "@web/test-runner-puppeteer";
import { resolve } from "path";
import { fileURLToPath } from "url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const commonjs = fromRollup(rollupCommonjs);

export default {
	files: ["./build/*/Tone/**/*.test.js", "./build/*/Tone/*.test.js"],
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
};
