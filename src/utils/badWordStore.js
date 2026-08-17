const fs = require('fs');
const path = require('path');
const config = require('../config');
const logger = require('./logger');

const BADWORDS_FILE = path.resolve(config.rootDir, 'database', 'badwords.json');

function ensureFile() {
  if (!fs.existsSync(BADWORDS_FILE)) {
    fs.mkdirSync(path.dirname(BADWORDS_FILE), { recursive: true });
    fs.writeFileSync(BADWORDS_FILE, '[]', 'utf8');
  }
}

function readBadWords() {
  ensureFile();
  try {
    return JSON.parse(fs.readFileSync(BADWORDS_FILE, 'utf8'));
  } catch (err) {
    logger.error(err, 'Failed to read bad words file');
    return [];
  }
}

function writeBadWords(words) {
  ensureFile();
  fs.writeFileSync(BADWORDS_FILE, JSON.stringify(words, null, 2), 'utf8');
}

function addBadWord(word) {
  const words = readBadWords();
  const lower = word.toLowerCase();
  if (!words.includes(lower)) {
    words.push(lower);
    writeBadWords(words);
  }
}

function removeBadWord(word) {
  const words = readBadWords();
  const lower = word.toLowerCase();
  const newWords = words.filter((w) => w !== lower);
  writeBadWords(newWords);
}

function getBadWords() {
  return readBadWords();
}

module.exports = {
  addBadWord,
  removeBadWord,
  getBadWords
};
