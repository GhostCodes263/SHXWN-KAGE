const fs = require('fs');
const path = require('path');
const config = require('../config');
const logger = require('./logger');

const OWNERS_FILE = path.resolve(config.rootDir, 'database', 'owners.json');

function ensureFile() {
  if (!fs.existsSync(OWNERS_FILE)) {
    fs.mkdirSync(path.dirname(OWNERS_FILE), { recursive: true });
    fs.writeFileSync(OWNERS_FILE, '[]', 'utf8');
  }
}

function readOwners() {
  ensureFile();
  try {
    return JSON.parse(fs.readFileSync(OWNERS_FILE, 'utf8'));
  } catch (err) {
    logger.error(err, 'Failed to read owners file');
    return [];
  }
}

function writeOwners(owners) {
  ensureFile();
  fs.writeFileSync(OWNERS_FILE, JSON.stringify(owners, null, 2), 'utf8');
}

function addOwner(number) {
  const owners = readOwners();
  if (!owners.includes(number)) {
    owners.push(number);
    writeOwners(owners);
    return true;
  }
  return false;
}

function removeOwner(number) {
  const owners = readOwners();
  const newOwners = owners.filter((n) => n !== number);
  writeOwners(newOwners);
  return newOwners.length !== owners.length;
}

function getOwners() {
  return readOwners();
}

module.exports = {
  addOwner,
  removeOwner,
  getOwners
};
