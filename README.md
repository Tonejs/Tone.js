Tone.js
=========

A collection of building blocks extending and wrapping the Web Audio API


Tone.js can be used with or without require.js

## require.js

There are a couple ways to use the tone library with require.js and r.js. 

You can include the Tone.js build (located in the build folder), as one of the deps in your require.config

```javascript
require.config({
    baseUrl: './base',
    deps : ["../deps/Tone.js/build/Tone"],
});
```

or alternatively, keep the directory structure the same and make a path which points to the Tone directory

```javascript
require.config({
    baseUrl: './base',
    paths: {
        "Tone" : "../deps/Tone.js/Tone"
    }
});
```
## without require.js

To use Tone.js without require, just add the build source in a script tag at the top of your page. Tone will add itself and all its components to the global context. 