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
export interface ExpressionContains {
  expression: string;
  contains: string;
}

export interface ExpressionEqualsToJson {
  expression: string;
  equalToJson: string;
}

export type MatchesJson = ExpressionContains | ExpressionEqualsToJson;

export interface MatchesJsonPath {
  matchesJsonPath: MatchesJson | string;
}

export interface MatchesJsonSchema {
  matchesJsonSchema: Record<string, unknown>;
}

export enum ComparisonType {
  ATTR_NAME_LOOKUP = 'ATTR_NAME_LOOKUP',
  ATTR_VALUE = 'ATTR_VALUE',
  ATTR_VALUE_EXPLICITLY_SPECIFIED = 'ATTR_VALUE_EXPLICITLY_SPECIFIED',
  CHILD_LOOKUP = 'CHILD_LOOKUP',
  CHILD_NODELIST_LENGTH = 'CHILD_NODELIST_LENGTH',
  CHILD_NODELIST_SEQUENCE = 'CHILD_NODELIST_SEQUENCE',
  DOCTYPE_NAME = 'DOCTYPE_NAME',
  DOCTYPE_PUBLIC_ID = 'DOCTYPE_PUBLIC_ID',
  DOCTYPE_SYSTEM_ID = 'DOCTYPE_SYSTEM_ID',
  ELEMENT_NUM_ATTRIBUTES = 'ELEMENT_NUM_ATTRIBUTES',
  ELEMENT_TAG_NAME = 'ELEMENT_TAG_NAME',
  HAS_DOCTYPE_DECLARATION = 'HAS_DOCTYPE_DECLARATION',
  NAMESPACE_PREFIX = 'NAMESPACE_PREFIX',
  NAMESPACE_URI = 'NAMESPACE_URI',
  NO_NAMESPACE_SCHEMA_LOCATION = 'NO_NAMESPACE_SCHEMA_LOCATION',
  NODE_TYPE = 'NODE_TYPE',
  PROCESSING_INSTRUCTION_DATA = 'PROCESSING_INSTRUCTION_DATA',
  PROCESSING_INSTRUCTION_TARGET = 'PROCESSING_INSTRUCTION_TARGET',
  SCHEMA_LOCATION = 'SCHEMA_LOCATION',
  TEXT_VALUE = 'TEXT_VALUE',
  XML_ENCODING = 'XML_ENCODING',
  XML_STANDALONE = 'XML_STANDALONE',
  XML_VERSION = 'XML_VERSION',
}

export enum NamespaceAwareness {
  STRICT = 'STRICT',
  LEGACY = 'LEGACY',
  NONE = 'NONE',
}

export interface EqualsToXml {
  equalToXml: string;
  enablePlaceholders?: boolean;
  placeholderOpeningDelimiterRegex?: string;
  placeholderClosingDelimiterRegex?: string;
  exemptedComparisons?: ComparisonType[];
  ignoreOrderOfSameNode?: boolean;
  namespaceAwareness?: NamespaceAwareness;
  expression?: string;
}

export interface MatchesXPath {
  matchesXPath: EqualsToXml | string;
  xPathNamespaces?: Record<string, string>;
}

export interface BinaryEqualsTo {
  binaryEqualsTo: string;
}

export interface EqualsToJson {
  equalToJson: Record<string, unknown> | string;
  ignoreArrayOrder?: boolean;
  ignoreExtraElements?: boolean;
}

export type BodyPattern = BinaryEqualsTo | EqualsToJson | MatchesJson | MatchesJsonPath | MatchesJsonSchema | MatchesXPath;

export interface RequestPattern {
  url?: string;
  urlPathPattern?: string;
  method?: HttpMethod;
  queryParameters?: Record<string, any>;
  bodyPatterns?: BodyPattern[] | Record<string, any>[];
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
  scenarioName?: string;
  requiredScenarioState?: string;
  targetScenarioState?: string;
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
