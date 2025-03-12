import type { Config } from '@jest/types';

const config: Config.InitialOptions = {
    rootDir: '../../',
    preset: 'ts-jest',
    testEnvironment: 'node',
    transform: {
        '^.+\\.ts$': ['ts-jest', { tsconfig: 'tsconfig.json' }],
    },
    testMatch: ['<rootDir>/src/tests/**/*.test.ts'],
    moduleFileExtensions: ['ts', 'js', 'json', 'node'],
};

export default config;
