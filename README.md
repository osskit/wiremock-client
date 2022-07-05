<p align="center">
<img width="300" height="200" src="https://user-images.githubusercontent.com/15312980/175097744-6f69f4a6-f11d-4b16-8857-225d0cdecffe.svg" />
  </p>

  <div align="center">
  
# wiremock-client

## Useful common functions to easily use wiremock 
</div>

## Install
```
yarn add @osskit/wiremock-client
```

## API

### create

Creates a client with the given configuration: base url, log level and if to continue on failure.

Defaults:
* baseUrl = 'http://localhost:8080'
* logLevel: LogLevel = LogLevel.Error
* continueOnFailure = true

#### Usage
```ts
create({baseUrl: 'http://localhost:9090', configuration: {logLevel: LogLevel.Warn, continueOnFailure: false}})
```

### reset

Resets the requests' mapping (async method).

#### Usage
```ts
describe('tests', () => {
  beforeEach(async () => {
    await reset();
  })});
```

### createMapping

Creates mapping between request and response for the mocks to return (async method). 
Returns a promise to the request, so it can later be used to get he calls or check if the request was made.

Defaults:
* response: { status: 200 }

#### Usage
```ts
const request = await createMapping({
      request: { urlPathPattern: '/someUrl', method: HttpMethod.Put },
      response: { status: 204, jsonBody: [{ returnValue: 'someReturnValue' }] },
    });
```

### waitForCalls

Return a promise to the calls that was made with the given request pattern, ordered by a given orderBy method 
(optional).
It waits to get the 
requests from 
wiremock with the given timeout and interval (async 
method).


Defaults:
* options: { timeoutOptions: { timeoutInMs: 3000, intervalInMs: 500 } }


#### Usage
```ts
const request = await createMapping({ request: { urlPathPattern: '/someUrl', method: HttpMethod.Post } });

await fetch('http://localhost:8080/someUrl', { method: HttpMethod.Post, body: JSON.stringify(body1) });
await fetch('http://localhost:8080/someUrl', { method: HttpMethod.Post, body: JSON.stringify(body2) });

const calls = await waitForCalls(request, { timeoutOptions: { timeoutInMs: 5000, intervalInMs: 1000 }, orderBy: (
      {loggedDate: first}: Call, {loggedDate: second}: Call) => first - second});

expect(calls).toHaveLength(2);
expect(calls).toMatchSnapshot();
```

### hasMadeCalls

Returns a promise to a boolean representing if any calls with the given request pattern were made (async method).

Defaults:
* timeoutOptions: { timeoutInMs: 3000, intervalInMs: 500 }

### Usage
```ts
const request = await createMapping({
      request: { urlPathPattern: '/someUrl', method: HttpMethod.Post },
      response: { status: 204, jsonBody: [{ returnValue: 'someReturnValue' }] },
    });

expect(await hasMadeCalls(request)).toBeFalsy();
```
