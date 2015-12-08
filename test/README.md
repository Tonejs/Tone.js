`gulp test` from within the gulp folder to start a server and run all of the tests. 

Individual files can be tested by running `gulp collectTests -f [Tone class name]` which will update the test/Main.js with the given class tests. 

You can also test groups of classes by folder by adding another flag. For example to test all of the signals run `gulp collectTests --signal`. or the shorthand form: `gulp collectTests -s`. 

* `-s` = `--signal`
* `-i` = `--instrument`
* `-o` = `--source`
* `-v` = `--event`
* `-e` = `--effect`
* `-c` = `--core`
* `-m` = `--component`
* `-t` = `--control`

Currently, Chrome is the target test platform. 100% of tests should pass. Fewer tests tends to pass in Safari and even fewer in Firefox. The goal is to have 100% pass on all browsers, but since the speicification and implementations are all relatively new, there are still a few kinks to work out. 

Be sure that the browser window is in focus while tests are running. Timing in Tone.js is done using requestAnimationFrame which fires at a low priority or no priority if the tab is not in focus. 