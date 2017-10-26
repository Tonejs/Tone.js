module.exports = {
    "env": {
        "browser": true,
        "es6": true,
		"amd" : true
    },
    "extends": "eslint:recommended",
    "rules": {
        "indent": [
            "error", "tab", { "SwitchCase": 1 }
        ],
        "linebreak-style": [
            "error", "unix"
        ],
		/*"valid-jsdoc": [
            "error"
        ],*/
		/*"lines-around-comment" : [
			"error", {"beforeBlockComment": true}
		],*/
		"quote-props" : [
			"error", "consistent" /*"as-needed"*/
		],
        "quotes": [
            "error","double"
        ],
		"block-spacing": [
            "error", "always"
        ],
		"func-call-spacing" : [
			"error", "never"
		],
		"no-lonely-if" : [
			"error"
		],
		"key-spacing" : [
			"error", {"beforeColon" : true, "afterColon" : true}
		],
		"brace-style": [
            "error", "1tbs"
        ],
        "semi": [
            "error", "always"
        ]
    }
};
