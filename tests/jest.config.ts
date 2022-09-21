import type { InitialOptionsTsJest } from 'ts-jest';

const config: InitialOptionsTsJest = {
  preset: 'ts-jest/presets/default-esm',
  testEnvironment: 'node',
  extensionsToTreatAsEsm: ['.ts'],
  transform: {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        useESM: true,
        isolatedModules: true,
        diagnostics: {
          exclude: ['!**/*.spec.ts'],
        },
      },
    ],
  },
  moduleNameMapper: {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
};

export default config;
