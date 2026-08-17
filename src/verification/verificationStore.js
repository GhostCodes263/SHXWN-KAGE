const fs = require('fs');
const path = require('path');
const config = require('../config');
const logger = require('../utils/logger');

const VERIFICATION_FILE = path.resolve(config.rootDir, 'database', 'verification.json');

function defaultData() {
  return {
    sessions: {},
    records: {},
    pendingGroups: {},
    verificationRequests: {},
    settings: {
      enabled: true,
      adminReview: true
    }
  };
}

function ensureFile() {
  if (!fs.existsSync(VERIFICATION_FILE)) {
    fs.mkdirSync(path.dirname(VERIFICATION_FILE), { recursive: true });
    fs.writeFileSync(VERIFICATION_FILE, JSON.stringify(defaultData(), null, 2), 'utf8');
  }
}

function readData() {
  ensureFile();
  try {
    return JSON.parse(fs.readFileSync(VERIFICATION_FILE, 'utf8'));
  } catch (err) {
    logger.error(err, 'Failed to read verification file');
    return defaultData();
  }
}

function writeData(data) {
  ensureFile();
  fs.writeFileSync(VERIFICATION_FILE, JSON.stringify(data, null, 2), 'utf8');
}

// Sessions
function getSession(userJid) {
  const data = readData();
  return data.sessions[userJid];
}
function setSession(userJid, session) {
  const data = readData();
  data.sessions[userJid] = session;
  writeData(data);
}
function deleteSession(userJid) {
  const data = readData();
  delete data.sessions[userJid];
  writeData(data);
}

// Records
function getRecord(userJid) {
  const data = readData();
  return data.records[userJid];
}
function setRecord(userJid, record) {
  const data = readData();
  data.records[userJid] = record;
  writeData(data);
}

// Pending Groups (user kicked, awaiting verification to join this group)
function setPendingGroup(userJid, groupJid) {
  const data = readData();
  data.pendingGroups[userJid] = groupJid;
  writeData(data);
}
function getPendingGroup(userJid) {
  const data = readData();
  return data.pendingGroups[userJid];
}
function clearPendingGroup(userJid) {
  const data = readData();
  delete data.pendingGroups[userJid];
  writeData(data);
}

// Verification Requests (sent to admins)
function getRequest(requestId) {
  const data = readData();
  return data.verificationRequests[requestId];
}
function setRequest(requestId, request) {
  const data = readData();
  data.verificationRequests[requestId] = request;
  writeData(data);
}
function deleteRequest(requestId) {
  const data = readData();
  delete data.verificationRequests[requestId];
  writeData(data);
}
function getAllRequests() {
  const data = readData();
  return data.verificationRequests || {};
}

// Settings
function getSettings() {
  const data = readData();
  return data.settings || { enabled: true, adminReview: true };
}
function updateSettings(partial) {
  const data = readData();
  data.settings = { ...data.settings, ...partial };
  writeData(data);
}

module.exports = {
  getSession,
  setSession,
  deleteSession,
  getRecord,
  setRecord,
  setPendingGroup,
  getPendingGroup,
  clearPendingGroup,
  getRequest,
  setRequest,
  deleteRequest,
  getAllRequests,
  getSettings,
  updateSettings
};
