const fs = require('fs');
const path = require('path');
const pino = require('pino');
const config = require('../config');

const isDev = config.environment !== 'production';

// Ensure logs directory exists
const logDir = path.resolve(config.rootDir, 'logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

const streams = [{ stream: process.stdout }];

if (isDev) {
  try {
    const pretty = require('pino-pretty');
    streams[0] = {
      stream: pretty({
        colorize: true,
        translateTime: 'SYS:standard',
        ignore: 'pid,hostname'
      })
    };
  } catch (err) {
    // pino-pretty not available; raw stdout will be used
  }
}

// Add file stream for persistent logs
const logFile = path.join(logDir, 'bot.log');
const fileStream = fs.createWriteStream(logFile, { flags: 'a' });
streams.push({ stream: fileStream });

const logger = pino(
  { level: config.logLevel || 'info' },
  pino.multistream(streams)
);

module.exports = logger;
