import { WireMockRestClient } from 'wiremock-rest-client';
import type { Call, Configuration, Mapping, Request, RequestPattern, TimeoutOptions, HttpMethod, Options, OrderBy } from './types';
import { waitForResults } from './waitForResults.js';

export const defaultConfiguration: Readonly<Configuration> = {
  baseUrl: 'http://localhost:8080',
};

const globalConfiguraiton: Configuration = { ...defaultConfiguration };

let wireMock = new WireMockRestClient(globalConfiguraiton.baseUrl, { logLevel: 'ERROR' });

export const setGlobalConfiguration = ({ baseUrl }: Partial<Configuration>) => {
  if (baseUrl) {
    globalConfiguraiton.baseUrl = baseUrl;
  }

  wireMock = new WireMockRestClient(globalConfiguraiton.baseUrl, { logLevel: 'ERROR' });
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
  <Body>(request: RequestPattern, options?: Options<Body, false>): Promise<Call<Body>[]>;
  (request: RequestPattern, options?: Options<string, true>): Promise<Call<string>[]>;
}

export const waitForCalls: WaitForCallsFunction = async <Body, BodyAsString extends boolean>(
  request: RequestPattern,
  options?: Options<Body, BodyAsString>,
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
    body: body && (options?.bodyAsString ? body : (JSON.parse(body) as Body)),
    loggedDate,
  }));

  if (options?.orderBy) {
    calls.sort(options.orderBy as OrderBy<Body | string>);
  }

  return calls;
};

export const hasMadeCalls = async (request: RequestPattern, timeoutOptions?: TimeoutOptions): Promise<boolean> => {
  const calls = await waitForCalls(request, { timeoutOptions });

  return !!calls.length;
};
