export enum LogLevel {
  Trace = 'trace',
  Debug = 'debug',
  Info = 'info',
  Warn = 'warn',
  Error = 'error',
  Silent = 'silent',
}

export enum HttpMethod {
  Get = 'GET',
  Put = 'PUT',
  Post = 'POST',
  Delete = 'DELETE',
  Patch = 'PATCH',
}

export interface Configuration {
  baseUrl: string;
  logLevel: LogLevel;
  continueOnFailure?: boolean;
}

export interface RequestPattern {
  url?: string;
  urlPathPattern?: string;
  method?: HttpMethod;
  queryParameters?: Record<string, any>;
  bodyPatterns?: Record<string, any>[];
}

export interface ResponsePattern {
  status: number;
  jsonBody?: Record<string, any>;
  headers?: Record<string, any>;
  body?: string;
  base64Body?: string;
}

export interface Mapping {
  request: RequestPattern;
  response?: ResponsePattern;
}

export type Body = Record<string, any> | string;

export interface Call {
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

export type OrderBy = (a: Call, b: Call) => number;

export interface Options {
  timeoutOptions?: TimeoutOptions;
  orderBy?: OrderBy;
}
