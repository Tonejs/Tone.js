/**
 * Alias for built worklet code which is bundled in scripts/esbuild-worklet-plugin.mjs
 */
declare module "*.worklet.code.js" {
	/**
	 * The fully bundled JavaScript source code of the AudioWorklet module,
	 * escaped and ready to be passed into a Blob or Object URL.
	 */
	export const audioWorklet: string;
}
