const config = require('./config');
const { startWhatsApp } = require('./whatsapp/connection');

console.log('╔══════════════════════════════════╗');
console.log('║        SHXWN-KAGE CORE           ║');
console.log('╠══════════════════════════════════╣');
console.log(`║ Status       : INITIALIZING      ║`);
console.log(`║ Environment  : ${config.environment.toUpperCase().padEnd(16)}║`);
console.log(`║ Engine       : NODE.JS           ║`);
console.log(`║ Database     : NOT CONNECTED     ║`);
console.log(`║ WhatsApp     : CONNECTING        ║`);
console.log(`║ Security     : NOT LOADED        ║`);
console.log('╚══════════════════════════════════╝');

console.log('\n[✓] Configuration loaded');
console.log(`    Bot name   : ${config.botName}`);
console.log(`    Owner      : ${config.ownerName} (${config.ownerNumber})`);
console.log(`    Prefix     : ${config.botPrefix}`);
console.log(`    Environment: ${config.environment}`);

console.log('\n[✓] Starting WhatsApp connection...');
startWhatsApp(config).catch((err) => {
  console.error('Failed to start WhatsApp connection:', err);
  process.exit(1);
});
