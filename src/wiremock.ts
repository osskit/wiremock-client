import { WireMockRestClient } from 'wiremock-rest-client';
import type { Call, Configuration, Mapping, Request, RequestPattern, TimeoutOptions, HttpMethod } from './types';
import { LogLevel } from './types';
import { waitForResults } from './waitForResults';

let wireMock = new WireMockRestClient('http://localhost:8080', {
  logLevel: 'error',
});

export const create = (
  // eslint-disable-next-line unicorn/no-object-as-default-parameter
  { baseUrl, logLevel, continueOnFailure }: Configuration = {
    baseUrl: 'http://localhost:8080',
    logLevel: LogLevel.Error,
  },
) => {
  wireMock = new WireMockRestClient(baseUrl, { logLevel, continueOnFailure });
};

export const reset = (): Promise<void> => wireMock.global.resetAll();

export const createMapping = async ({ request, response = { status: 200 } }: Mapping): Promise<RequestPattern> => {
  const stubMapping = await wireMock.mappings.createMapping({ request, response });

  if (!stubMapping.request) {
    throw new Error(`Failed to create mapping - ${JSON.stringify(stubMapping)}`);
  }

  return { ...stubMapping.request, method: stubMapping.request.method as HttpMethod };
};

const parseBody = (body: string): Record<string, any> | string => {
  try {
    return JSON.parse(body);
  } catch {
    return body;
  }
};

export const waitForCalls = async (request: RequestPattern, options?: TimeoutOptions): Promise<Call[]> => {
  const requests = await waitForResults<Request>(async () => {
    const { requests } = await wireMock.requests.findRequests(request);

    return requests;
  }, options);

  return requests.map(({ url, method, body, headers, queryParams }) => ({
    url,
    method: method as HttpMethod,
    headers,
    queryParams,
    body: parseBody(body),
  }));
};

export const hasMadeCalls = async (request: RequestPattern): Promise<boolean> => {
  const calls = await waitForCalls(request);

  return !!calls.length;
};
