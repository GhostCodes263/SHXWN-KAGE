const logger = require('../utils/logger');
const { normalizeMessage } = require('../utils/messageNormalizer');
const { handleCommand, loadCommands } = require('./commandHandler');
const { checkBadWords } = require('../middleware/moderation');
const { checkAntiLink } = require('../middleware/antiLink');
const { checkAntiSpam } = require('../middleware/antiSpam');

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

  // Run moderation checks
  await checkBadWords(sock, context);
  await checkAntiLink(sock, context);
  await checkAntiSpam(sock, context);

  // Then command handling
  await handleCommand(sock, context);
}

module.exports = { handleMessage };
