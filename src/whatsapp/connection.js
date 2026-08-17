const fs = require('fs');
const path = require('path');
const qrcode = require('qrcode-terminal');
const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion,
  makeCacheableSignalKeyStore
} = require('@whiskeysockets/baileys');
const pino = require('pino');

// Set up a basic logger for Baileys — set to warn to reduce noise but allow important logs
const logger = pino({ level: 'warn' });

/**
 * Starts the WhatsApp connection and returns the socket.
 * This function will attempt to reconnect on unexpected disconnection.
 */
async function startWhatsApp(config) {
  const sessionDir = path.resolve(config.rootDir, config.sessionPath);
  if (!fs.existsSync(sessionDir)) {
    fs.mkdirSync(sessionDir, { recursive: true });
  }

  const { state, saveCreds } = await useMultiFileAuthState(sessionDir);
  const { version, isLatest } = await fetchLatestBaileysVersion();

  console.log(`[✓] WhatsApp version: ${version} ${isLatest ? '(latest)' : ''}`);

  const sock = makeWASocket({
    version,
    auth: {
      creds: state.creds,
      keys: makeCacheableSignalKeyStore(state.keys, logger)
    },
    logger,
    printQRInTerminal: false, // We handle QR manually
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
      // Print QR code using qrcode-terminal (small mode for terminal readability)
      qrcode.generate(qr, { small: true });
      console.log('\n[~] Scan with WhatsApp → Linked Devices → Link a Device');
    }

    if (connection === 'connecting') {
      console.log('[~] Connecting to WhatsApp...');
    } else if (connection === 'open') {
      console.log('╔══════════════════════════════════╗');
      console.log('║        SHXWN-KAGE CORE           ║');
      console.log('╠══════════════════════════════════╣');
      console.log('║ WhatsApp     : CONNECTED         ║');
      console.log('╚══════════════════════════════════╝');
      console.log('\n[✓] WhatsApp connection established.');
      console.log(`[✓] Logged in as: ${sock.user?.name || sock.user?.id}`);
    } else if (connection === 'close') {
      const statusCode = lastDisconnect?.error?.output?.statusCode;
      const shouldReconnect = statusCode !== DisconnectReason.loggedOut;

      console.warn(`[!] WhatsApp connection closed (status: ${statusCode}).`);

      if (shouldReconnect) {
        console.log('[~] Reconnecting in 5 seconds...');
        setTimeout(() => {
          startWhatsApp(config).catch((err) => {
            console.error('Reconnection failed:', err);
          });
        }, 5000);
      } else {
        console.error('[✗] Logged out. Please delete the sessions folder and restart.');
      }
    }
  });

  return sock;
}

module.exports = { startWhatsApp };
