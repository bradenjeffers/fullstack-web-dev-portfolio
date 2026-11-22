// Central configuration. Everything comes from environment variables (optionally
// loaded from a local .env file); nothing secret is hard-coded.
require('dotenv').config();

const NODE_ENV = process.env.NODE_ENV || 'development';
const IS_TEST = NODE_ENV === 'test';
const IS_PRODUCTION = NODE_ENV === 'production';

function requireEnv(name, hint) {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Missing required environment variable ${name}. ${hint}\n` +
        'Copy .env.example to .env and fill it in.'
    );
  }
  return value;
}

// The secret signs session tokens, so there is deliberately no fallback outside
// the test environment: a forgotten variable must stop the server, not weaken it.
const JWT_SECRET_KEY = IS_TEST
  ? process.env.JWT_SECRET_KEY || 'test-only-secret-not-for-real-use'
  : requireEnv(
      'JWT_SECRET_KEY',
      "Generate one with: node -e \"console.log(require('crypto').randomBytes(48).toString('hex'))\""
    );

// Tests wipe collections, so they always use a separate database from development.
const DATABASE_URI = IS_TEST
  ? process.env.TEST_DATABASE_URI || 'mongodb://127.0.0.1:27017/food_order_app_test'
  : IS_PRODUCTION
  ? requireEnv('DATABASE_URI', 'Set it to your MongoDB connection string.')
  : process.env.DATABASE_URI || 'mongodb://127.0.0.1:27017/food_order_app';

// `??` keeps an explicit PORT=0 (random free port, used by the tests).
const SERVER_PORT = Number(process.env.PORT ?? 8080);

const TOKEN_EXPIRATION_DURATION = process.env.JWT_EXPIRES_IN || '7d';

// Low cost factor in tests only, to keep the suite fast.
const BCRYPT_ROUNDS = IS_TEST ? 4 : 10;

// Mutable on purpose so tests can flip it. See README: it exists so the first
// admin can be created in development; keep it off anywhere that is exposed.
const runtimeFlags = {
  allowAdminSignup: process.env.ALLOW_ADMIN_SIGNUP === 'true',
};

module.exports = {
  NODE_ENV,
  IS_TEST,
  JWT_SECRET_KEY,
  SERVER_PORT,
  DATABASE_URI,
  TOKEN_EXPIRATION_DURATION,
  BCRYPT_ROUNDS,
  runtimeFlags,
};
