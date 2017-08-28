I am currently using two test runners: [mocha](https://mochajs.org/) and [karma](https://github.com/karma-runner/karma) + mocha. 

From within the gulp folder, run `gulp karma-test` to collect all of the files, launch a local server and run the tests.

Be sure that the browser window is in focus while tests are running. 

Individual files can be tested by running `gulp collectTests -f [Tone class name]` which will update the test/Main.js with the given class' tests. You can then refresh the `test/index.html` page to rerun those tests. 

You can also test groups of classes by folder by adding another flag. For example to test all of the signals run `gulp collectTests --signal`. or the shorthand form: `gulp collectTests -s`. 

* `-s` = `--signal`
* `-i` = `--instrument`
* `-o` = `--source`
* `-v` = `--event`
* `-e` = `--effect`
* `-c` = `--core`
* `-m` = `--component`
* `-t` = `--control`

The tests target the latest [specification](https://webaudio.github.io/web-audio-api/) and not any specific browser. I have been keeping a list of which features browsers/versions currently support in `test/helper/Supports.js`. Some tests are only conditionally run if that feature is supported on the platform. 