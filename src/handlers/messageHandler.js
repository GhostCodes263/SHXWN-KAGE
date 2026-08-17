const logger = require('../utils/logger');
const { normalizeMessage } = require('../utils/messageNormalizer');
const { handleCommand, loadCommands } = require('./commandHandler');

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

  await handleCommand(sock, context);
}

module.exports = { handleMessage };
