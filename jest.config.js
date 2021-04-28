const { pathsToModuleNameMapper } = require('ts-jest/utils')
const { compilerOptions } = require('./tsconfig.json')

module.exports = {
  roots: ['<rootDir>/src'],
  preset: 'ts-jest',
  transform: { '^.+\\.(ts|tsx|js|jsx)?$': 'ts-jest' },
  testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.tsx?$',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  moduleDirectories: ['src', 'node_modules'],
  moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths, {
    prefix: '<rootDir>/',
  }),
  testEnvironment: 'node',
  setupFiles: ['./src/shared/infra/database/prisma/utils/clearAllData.js'],
  globalSetup: './src/shared/infra/database/prisma/utils/setupPrismaSchema.js',
  globalTeardown: './src/shared/infra/database/prisma/utils/dropPrismaSchema.js',
  verbose: true,
  collectCoverage: true,
  collectCoverageFrom: ['<rootDir>/src/**/*.ts'],
}
