const os = require('os');
const path = require('path');
const fs = require('fs');

const root = path.resolve(__dirname, '..');

// Try loading configuration
let configLoaded = false;
let configError = null;

try {
  const config = require('../src/config');
  configLoaded = true;
} catch (error) {
  configError = error.message;
}

const requiredPaths = [
  'src',
  'config',
  'database',
  'logs',
  'scripts',
  'package.json',
  '.env.example',
  '.gitignore',
  'README.md'
];

const missing = requiredPaths.filter((p) => !fs.existsSync(path.join(root, p)));

console.log('╔══════════════════════════════════╗');
console.log('║        SHXWN-KAGE HEALTH         ║');
console.log('╠══════════════════════════════════╣');
console.log(`║ Node.js      : ${process.version}`);
console.log(`║ Platform     : ${process.platform} ${process.arch}`);
console.log(`║ Project root : ${root}`);
console.log(`║ Required dirs: ${missing.length === 0 ? 'OK' : 'MISSING'}`);
console.log(`║ Config loaded: ${configLoaded ? 'OK' : 'FAILED'}`);

if (configError) {
  console.log(`║ Config error : ${configError.slice(0, 40)}`);
}

if (missing.length > 0) {
  console.log(`║ Missing      : ${missing.join(', ')}`);
  console.log('╚══════════════════════════════════╝');
  console.error(`\nHealth check FAILED. Missing: ${missing.join(', ')}`);
  process.exit(1);
}

if (!configLoaded) {
  console.log('╚══════════════════════════════════╝');
  console.error('\nHealth check FAILED. Configuration could not be loaded.');
  process.exit(1);
}

console.log('╚══════════════════════════════════╝');
console.log('\nHEALTH CHECK PASSED ✅');
process.exit(0);
