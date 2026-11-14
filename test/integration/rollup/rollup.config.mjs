import { nodeResolve } from "@rollup/plugin-node-resolve";

/** @type {import('rollup').RollupOptions} */
export default {
	input: "index.js",
	output: {
		file: "dist/bundle.js",
		format: "esm",
	},
	plugins: [nodeResolve()],
	onwarn(warning, warn) {
		if (warning.code === "CIRCULAR_DEPENDENCY") {
			throw new Error(`Circular dependency detected: ${warning.message}`);
		}
		warn(warning);
	},
};
