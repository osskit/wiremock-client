<p align="center">
<img width="300" height="200" src="https://user-images.githubusercontent.com/15312980/175097744-6f69f4a6-f11d-4b16-8857-225d0cdecffe.svg" />
  </p>

  <div align="center">
  
# wiremock-client

## Useful common functions to easily use wiremock

</div>

## Install

```sh
yarn add --dev @osskit/wiremock-client
```

## Usage

```ts
import { setGlobalConfiguration, reset, createMapping, hasMadeCalls, waitForCalls } from '@osskit/wiremock-client';

setGlobalConfiguration({ baseUrl: 'http://localhost:9090' });

describe('tests', () => {
  beforeEach(async () => {
    await reset();
  });

  // check if a call has been made
  it('hasMadeCalls', async () => {
    const request = await createMapping({ request: { urlPathPattern: '/someUrl', method: HttpMethod.Post } });

    await fetch('http://localhost:9090/someUrl', { method: HttpMethod.Post, body: "{}" });
    await expect(hasMadeCalls(request)).resolves.toBeTruthy();
  });

  // validate the calls that has been made
  it('waitForCalls', async () => {
    const request = await createMapping({ request: { urlPathPattern: '/someUrl', method: HttpMethod.Post } });

    await fetch('http://localhost:9090/someUrl', { method: HttpMethod.Post, body: "{}" });

    const calls = await waitForCalls(request);

    expect(calls).toHaveLength(1);
    expect(calls[0]).toHaveProperty('body', {});
  });
```

## API

### setGlobalConfiguration(options)

Overrides the global configuration for the wiremock client.
Usually called once at the start of the tests.

#### options

Type: `object`

##### baseUrl?

Type: `string`\
Default: `http://localhost:8080`

The url to the `wiremock` server.

### reset()

Resets the requests' mapping.

Returns a `Promise<void>`.

### createMapping(mapping)

Creates mapping between request and response for the mocks to return.
Returns a `Promise` to the request, so it can later be used to get the calls or check if the request was made.

#### mapping

Type: `object`

##### request

Type: `RequestPattern`

The pattern to match requests

###### url?

Type: `string`

###### urlPathPattern?

Type: `string`

###### method?

Type: `HttpMethod`

###### queryParameters?

Type: `Record<string, any>`

###### bodyPatterns?

Type: `Record<string, any>[]`

##### response?

Type: `Response`\
Default: `{ status: 200 }`

###### status

Type: `number`

###### jsonBody?

Type: `Record<string, any>`

###### headers?

Type: `Record<string, any>`

###### body?

Type: `string`

###### base64Body?

Type: `string`

### waitForCalls(request, options?)

Return a `Promise` to the calls that was made with the given request pattern.
Can be optionally ordered by a given `orderBy` method.
It waits to get the
requests from
wiremock with the given timeout and interval.

Defaults:

- options: { timeoutOptions: { timeoutInMs: 3000, intervalInMs: 500 } }

#### request

Type: `RequestPattern`

#### options

Type: `object`

##### timeoutOptions

Type: `TimeoutOptions`\
Default: `{ timeoutInMs: 3000, intervalInMs: 500 }`

The options for waiting until calls has been made.

##### orderBy(callA, callB)?

Type: `Function`

An optional function to sort the returning calls, returns a `number`.

##### bodyAsString?

Type: `boolean`

Wheter to treat the `body` of the requests as `string`.

### hasMadeCalls(request, timeoutOptions?)

Returns a `Promise` to a `boolean` representing if any calls with the given request pattern were made.

#### request

Type: `RequestPattern`

#### timeoutOptions

Type: `TimeoutOptions`\
Default: `{ timeoutInMs: 3000, intervalInMs: 500 }`

The options for waiting until calls has been made.
