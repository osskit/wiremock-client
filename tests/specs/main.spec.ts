import { createMapping, waitForCalls, hasMadeCalls, HttpMethod, reset, setGlobalConfiguration } from '../../src/index.js';

interface Body {
  field1: string;
  numberField: number;
  array: { field2: string }[];
}

const body = { field1: 'value1', numberField: 1234, array: [{ field2: 'value2' }] };
const firstBody = { field1: 'value1', numberField: 1234, array: [{ field2: 'someValue' }] };
const secondBody = { field1: 'value1', numberField: 12_345, array: [{ field2: 'someValue' }] };

describe('tests', () => {
  beforeEach(async () => {
    setGlobalConfiguration({});
    await reset();
  });

  describe('setGlobalConfiguration', () => {
    it('replaces the global configuration', async () => {
      setGlobalConfiguration({ baseUrl: 'http://localhost:9090' });
      const request = await createMapping({ request: { urlPathPattern: '/someUrl', method: HttpMethod.Post } });

      await fetch('http://localhost:9090/someUrl', { method: HttpMethod.Post, body: JSON.stringify(body) });
      await expect(hasMadeCalls(request)).resolves.toBeTruthy();
    });
  });

  describe('waitForCalls', () => {
    it('returns calls information for post request', async () => {
      const request = await createMapping({ request: { urlPathPattern: '/someUrl', method: HttpMethod.Post } });

      await fetch('http://localhost:8080/someUrl', {
        method: HttpMethod.Post,
        body: JSON.stringify(body),
        // eslint-disable-next-line @typescript-eslint/naming-convention
        headers: { 'Content-Type': 'application/json' },
      });
      await fetch('http://localhost:8080/someUrl', { method: HttpMethod.Post, body: JSON.stringify(body) });

      const calls = await waitForCalls(request);

      expect(calls).toHaveLength(2);
      expect(calls).toMatchSnapshot([{ loggedDate: expect.any(Number) }, { loggedDate: expect.any(Number) }]);
    });

    it('returns calls information for get request', async () => {
      const request = await createMapping({ request: { urlPathPattern: '/someUrl', method: HttpMethod.Get } });

      await fetch('http://localhost:8080/someUrl?someQueryParam=someValue', {
        method: HttpMethod.Get,
      });

      const calls = await waitForCalls(request);

      expect(calls).toHaveLength(1);
      expect(calls).toMatchSnapshot([{ loggedDate: expect.any(Number) }]);
    });

    it('returns calls information for different request method to the same url', async () => {
      const putRequest = await createMapping({ request: { urlPathPattern: '/someUrl', method: HttpMethod.Put } });
      const postRequest = await createMapping({ request: { urlPathPattern: '/someUrl', method: HttpMethod.Post } });

      await fetch('http://localhost:8080/someUrl', {
        method: HttpMethod.Post,
        body: JSON.stringify(body),
        // eslint-disable-next-line @typescript-eslint/naming-convention
        headers: { 'Content-Type': 'application/json' },
      });

      await fetch('http://localhost:8080/someUrl', {
        method: HttpMethod.Put,
        body: JSON.stringify(body),
        // eslint-disable-next-line @typescript-eslint/naming-convention
        headers: { 'Content-Type': 'application/json' },
      });

      const putCalls = await waitForCalls(putRequest);

      expect(putCalls).toHaveLength(1);
      expect(putCalls).toMatchSnapshot([{ loggedDate: expect.any(Number) }]);

      const postCalls = await waitForCalls(postRequest);

      expect(postCalls).toHaveLength(1);
      expect(putCalls).toMatchSnapshot([{ loggedDate: expect.any(Number) }]);
    });

    it('returns ordered calls information', async () => {
      const request = await createMapping({ request: { urlPathPattern: '/someUrl', method: HttpMethod.Post } });

      await fetch('http://localhost:8080/someUrl', {
        method: HttpMethod.Post,
        body: JSON.stringify(secondBody),
        // eslint-disable-next-line @typescript-eslint/naming-convention
        headers: { 'Content-Type': 'application/json' },
      });

      await fetch('http://localhost:8080/someUrl', {
        method: HttpMethod.Post,
        body: JSON.stringify(firstBody),
        // eslint-disable-next-line @typescript-eslint/naming-convention
        headers: { 'Content-Type': 'application/json' },
      });

      const calls = await waitForCalls<Body>(request, {
        orderBy: (a, b) => a.body.numberField - b.body.numberField,
      });

      expect(calls).toMatchSnapshot([{ loggedDate: expect.any(Number) }, { loggedDate: expect.any(Number) }]);
    });

    it('returns bodyAsString', async () => {
      const request = await createMapping({ request: { urlPathPattern: '/someUrl', method: HttpMethod.Post } });

      await fetch('http://localhost:8080/someUrl', {
        method: HttpMethod.Post,
        body: 'yay',
      });

      const calls = await waitForCalls(request, { bodyAsString: true });

      expect(calls).toMatchSnapshot([{ loggedDate: expect.any(Number) }]);
    });
  });

  describe('createMapping', () => {
    it('returns mocked response as string on string body pattern', async () => {
      await createMapping({
        request: { urlPathPattern: '/someUrl', method: HttpMethod.Post },
        response: { status: 200, body: 'some body once told me' },
      });

      const response = await fetch('http://localhost:8080/someUrl', {
        method: HttpMethod.Post,
        body: JSON.stringify(body),
        // eslint-disable-next-line @typescript-eslint/naming-convention
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
        // eslint-disable-next-line @typescript-eslint/naming-convention
        headers: { 'Content-Type': 'application/json' },
      });

      expect(await response.text()).toMatchSnapshot();
    });
  });

  describe('hasMadeCalls', () => {
    it('returns true if calls were made', async () => {
      const request = await createMapping({
        request: { urlPathPattern: '/someUrl', method: HttpMethod.Put },
        response: { status: 204, jsonBody: [{ returnValue: 'someReturnValue' }] },
      });

      await fetch('http://localhost:8080/someUrl', { method: HttpMethod.Put, body: JSON.stringify(body) });

      await expect(hasMadeCalls(request)).resolves.toBeTruthy();
    });

    it('returns false if calls were not made', async () => {
      const request = await createMapping({
        request: { urlPathPattern: '/someUrl', method: HttpMethod.Post },
        response: { status: 204, jsonBody: [{ returnValue: 'someReturnValue' }] },
      });

      await expect(hasMadeCalls(request)).resolves.toBeFalsy();
    });
  });
});
