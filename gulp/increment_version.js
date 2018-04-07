const fs = require('fs')
const semver = require('semver')
const child_process = require('child_process')

const devVersion = child_process.execSync('npm show tone@next version').toString()
const masterVersion = child_process.execSync('npm show tone version').toString()

//go with whichever is the latest version
let version = masterVersion
if (semver.gt(devVersion, masterVersion)){
	version = devVersion
}

version = version.split('.')
//increment the patch
version[2] = parseInt(version[2]) + 1
//put it back in semver
version = version.join('.')

//write it to the package.json
const packageFile = '../package.json'
const package = JSON.parse(fs.readFileSync(packageFile, 'utf-8'))

//if the package version if the latest, go with that one
if (semver.gt(package.version, version)){
	version = package.version
}

console.log(`incrementing to version ${version}`)
package.version = version
fs.writeFileSync(packageFile, JSON.stringify(package, undefined, '  '))
