// @ts-check
import stylisticJs from "@stylistic/eslint-plugin-js";
import stylisticTs from "@stylistic/eslint-plugin-ts";
import html from "eslint-plugin-html";
import jsdoc from "eslint-plugin-jsdoc";
import simpleImportSort from "eslint-plugin-simple-import-sort";
import unusedImports from "eslint-plugin-unused-imports";
import tseslint from "typescript-eslint";

/** @type {import("typescript-eslint").ConfigWithExtends} */
const customConfig = {
	files: ["**/*.js", "**/*.ts", "**/*.html", "eslint.config.mjs"],
	plugins: {
		"@stylistic/js": stylisticJs,
		"@stylistic/ts": stylisticTs,
		jsdoc,
		html,
		"simple-import-sort": simpleImportSort,
		"unused-imports": unusedImports,
	},
	rules: {
		"@typescript-eslint/array-type": "off",
		"@typescript-eslint/ban-ts-comment": "off",
		"@typescript-eslint/ban-ts-ignore": "off",
		"jsdoc/check-alignment": 1,
		"jsdoc/check-indentation": [
			"error",
			{
				excludeTags: ["example", "param"],
			},
		],
		"jsdoc/check-param-names": ["error"],
		curly: ["error", "all"],
		"@stylistic/js/dot-location": ["error", "property"],
		"dot-notation": ["error"],
		"@stylistic/js/eol-last": ["error", "always"],
		eqeqeq: ["error"],
		"@typescript-eslint/explicit-function-return-type": "off",
		"@typescript-eslint/explicit-member-accessibility": "off",
		// requires eslint flat compat
		// "file-extension-in-import-ts/file-extension-in-import-ts": "error",
		"@stylistic/js/linebreak-style": ["error", "unix"],
		"no-cond-assign": ["error", "always"],
		"no-console": [
			"error",
			{
				allow: ["warn"],
			},
		],
		"@typescript-eslint/no-empty-function": "off",
		"@typescript-eslint/no-empty-object-type": [
			"error",
			{
				allowInterfaces: "always",
			},
		],
		"@typescript-eslint/no-explicit-any": "off",
		"no-lonely-if": ["error"],
		"@typescript-eslint/no-object-literal-type-assertion": "off",
		"no-shadow": "error",
		"no-throw-literal": ["error"],
		"no-unmodified-loop-condition": ["error"],
		"no-unneeded-ternary": ["error"],
		"@typescript-eslint/no-unused-vars": "off",
		"@typescript-eslint/no-use-before-define": "off",
		"no-useless-call": ["error"],
		"no-var": "error",
		"prefer-arrow-callback": "error",
		"prefer-rest-params": "off",
		"@stylistic/ts/quote-props": ["error", "as-needed"],
		"@stylistic/ts/quotes": [
			"error",
			"double",
			{
				avoidEscape: true,
			},
		],
		"sort-imports": "off",
		"simple-import-sort/imports": "error",
		"simple-import-sort/exports": "error",
		"@stylistic/js/spaced-comment": [
			"error",
			"always",
			{
				line: {
					exceptions: ["-"],
				},
				block: {
					balanced: true,
				},
			},
		],
		"unused-imports/no-unused-imports": "error",
		"unused-imports/no-unused-vars": [
			"warn",
			{
				vars: "all",
				varsIgnorePattern: "^_",
				args: "after-used",
				argsIgnorePattern: "^_",
			},
		],
	},
};

export default tseslint.config(
	tseslint.configs.recommended,
	customConfig,
	{
		files: ["**/*.test.ts", "./test/**/*.ts"],
		rules: {
			"@typescript-eslint/no-unused-expressions": "off",
			"unused-imports/no-unused-vars": "off",
		},
	},
	{
		files: ["**/*.cjs"],
		rules: {
			"no-console": "off",
			"@typescript-eslint/no-require-imports": "off",
			"@typescript-eslint/no-unused-expressions": "off",
		},
	},
	{
		name: "globally-ignored-files",
		ignores: [
			"**/node_modules",
			"build/**",
			"coverage/**",
			"**/dist/**",
			"docs/**",
			"examples/**/*.js",
		],
	}
);
