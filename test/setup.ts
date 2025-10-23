import 'dotenv/config';

// Setup global test environment
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-key-for-jwt';
process.env.JWT_EXPIRES_IN = '1h';
process.env.DB_HOST = 'localhost';
process.env.DB_PORT = '5432';
process.env.DB_USER = 'postgres';
process.env.DB_PASS = 'postgres';
process.env.DB_NAME = 'access_control_test';

// Increase timeout for e2e tests
jest.setTimeout(30000);
