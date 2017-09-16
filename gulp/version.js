const fs = require('fs')


var VERSION = fs.readFileSync(`${process.argv[2]}/Tone/core/Tone.js`, 'utf-8')
		.match(/(?:Tone\.version\s*=\s*)(?:'|")(.*)(?:'|");/m)[1];

console.log(VERSION)
