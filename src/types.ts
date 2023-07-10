export enum HttpMethod {
  Get = 'GET',
  Put = 'PUT',
  Post = 'POST',
  Delete = 'DELETE',
  Patch = 'PATCH',
}

export interface Configuration {
  baseUrl: string;
}

export interface RequestPattern {
  url?: string;
  urlPathPattern?: string;
  method?: HttpMethod;
  queryParameters?: Record<string, any>;
  bodyPatterns?: Record<string, any>[];
  headers?: Record<string, any>;
}

interface SuccessResponse {
  status: number;
  jsonBody?: Record<string, any>;
  headers?: Record<string, any>;
  transformers?: string[];
  body?: string;
  base64Body?: string;
}

interface FailureResponse {
  fault: 'CONNECTION_RESET_BY_PEER' | 'EMPTY_RESPONSE' | 'MALFORMED_RESPONSE_CHUNK' | 'RANDOM_DATA_THEN_CLOSE';
}

export type Response = FailureResponse | SuccessResponse;

export interface Mapping {
  request: RequestPattern;
  response?: Response;
  priority?: number;
}

export interface Call<Body> {
  url: string;
  method: HttpMethod;
  body: Body;
  headers: Record<string, any>;
  queryParams: Record<string, any>;
  loggedDate: number;
}

export interface Request {
  headers: Record<string, string>;
  method: string;
  queryParams: Record<string, any>;
  body: string;
  url: string;
  loggedDate: number;
}

export interface TimeoutOptions {
  timeoutInMs: number;
  intervalInMs: number;
}

export type OrderBy<Body> = (a: Call<Body>, b: Call<Body>) => number;

export interface Options<Body, BodyAsString extends boolean> {
  timeoutOptions?: TimeoutOptions;
  orderBy?: OrderBy<Body>;
  bodyAsString?: BodyAsString;
}

export interface WaitForCallsFunction {
  <Body>(request: RequestPattern, options?: Options<Body, false>): Promise<Call<Body>[]>;
  (request: RequestPattern, options?: Options<string, true>): Promise<Call<string>[]>;
}
