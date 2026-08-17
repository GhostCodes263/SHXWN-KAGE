const fs = require('fs');
const path = require('path');
const config = require('../config');
const logger = require('./logger');

const SPAM_FILE = path.resolve(config.rootDir, 'database', 'spam.json');

function ensureFile() {
  if (!fs.existsSync(SPAM_FILE)) {
    fs.mkdirSync(path.dirname(SPAM_FILE), { recursive: true });
    fs.writeFileSync(SPAM_FILE, '{}', 'utf8');
  }
}

function readSettings() {
  ensureFile();
  try {
    return JSON.parse(fs.readFileSync(SPAM_FILE, 'utf8'));
  } catch (err) {
    logger.error(err, 'Failed to read spam settings');
    return {};
  }
}

function writeSettings(data) {
  ensureFile();
  fs.writeFileSync(SPAM_FILE, JSON.stringify(data, null, 2), 'utf8');
}

function getGroupSettings(groupJid) {
  const settings = readSettings();
  if (!settings[groupJid]) {
    return {
      enabled: false,
      action: 'warn', // warn | delete | kick | ban
      maxMessages: 5,
      windowSeconds: 10,
      maxDuplicates: 3,
      floodThreshold: 5,
      floodWindow: 10
    };
  }
  return settings[groupJid];
}

function updateGroupSettings(groupJid, partial) {
  const settings = readSettings();
  const current = settings[groupJid] || {
    enabled: false,
    action: 'warn',
    maxMessages: 5,
    windowSeconds: 10,
    maxDuplicates: 3,
    floodThreshold: 5,
    floodWindow: 10
  };
  settings[groupJid] = { ...current, ...partial };
  writeSettings(settings);
}

module.exports = {
  getGroupSettings,
  updateGroupSettings
};
