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

export interface Response {
  status: number;
  jsonBody?: Record<string, any>;
  headers?: Record<string, any>;
  body?: string;
  base64Body?: string;
}

export interface Mapping {
  request: RequestPattern;
  response?: Response;
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
