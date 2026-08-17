const fs = require('fs');
const path = require('path');
const qrcode = require('qrcode-terminal');
const pino = require('pino');
const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion,
  makeCacheableSignalKeyStore
} = require('@whiskeysockets/baileys');

const logger = require('../utils/logger');
const { handleMessage } = require('../handlers/messageHandler');

const baileysLogger = pino({ level: 'warn' });

async function startWhatsApp(config) {
  const sessionDir = path.resolve(config.rootDir, config.sessionPath);
  if (!fs.existsSync(sessionDir)) {
    fs.mkdirSync(sessionDir, { recursive: true });
  }

  const { state, saveCreds } = await useMultiFileAuthState(sessionDir);
  const { version, isLatest } = await fetchLatestBaileysVersion();

  logger.info(`WhatsApp version: ${version} ${isLatest ? '(latest)' : ''}`);

  const sock = makeWASocket({
    version,
    auth: {
      creds: state.creds,
      keys: makeCacheableSignalKeyStore(state.keys, baileysLogger)
    },
    logger: baileysLogger,
    printQRInTerminal: false,
    browser: ['SHXWN-KAGE', 'Chrome', '1.0.0'],
    markOnlineOnConnect: true,
    syncFullHistory: false
  });

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      console.log('\n╔══════════════════════════════════╗');
      console.log('║        SCAN THIS QR CODE         ║');
      console.log('╚══════════════════════════════════╝\n');
      qrcode.generate(qr, { small: true });
      console.log('\n[~] Scan with WhatsApp → Linked Devices → Link a Device');
    }

    if (connection === 'connecting') {
      logger.info('Connecting to WhatsApp...');
    } else if (connection === 'open') {
      logger.info('WhatsApp connection established');
      logger.info(`Logged in as: ${sock.user?.name || sock.user?.id}`);
    } else if (connection === 'close') {
      const statusCode = lastDisconnect?.error?.output?.statusCode;
      const shouldReconnect = statusCode !== DisconnectReason.loggedOut;

      logger.warn(`WhatsApp connection closed (status: ${statusCode}).`);

      if (shouldReconnect) {
        logger.info('Reconnecting in 5 seconds...');
        setTimeout(() => {
          startWhatsApp(config).catch((err) => {
            logger.error(err, 'Reconnection failed');
          });
        }, 5000);
      } else {
        logger.error('Logged out. Please delete the sessions folder and restart.');
      }
    }
  });

  // Listen for new messages
  sock.ev.on('messages.upsert', async ({ messages, type }) => {
    if (type !== 'notify') return;

    for (const msg of messages) {
      try {
        await handleMessage(sock, msg);
      } catch (err) {
        logger.error(err, 'Error handling message');
      }
    }
  });

  return sock;
}

module.exports = { startWhatsApp };
