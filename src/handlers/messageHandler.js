const logger = require('../utils/logger');
const { normalizeMessage } = require('../utils/messageNormalizer');
const { handleCommand, loadCommands } = require('./commandHandler');
const { checkBadWords } = require('../middleware/moderation');
const { checkAntiLink } = require('../middleware/antiLink');
const { checkAntiSpam } = require('../middleware/antiSpam');
const { handleInput: handleVerificationInput, handleAdminResponse } = require('../verification/verificationEngine');
const { getSession } = require('../verification/verificationStore');

let commandsLoaded = false;

async function handleMessage(sock, msg) {
  if (!commandsLoaded) {
    loadCommands();
    commandsLoaded = true;
  }

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

  // Handle admin response (button or yes/no)
  await handleAdminResponse(sock, context);

  // If private and user has active verification session, route to verification input
  if (!context.isGroup && context.text && !context.text.startsWith('.')) {
    const session = getSession(context.sender);
    if (session) {
      await handleVerificationInput(sock, context);
      return;
    }
  }

  // Moderation checks
  await checkBadWords(sock, context);
  await checkAntiLink(sock, context);
  await checkAntiSpam(sock, context);

  // Command handling
  await handleCommand(sock, context);
}

module.exports = { handleMessage };
