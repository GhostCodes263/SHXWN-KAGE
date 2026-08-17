const logger = require('../utils/logger');
const { normalizeMessage } = require('../utils/messageNormalizer');

/**
 * Handles incoming WhatsApp messages.
 * For now, only logs normalized messages. Command handling will come later.
 */
async function handleMessage(sock, msg) {
  const context = normalizeMessage(msg, sock);

  logger.info(
    {
      id: context.id,
      from: context.remoteJid,
      sender: context.sender,
      isGroup: context.isGroup,
      text: context.text,
      mediaType: context.mediaType
    },
    'Incoming message'
  );

  // Placeholder for future command handler
}

module.exports = { handleMessage };
