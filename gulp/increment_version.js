const fs = require('fs')
const child_process = require('child_process')

const dev = process.env.TRAVIS && process.env.TRAVIS_BRANCH === 'dev' || true

let version = child_process.execSync(`npm show tone${dev?'@next':''} version`).toString()
version = version.split('.')
//increment the patch
version[2] = parseInt(version[2]) + 1
//put it back in semver
version = version.join('.')

//write it to the package.json
const packageFile = '../package.json' 
const package = JSON.parse(fs.readFileSync(packageFile, 'utf-8'))
package.version = version
fs.writeFileSync(packageFile, JSON.stringify(package, undefined, '  '))
