const config = require('./config');

console.log('╔══════════════════════════════════╗');
console.log('║        SHXWN-KAGE CORE           ║');
console.log('╠══════════════════════════════════╣');
console.log(`║ Status       : INITIALIZING      ║`);
console.log(`║ Environment  : ${config.environment.toUpperCase().padEnd(16)}║`);
console.log(`║ Engine       : NODE.JS           ║`);
console.log(`║ Database     : NOT CONNECTED     ║`);
console.log(`║ WhatsApp     : NOT CONNECTED     ║`);
console.log(`║ Security     : NOT LOADED        ║`);
console.log('╚══════════════════════════════════╝');

console.log('\n[✓] Configuration loaded');
console.log(`    Bot name   : ${config.botName}`);
console.log(`    Owner      : ${config.ownerName} (${config.ownerNumber})`);
console.log(`    Prefix     : ${config.botPrefix}`);
console.log(`    Environment: ${config.environment}`);

console.log('\nStage 2 initialisation complete.');
console.log('No WhatsApp connection yet. No commands loaded yet.');
