import { WireMockRestClient } from 'wiremock-rest-client';
import type { HttpMethod, Mapping, RequestPattern, Options, OrderBy, Request, TimeoutOptions } from './types.js';
import { waitForResults } from './waitForResults.js';

export class WireMockClient {
  private readonly wireMock: WireMockRestClient;

  constructor(baseUrl = 'http://localhost:8080') {
    this.wireMock = new WireMockRestClient(baseUrl, { logLevel: 'ERROR' });
  }

  async reset(): Promise<void> {
    await this.wireMock.global.resetAll();
  }

  async createMapping({ request, response = { status: 200 } }: Mapping): Promise<RequestPattern> {
    const stubMapping = await this.wireMock.mappings.createMapping({ request, response });

    if (!stubMapping.request) {
      throw new Error(`Failed to create mapping - ${JSON.stringify(stubMapping)}`);
    }

    return { ...stubMapping.request, method: stubMapping.request.method as HttpMethod };
  }

  async waitForCalls<Body, BodyAsString extends boolean>(request: RequestPattern, options?: Options<Body, BodyAsString>) {
    const requests = await waitForResults<Request>(async () => {
      const { requests: wiremockRequest } = await this.wireMock.requests.findRequests(request);

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
  }

  async hasMadeCalls(request: RequestPattern, timeoutOptions?: TimeoutOptions): Promise<boolean> {
    const calls = await this.waitForCalls(request, { timeoutOptions });

    return !!calls.length;
  }
}
