import type { Configuration, Mapping, RequestPattern, TimeoutOptions, Options, WaitForCallsFunction } from './types';
import { WireMockClient } from './wireMockClient.js';

export const defaultConfiguration: Readonly<Configuration> = {
  baseUrl: 'http://localhost:8080',
};

let wireMockClient = new WireMockClient();

export const setGlobalConfiguration = ({ baseUrl }: Partial<Configuration>) => {
  wireMockClient = new WireMockClient(baseUrl);
};

export const reset = async (): Promise<void> => {
  await wireMockClient.reset();
};

export const createMapping = (mapping: Mapping): Promise<RequestPattern> => wireMockClient.createMapping(mapping);

export const waitForCalls: WaitForCallsFunction = async <Body, BodyAsString extends boolean>(
  request: RequestPattern,
  options?: Options<Body, BodyAsString>,
) => wireMockClient.waitForCalls(request, options);

export const hasMadeCalls = (request: RequestPattern, timeoutOptions?: TimeoutOptions): Promise<boolean> =>
  wireMockClient.hasMadeCalls(request, timeoutOptions);
