const config = require('./config');
const logger = require('./utils/logger');
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

logger.info('Configuration loaded');
logger.info(
  {
    botName: config.botName,
    owner: config.ownerName,
    prefix: config.botPrefix,
    environment: config.environment
  },
  'Bot configuration'
);

logger.info('Starting WhatsApp connection...');

startWhatsApp(config).catch((err) => {
  logger.fatal(err, 'Failed to start WhatsApp connection');
  process.exit(1);
});
