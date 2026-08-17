require('dotenv').config();

const path = require('path');
const defaults = require('../../config/default');

const env = process.env;

// Normalise owner number to ensure it has no spaces or leading +
function normalizeNumber(value) {
  if (!value) return undefined;
  return value.replace(/[^0-9]/g, '');
}

const config = {
  botName: env.BOT_NAME || defaults.botName,
  botPrefix: env.BOT_PREFIX || defaults.botPrefix,
  ownerName: env.OWNER_NAME || defaults.ownerName,
  ownerNumber: normalizeNumber(env.OWNER_NUMBER || defaults.ownerNumber),
  environment: env.NODE_ENV || defaults.environment,
  logLevel: env.LOG_LEVEL || defaults.logLevel,
  sessionPath: env.SESSION_PATH || defaults.sessionPath,
  databaseUrl: env.DATABASE_URL || defaults.databaseUrl,
  // Absolute path to project root
  rootDir: path.resolve(__dirname, '..', '..')
};

// Validate critical values
if (!config.botName || !config.botPrefix || !config.ownerNumber) {
  console.error('CONFIG ERROR: Missing critical configuration values.');
  console.error('Please check your .env file.');
  process.exit(1);
}

if (config.ownerNumber.length < 10) {
  console.warn('WARNING: Owner number looks too short. Check it is in international format without +.');
}

module.exports = config;
