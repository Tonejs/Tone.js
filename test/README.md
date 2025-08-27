Both Chrome and Firefox are required to run the run the full set of tests.

## Basic

To run tests in both browsers headlessly and report the results:

`npm run test`

## Selective Testing

To test only individual directory:

`npm run test --group=[core,component,effect,event,instrument,signal,source]`

Or in watch mode:

`npm run test:watch --group=[core,component,effect,event,instrument,signal,source]`
