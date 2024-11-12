// jest.config.js
module.exports = {
    testEnvironment: 'node',  // Suitable for Node.js API testing
    coverageDirectory: 'coverage',  // Directory for coverage reports
    collectCoverage: true,  // Enable code coverage
    collectCoverageFrom: [
      'controllers/*.js',   // Track coverage for controllers
      'routes/*.js'         // Track coverage for routes
    ],
  };