module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    roots: ['<rootDir>/src'],
    testMatch: ['**/__tests__/**/*.ts', '**/*.test.ts', '**/*.spec.ts'],
    collectCoverageFrom: [
        'src/**/*.ts',
        '!src/**/*.d.ts',
        '!src/**/*.test.ts'
    ],
    "coveragePathIgnorePatterns": [
        "/node_modules/",
        "<rootDir>/src/main.ts"
    ]
};