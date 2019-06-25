These examples use web components (e.g. `<tone-example>`) which are defined in the [Tonejs/ui](https://github.com/Tonejs/ui) repository.

### Running examples locally

Check out the repository, and from the root run:

```
$ npm install
...
$ npm run build
```

Once this is done, you can start a local server with Python:

```
$ python -m SimpleHTTPServer 8000
```

Then, from a browser visit http://localhost:8000/examples. (See also: [installation instructions on the wiki](https://github.com/Tonejs/Tone.js/wiki/Installation#newbie-macos-quickstart-to-get-examples-running))

### Adding examples

To contribute examples, please follow the current style of the examples. Add your example's title and file name to `js/ExampleList.json` file for it to appear in the examples list on the index page. (cf. [CONTRIBUTING.md](https://github.com/Tonejs/Tone.js/blob/dev/.github/CONTRIBUTING.md))
