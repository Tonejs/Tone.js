Both Chrome and Firefox are required to run the run the full set of tests.

## Basic

To run tests in both browsers headlessly and report the results:

`npm run test`

## Browser

To run tests in a Chrome browser not in headless mode which allows you to debug from the console:

`npm run test:browser`

## Selective Testing

To test only an individual file:

`npm run test --file=Signal`

Or to run on an entire directory:

`npm run test --dir=signal`
