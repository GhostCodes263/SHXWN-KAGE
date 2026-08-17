const fs = require('fs');
const path = require('path');
const config = require('../config');
const logger = require('./logger');

const ANTILINK_FILE = path.resolve(config.rootDir, 'database', 'antilink.json');

function ensureFile() {
  if (!fs.existsSync(ANTILINK_FILE)) {
    fs.mkdirSync(path.dirname(ANTILINK_FILE), { recursive: true });
    fs.writeFileSync(ANTILINK_FILE, '{}', 'utf8');
  }
}

function readSettings() {
  ensureFile();
  try {
    return JSON.parse(fs.readFileSync(ANTILINK_FILE, 'utf8'));
  } catch (err) {
    logger.error(err, 'Failed to read antilink settings');
    return {};
  }
}

function writeSettings(data) {
  ensureFile();
  fs.writeFileSync(ANTILINK_FILE, JSON.stringify(data, null, 2), 'utf8');
}

/**
 * Get settings for a group, or defaults.
 */
function getGroupSettings(groupJid) {
  const settings = readSettings();
  if (!settings[groupJid]) {
    return {
      enabled: false,
      action: 'warn', // warn | delete | kick | ban
      whitelist: []
    };
  }
  return settings[groupJid];
}

function updateGroupSettings(groupJid, partial) {
  const settings = readSettings();
  const current = settings[groupJid] || {
    enabled: false,
    action: 'warn',
    whitelist: []
  };
  settings[groupJid] = { ...current, ...partial };
  writeSettings(settings);
}

function addDomainToWhitelist(groupJid, domain) {
  const settings = readSettings();
  const current = settings[groupJid] || {
    enabled: false,
    action: 'warn',
    whitelist: []
  };
  const lower = domain.toLowerCase();
  if (!current.whitelist.includes(lower)) {
    current.whitelist.push(lower);
    settings[groupJid] = current;
    writeSettings(settings);
  }
}

function removeDomainFromWhitelist(groupJid, domain) {
  const settings = readSettings();
  const current = settings[groupJid] || {
    enabled: false,
    action: 'warn',
    whitelist: []
  };
  const lower = domain.toLowerCase();
  current.whitelist = current.whitelist.filter((d) => d !== lower);
  settings[groupJid] = current;
  writeSettings(settings);
}

module.exports = {
  getGroupSettings,
  updateGroupSettings,
  addDomainToWhitelist,
  removeDomainFromWhitelist
};
