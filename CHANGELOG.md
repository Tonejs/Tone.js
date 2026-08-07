# Changelog

## [15.5.36](https://github.com/Tonejs/Tone.js/compare/15.1.22...HEAD)

### Features

- Analyzer template to infer channel count from constructor ([#1451](https://github.com/Tonejs/Tone.js/pull/1451)) (`0e670e3`)
- typescript "strict" ([#1446](https://github.com/Tonejs/Tone.js/pull/1446)) (`a3cf2f8`)
- option to use usermedia constraints ([#1330](https://github.com/Tonejs/Tone.js/pull/1330)) (`e112093`)
- onContextRunning ([#1407](https://github.com/Tonejs/Tone.js/pull/1407)) (`b28244a`)
- Deprecating getConstant ([#1406](https://github.com/Tonejs/Tone.js/pull/1406)) (`95311c2`)
- added width argument for AutoPanner ([#1399](https://github.com/Tonejs/Tone.js/pull/1399)) (`4b6117d`)
- Reverse delay ([#1395](https://github.com/Tonejs/Tone.js/pull/1395)) (`1cb07e6`)
- Transport.setTicksAtTime and Transport.setSecondsAtTime ([#1375](https://github.com/Tonejs/Tone.js/pull/1375)) (`e9612ec`)
- Player Progress ([#1364](https://github.com/Tonejs/Tone.js/pull/1364)) (`e8ca4c2`)

### Bug Fixes

- **test:** remove focused test modifiers ([#1453](https://github.com/Tonejs/Tone.js/pull/1453)) (`ac4cd10`)
- Checking for circular dependencies ([#1447](https://github.com/Tonejs/Tone.js/pull/1447)) (`4847d58`)
- Making clearInterval more efficient ([#1445](https://github.com/Tonejs/Tone.js/pull/1445)) (`b63dd9a`)
- Double tick trigger ([#1444](https://github.com/Tonejs/Tone.js/pull/1444)) (`24276e8`)
- handles playbackRate adjustment with Player ([#1443](https://github.com/Tonejs/Tone.js/pull/1443)) (`a766f61`)
- Offline callbacks use OfflineContext for rendering ([#1442](https://github.com/Tonejs/Tone.js/pull/1442)) (`95ae107`)
- TransportTime quantization issue ([#1441](https://github.com/Tonejs/Tone.js/pull/1441)) (`4579ea7`)
- npm publish ([#1413](https://github.com/Tonejs/Tone.js/pull/1413)) (`4438089`)
- --access public on publish ([#1412](https://github.com/Tonejs/Tone.js/pull/1412)) (`13d16a6`)
- fix npm perms ([#1411](https://github.com/Tonejs/Tone.js/pull/1411)) (`d0cbeb0`)
- updating npm perms ([#1410](https://github.com/Tonejs/Tone.js/pull/1410)) (`78a7a9b`)
- npm token ([#1409](https://github.com/Tonejs/Tone.js/pull/1409)) (`a017e66`)
- Updating NPM permissions ([#1408](https://github.com/Tonejs/Tone.js/pull/1408)) (`4f8033c`)
- minimum meter value ([#1404](https://github.com/Tonejs/Tone.js/pull/1404)) (`5dd4f61`)
- clean up oscillator connections onended ([#1393](https://github.com/Tonejs/Tone.js/pull/1393)) (`d27e6c1`)
- setting seconds fails with certain times ([#1380](https://github.com/Tonejs/Tone.js/pull/1380)) (`4150a22`)
- Connect and disconnect using signalConnect / signalDisconnect (`797dae4`)
- Signal disconnect ([#1373](https://github.com/Tonejs/Tone.js/pull/1373)) (`13df9b3`)
- **ci:** only run semantic pull request on pull_request ([#1367](https://github.com/Tonejs/Tone.js/pull/1367)) (`4ff2e8d`)

### Documentation

- Fix typo in effectSend comment ([#1398](https://github.com/Tonejs/Tone.js/pull/1398)) (`8f019fc`)
- update clock docs (`ee43c94`)
- Export Transport, Destination, Listener and Draw ([#1371](https://github.com/Tonejs/Tone.js/pull/1371)) (`fdaf8c1`)

### Chores

- Adding PR links to the CHANGELOG.md ([#1478](https://github.com/Tonejs/Tone.js/pull/1478)) (`fe84ff9`)
- putting skip comment in the body ([#1466](https://github.com/Tonejs/Tone.js/pull/1466)) (`c12e12a`)
- updating to version 24 ([#1465](https://github.com/Tonejs/Tone.js/pull/1465)) (`22518d5`)
- **deps:** Bump esbuild and @web/dev-server-esbuild ([#1460](https://github.com/Tonejs/Tone.js/pull/1460)) (`7220375`)
- fixing release auth ([#1464](https://github.com/Tonejs/Tone.js/pull/1464)) (`5f62bc3`)
- release uses bot ([#1463](https://github.com/Tonejs/Tone.js/pull/1463)) (`fd6c7e6`)
- setting up releases ([#1462](https://github.com/Tonejs/Tone.js/pull/1462)) (`fabcd14`)
- npm audit fix ([#1440](https://github.com/Tonejs/Tone.js/pull/1440)) (`4a00df5`)
- **deps:** Bump qs and express ([#1437](https://github.com/Tonejs/Tone.js/pull/1437)) (`cf7062b`)
- fix coverage link and type context-running tests ([#1435](https://github.com/Tonejs/Tone.js/pull/1435)) (`106c934`)
- **deps:** Bump ip-address and socks ([#1433](https://github.com/Tonejs/Tone.js/pull/1433)) (`843be22`)
- **deps:** Bump picomatch ([#1426](https://github.com/Tonejs/Tone.js/pull/1426)) (`4e030e8`)
- **deps:** Bump minimatch ([#1416](https://github.com/Tonejs/Tone.js/pull/1416)) (`db13709`)
- **deps:** Bump qs and body-parser ([#1403](https://github.com/Tonejs/Tone.js/pull/1403)) (`723ad4e`)
- **deps:** Bump qs and express ([#1396](https://github.com/Tonejs/Tone.js/pull/1396)) (`a96eb37`)
- **deps:** Bump on-headers and compression ([#1356](https://github.com/Tonejs/Tone.js/pull/1356)) (`feffad4`)
- updating license year ([#1372](https://github.com/Tonejs/Tone.js/pull/1372)) (`0174ba4`)
- **ci:** only running title validator on PR ([#1370](https://github.com/Tonejs/Tone.js/pull/1370)) (`36f67b6`)
- **ci:** updating Tone.js version on semantic release ([#1369](https://github.com/Tonejs/Tone.js/pull/1369)) (`37e9862`)
- **ci:** Adding semantic release ([#1368](https://github.com/Tonejs/Tone.js/pull/1368)) (`b74399e`)
- small nit change to changelog (`20fa955`)
- updating Changelog (`32ce675`)

## [15.1.22](https://github.com/Tonejs/Tone.js/compare/14.7.39...15.1.22) — 2025-04-27

### Features

- sub-tick scheduling (`33e14d0`)

### Bug Fixes

- loading non relative URLs (`f7bdff0`)
- load base64 encoded sounds when baseUrl is not empty (`a771811`)
- should set _sync in this.sync (`75f591a`)
