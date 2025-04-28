// @ts-check
import tseslint from 'typescript-eslint';

import jsdoc from 'eslint-plugin-jsdoc';
import html from 'eslint-plugin-html';

// @todo requires eslint flat compat
// or use custom rules as mentioned here:https://typescript-eslint.io/troubleshooting/typed-linting/performance#eslint-plugin-import
// import fileExtensions from 'eslint-plugin-file-extension-in-import-ts'

/** @type {import("typescript-eslint").ConfigWithExtends} */
const customConfig = {
	files: ["**/*.js", "**/*.ts", "**/*.html"],
	plugins: {
		jsdoc,
		html
	},
	rules: {
		"@typescript-eslint/array-type": "off",
		"@typescript-eslint/ban-ts-comment": "off",
		"@typescript-eslint/ban-ts-ignore": "off",
		"jsdoc/check-alignment": 1,
		"jsdoc/check-indentation": [
			"error",
			{
				"excludeTags": [
					"example",
					"param"
				]
			}
		],
		"jsdoc/check-param-names": [
			"error"
		],
		"curly": [
			"error",
			"all"
		],
		// deprecated
		// https://eslint.style/rules/default/dot-location
		"dot-location": [
			"error",
			"property"
		],
		"dot-notation": [
			"error"
		],
		// deprecated
		// https://eslint.style/rules/js/eol-last#js-eol-last
		"eol-last": [
			"error",
			"always"
		],
		"eqeqeq": [
			"error"
		],
		"@typescript-eslint/explicit-function-return-type": "off",
		"@typescript-eslint/explicit-member-accessibility": "off",
		// requires eslint flat compat
		// "file-extension-in-import-ts/file-extension-in-import-ts": "error",
		// deprecated
		// https://eslint.style/rules/js/linebreak-style#js-linebreak-style
		"linebreak-style": [
			"error",
			"unix"
		],
		// deprecated
		// https://eslint.style/rules/js/lines-between-class-members#js-lines-between-class-members
		// rule is turned off, therefore remove it
		// "lines-between-class-members": "off",
		"no-cond-assign": [
			"error",
			"always"
		],
		"no-console": [
			"error",
			{
				"allow": [
					"warn"
				]
			}
		],
		"@typescript-eslint/no-empty-function": "off",
		"@typescript-eslint/no-explicit-any": "off",
		"no-lonely-if": [
			"error"
		],
		"@typescript-eslint/no-object-literal-type-assertion": "off",
		"no-shadow": "error",
		"no-throw-literal": [
			"error"
		],
		"no-unmodified-loop-condition": [
			"error"
		],
		"no-unneeded-ternary": [
			"error"
		],
		"@typescript-eslint/no-unused-vars": "off",
		"@typescript-eslint/no-use-before-define": "off",
		"no-useless-call": [
			"error"
		],
		"no-var": "error",
		"prefer-arrow-callback": "error",
		"prefer-rest-params": "off",
		// deprecated
		// https://eslint.style/rules/ts/quote-props#ts-quote-props
		"quote-props": [
			"error",
			"as-needed"
		],
		// deprecated
		// https://eslint.style/rules/ts/quotes#ts-quotes
		"quotes": [
			"error",
			"double",
			{
				"avoidEscape": true
			}
		],
		"sort-imports": [
			"error",
			{
				"ignoreCase": true,
				"ignoreDeclarationSort": true,
				"ignoreMemberSort": false,
				"memberSyntaxSortOrder": [
					"none",
					"all",
					"multiple",
					"single"
				]
			}
		],
		// deprecated
		// https://eslint.style/rules/js/spaced-comment#js-spaced-comment
		"spaced-comment": [
			"error",
			"always",
			{
				"line": {
					"exceptions": [
						"-"
					]
				},
				"block": {
					"balanced": true
				}
			}
		]
	}
};

export default tseslint.config(
	tseslint.configs.recommended,
	customConfig,
	{
		files: ["**/*.test.ts", "./test/**/*.ts"],
		rules: {
			"@typescript-eslint/no-unused-expressions": "off",
		}
	},
	{
		files: ["**/*.cjs"],
		rules: {
			"no-console": "off",
			"@typescript-eslint/no-require-imports": "off",
			"@typescript-eslint/no-unused-expressions": "off",
		}
	},
	{
		name: 'globally-ignored-files',
		ignores: [
			"**/node_modules",
			"build/**/*",
			"examples/**/*.js",
			'eslint.config.mjs'
		]
	},
);
