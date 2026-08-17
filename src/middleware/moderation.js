const logger = require('../utils/logger');
const { getBadWords } = require('../utils/badWordStore');
const { addWarning } = require('../utils/warningStore');
const { commandBox, styledLine } = require('../utils/format');

/**
 * Checks a message for bad words and takes action.
 */
async function checkBadWords(sock, normalizedMessage) {
  // Only check text messages, not commands
  if (!normalizedMessage.text) return;
  if (normalizedMessage.text.startsWith('.')) return;  // skip commands

  const badWords = getBadWords();
  if (!badWords.length) return;

  const lowerText = normalizedMessage.text.toLowerCase();
  const foundWord = badWords.find((word) => lowerText.includes(word));

  if (foundWord) {
    logger.info(`Bad word detected: "${foundWord}" from ${normalizedMessage.sender}`);

    if (normalizedMessage.isGroup) {
      const count = addWarning(
        normalizedMessage.remoteJid,
        normalizedMessage.sender,
        `Used bad word: ${foundWord}`,
        'SYSTEM'
      );

      // Try to delete the message
      try {
        await sock.sendMessage(normalizedMessage.remoteJid, {
          delete: { remoteJid: normalizedMessage.remoteJid, id: normalizedMessage.id }
        });
      } catch (err) {
        logger.warn(`Could not delete message: ${err.message}`);
      }

      const lines = [
        styledLine('User', normalizedMessage.sender.replace('@s.whatsapp.net', '')),
        styledLine('Bad Word', foundWord),
        styledLine('Warnings', String(count))
      ].join('\n');
      await sock.sendMessage(normalizedMessage.remoteJid, {
        text: commandBox('BAD WORD DETECTED', lines)
      });
    }
  }
}

module.exports = { checkBadWords };
