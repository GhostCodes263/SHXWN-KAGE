const os = require('os');
const path = require('path');
const fs = require('fs');

const root = path.resolve(__dirname, '..');

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

if (missing.length > 0) {
  console.log(`║ Missing      : ${missing.join(', ')}`);
  console.log('╚══════════════════════════════════╝');
  console.error(`\nHealth check FAILED. Missing: ${missing.join(', ')}`);
  process.exit(1);
}

console.log('╚══════════════════════════════════╝');
console.log('\nHEALTH CHECK PASSED ✅');
process.exit(0);
