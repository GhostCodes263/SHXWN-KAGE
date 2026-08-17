const fs = require('fs');
const path = require('path');
const config = require('../config');
const logger = require('./logger');

const WARNINGS_FILE = path.resolve(config.rootDir, 'database', 'warnings.json');

function ensureFile() {
  if (!fs.existsSync(WARNINGS_FILE)) {
    fs.mkdirSync(path.dirname(WARNINGS_FILE), { recursive: true });
    fs.writeFileSync(WARNINGS_FILE, '{}', 'utf8');
  }
}

function readWarnings() {
  ensureFile();
  try {
    return JSON.parse(fs.readFileSync(WARNINGS_FILE, 'utf8'));
  } catch (err) {
    logger.error(err, 'Failed to read warnings file');
    return {};
  }
}

function writeWarnings(data) {
  ensureFile();
  fs.writeFileSync(WARNINGS_FILE, JSON.stringify(data, null, 2), 'utf8');
}

/**
 * Add a warning for a user in a specific group.
 * @param {string} groupJid - The group JID.
 * @param {string} userJid - The user JID (e.g., 263...@s.whatsapp.net)
 * @param {string} reason - Reason for warning (optional).
 * @param {string} warnedBy - JID of the admin who issued the warning.
 */
function addWarning(groupJid, userJid, reason, warnedBy) {
  const data = readWarnings();
  const key = `${groupJid}:${userJid}`;
  if (!data[key]) {
    data[key] = {
      groupJid,
      userJid,
      warnings: []
    };
  }
  data[key].warnings.push({
    reason: reason || 'No reason provided',
    warnedBy,
    timestamp: Date.now()
  });
  writeWarnings(data);
  return data[key].warnings.length;
}

/**
 * Get warnings for a user in a group.
 * @returns {Array} Array of warning objects.
 */
function getWarnings(groupJid, userJid) {
  const data = readWarnings();
  const key = `${groupJid}:${userJid}`;
  return data[key] ? data[key].warnings : [];
}

/**
 * Clear all warnings for a user in a group.
 */
function clearWarnings(groupJid, userJid) {
  const data = readWarnings();
  const key = `${groupJid}:${userJid}`;
  delete data[key];
  writeWarnings(data);
}

/**
 * Get total warning count for a user in a group.
 */
function getWarningCount(groupJid, userJid) {
  return getWarnings(groupJid, userJid).length;
}

module.exports = {
  addWarning,
  getWarnings,
  clearWarnings,
  getWarningCount
};
