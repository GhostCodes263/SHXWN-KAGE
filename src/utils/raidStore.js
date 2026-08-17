const fs = require('fs');
const path = require('path');
const config = require('../config');
const logger = require('./logger');

const RAID_FILE = path.resolve(config.rootDir, 'database', 'raid.json');

function ensureFile() {
  if (!fs.existsSync(RAID_FILE)) {
    fs.mkdirSync(path.dirname(RAID_FILE), { recursive: true });
    fs.writeFileSync(RAID_FILE, '{}', 'utf8');
  }
}

function readSettings() {
  ensureFile();
  try {
    return JSON.parse(fs.readFileSync(RAID_FILE, 'utf8'));
  } catch (err) {
    logger.error(err, 'Failed to read raid settings');
    return {};
  }
}

function writeSettings(data) {
  ensureFile();
  fs.writeFileSync(RAID_FILE, JSON.stringify(data, null, 2), 'utf8');
}

function getGroupSettings(groupJid) {
  const settings = readSettings();
  if (!settings[groupJid]) {
    return {
      enabled: false,
      threshold: 5,      // joins per minute
      action: 'lockdown', // lockdown | kick | ban
      locked: false,
      joinCount: 0,
      lastJoinTime: 0
    };
  }
  return settings[groupJid];
}

function updateGroupSettings(groupJid, partial) {
  const settings = readSettings();
  const current = settings[groupJid] || {
    enabled: false,
    threshold: 5,
    action: 'lockdown',
    locked: false,
    joinCount: 0,
    lastJoinTime: 0
  };
  settings[groupJid] = { ...current, ...partial };
  writeSettings(settings);
}

function resetJoinCount(groupJid) {
  const settings = readSettings();
  if (settings[groupJid]) {
    settings[groupJid].joinCount = 0;
    settings[groupJid].lastJoinTime = Date.now();
    writeSettings(settings);
  }
}

module.exports = {
  getGroupSettings,
  updateGroupSettings,
  resetJoinCount
};
