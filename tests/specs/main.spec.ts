import fetch from 'node-fetch';
import { createMapping, waitForCalls, hasMadeCalls, HttpMethod, LogLevel, reset, create } from '../../dist';

const body = { field1: 'value1', numberField: 1234, array: [{ field2: 'value2' }] };

describe('tests', () => {
  beforeEach(async () => {
    create();
    await reset();
  });

  it('create creates a new client with different configuration ', async () => {
    create({ baseUrl: 'http://localhost:9090', logLevel: LogLevel.Warn, continueOnFailure: false });
    const request = await createMapping({ request: { urlPathPattern: '/someUrl', method: HttpMethod.Post } });

    await fetch('http://localhost:9090/someUrl', { method: HttpMethod.Post, body: JSON.stringify(body) });
    expect(await hasMadeCalls(request)).toBeTruthy();
  });

  it('waitForCalls get the calls information', async () => {
    const request = await createMapping({ request: { urlPathPattern: '/someUrl', method: HttpMethod.Post } });

    await fetch('http://localhost:8080/someUrl', {
      method: HttpMethod.Post,
      body: JSON.stringify(body),
      headers: { 'Content-Type': 'application/json' },
    });
    await fetch('http://localhost:8080/someUrl', { method: HttpMethod.Post, body: JSON.stringify(body) });

    const calls = await waitForCalls(request);

    expect(calls).toHaveLength(2);
    expect(calls).toMatchSnapshot();
  });

  it('waitForCalls get the calls information for get request', async () => {
    const request = await createMapping({ request: { urlPathPattern: '/someUrl', method: HttpMethod.Get } });

    await fetch('http://localhost:8080/someUrl?someQueryParam=someValue', {
      method: HttpMethod.Get,
      headers: { 'Content-Type': 'application/json' },
    });

    const calls = await waitForCalls(request);

    expect(calls).toHaveLength(1);
    expect(calls).toMatchSnapshot();
  });

  it('waitForCalls get the calls information for different request method to the same url', async () => {
    const putRequest = await createMapping({ request: { urlPathPattern: '/someUrl', method: HttpMethod.Put } });
    const postRequest = await createMapping({ request: { urlPathPattern: '/someUrl', method: HttpMethod.Post } });

    await fetch('http://localhost:8080/someUrl', {
      method: HttpMethod.Post,
      body: JSON.stringify(body),
      headers: { 'Content-Type': 'application/json' },
    });

    await fetch('http://localhost:8080/someUrl', {
      method: HttpMethod.Put,
      body: JSON.stringify(body),
      headers: { 'Content-Type': 'application/json' },
    });

    const putCalls = await waitForCalls(putRequest);

    expect(putCalls).toHaveLength(1);
    expect(putCalls).toMatchSnapshot();

    const postCalls = await waitForCalls(postRequest);

    expect(postCalls).toHaveLength(1);
    expect(postCalls).toMatchSnapshot();
  });

  it('returns mocked response as string on string body pattern', async () => {
    await createMapping({
      request: { urlPathPattern: '/someUrl', method: HttpMethod.Post },
      response: { status: 200, body: 'some body once told me' },
    });

    const response = await fetch('http://localhost:8080/someUrl', {
      method: HttpMethod.Post,
      body: JSON.stringify(body),
      headers: { 'Content-Type': 'application/json' },
    });

    expect(await response.text()).toMatchSnapshot();
  });

  it('returns mocked response as string on base64Body pattern', async () => {
    await createMapping({
      request: { urlPathPattern: '/someUrl', method: HttpMethod.Post },
      response: { status: 200, body: 'c29tZSBib2R5IG9uY2UgdG9sZCBtZQ==' },
    });

    const response = await fetch('http://localhost:8080/someUrl', {
      method: HttpMethod.Post,
      body: JSON.stringify(body),
      headers: { 'Content-Type': 'application/json' },
    });

    expect(await response.text()).toMatchSnapshot();
  });

  it('hasMadeCalls returns true if calls were made', async () => {
    const request = await createMapping({
      request: { urlPathPattern: '/someUrl', method: HttpMethod.Put },
      response: { status: 204, jsonBody: [{ returnValue: 'someReturnValue' }] },
    });

    await fetch('http://localhost:8080/someUrl', { method: HttpMethod.Put, body: JSON.stringify(body) });

    expect(await hasMadeCalls(request)).toBeTruthy();
  });

  it('hasMadeCalls returns false if calls were not made', async () => {
    const request = await createMapping({
      request: { urlPathPattern: '/someUrl', method: HttpMethod.Post },
      response: { status: 204, jsonBody: [{ returnValue: 'someReturnValue' }] },
    });

    expect(await hasMadeCalls(request)).toBeFalsy();
  });
});
