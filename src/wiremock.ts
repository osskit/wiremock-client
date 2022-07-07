import { WireMockRestClient } from 'wiremock-rest-client';
import type { JsonValue } from 'type-fest';
import type { Call, Configuration, Mapping, Request, RequestPattern, TimeoutOptions, HttpMethod, Options } from './types';
import { LogLevel } from './types.js';
import { waitForResults } from './waitForResults.js';

const defaultConfiguration = {
  baseUrl: 'http://localhost:8080',
  logLevel: LogLevel.Error,
};
let wireMock = new WireMockRestClient(defaultConfiguration.baseUrl, {
  logLevel: defaultConfiguration.logLevel,
});

export const create = (configuration: Configuration) => {
  const { logLevel, continueOnFailure, baseUrl } = { ...defaultConfiguration, ...configuration };

  wireMock = new WireMockRestClient(baseUrl, { logLevel, continueOnFailure });
};

export const reset = async (): Promise<void> => {
  await wireMock.global.resetAll();
};

export const createMapping = async ({ request, response = { status: 200 } }: Mapping): Promise<RequestPattern> => {
  const stubMapping = await wireMock.mappings.createMapping({ request, response });

  if (!stubMapping.request) {
    throw new Error(`Failed to create mapping - ${JSON.stringify(stubMapping)}`);
  }

  return { ...stubMapping.request, method: stubMapping.request.method as HttpMethod };
};

interface WaitForCallsFunction {
  (request: RequestPattern, options?: Options<true>): Promise<Call<string>[]>;
  <Body extends JsonValue>(request: RequestPattern, options?: Options<false>): Promise<Call<Body>[]>;
}

export const waitForCalls: WaitForCallsFunction = async <Body, BodyAsString extends boolean>(
  request: RequestPattern,
  options?: Options<BodyAsString>,
) => {
  const requests = await waitForResults<Request>(async () => {
    const { requests: wiremockRequest } = await wireMock.requests.findRequests(request);

    return wiremockRequest;
  }, options?.timeoutOptions);

  const calls = requests.map(({ url, method, body, headers, queryParams, loggedDate }) => ({
    url,
    method: method as HttpMethod,
    headers,
    queryParams,
    body: options?.bodyAsString ? body : (JSON.parse(body) as Body),
    loggedDate,
  }));

  if (options?.orderBy) {
    calls.sort(options.orderBy);
  }

  return calls;
};

export const hasMadeCalls = async (request: RequestPattern, timeoutOptions?: TimeoutOptions): Promise<boolean> => {
  const calls = await waitForCalls(request, { timeoutOptions });

  return !!calls.length;
};
