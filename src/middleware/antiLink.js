const logger = require('../utils/logger');
const { detectLinks, extractDomain, classifyLink } = require('../utils/linkDetector');
const { getGroupSettings } = require('../utils/antiLinkStore');
const { addWarning } = require('../utils/warningStore');
const { commandBox, styledLine } = require('../utils/format');

/**
 * Checks a message for links if anti-link is enabled for the group.
 */
async function checkAntiLink(sock, normalizedMessage) {
  if (!normalizedMessage.isGroup) return;
  if (!normalizedMessage.text) return;
  if (normalizedMessage.text.startsWith('.')) return;

  const settings = getGroupSettings(normalizedMessage.remoteJid);
  if (!settings.enabled) return;

  const links = detectLinks(normalizedMessage.text);
  if (!links.length) return;

  const whitelist = settings.whitelist || [];
  const allowed = links.every((link) => {
    const domain = extractDomain(link);
    return whitelist.includes(domain);
  });
  if (allowed) return;

  const firstLink = links[0];
  const firstDomain = extractDomain(firstLink);

  logger.info(`Anti-link detected: ${firstLink} from ${normalizedMessage.sender} in ${normalizedMessage.remoteJid}`);

  const action = settings.action || 'warn';
  const count = addWarning(
    normalizedMessage.remoteJid,
    normalizedMessage.sender,
    `Sent a link: ${firstLink}`,
    'ANTI-LINK'
  );

  // Attempt to delete original message (include participant for group messages)
  let deleted = false;
  if (action === 'delete' || action === 'kick' || action === 'ban') {
    const rawKey = normalizedMessage.raw.key || {};
    const deletePayload = {
      remoteJid: rawKey.remoteJid || normalizedMessage.remoteJid,
      id: rawKey.id || normalizedMessage.id
    };
    // If group message and we have participant, include it
    if (rawKey.participant) {
      deletePayload.participant = rawKey.participant;
    }

    try {
      await sock.sendMessage(rawKey.remoteJid || normalizedMessage.remoteJid, {
        delete: deletePayload
      });
      deleted = true;
      logger.info('Deleted link message successfully.');
    } catch (err) {
      logger.warn(`Could not delete link message: ${err.message}`);
    }
  }

  // Kick or ban (if not deleted and action requires)
  if (action === 'kick' && !deleted) {
    try {
      await sock.groupParticipantsUpdate(normalizedMessage.remoteJid, [normalizedMessage.sender], 'remove');
    } catch (err) {
      logger.warn(`Could not kick user for link: ${err.message}`);
    }
  }
  if (action === 'ban') {
    try {
      await sock.groupParticipantsUpdate(normalizedMessage.remoteJid, [normalizedMessage.sender], 'remove');
    } catch (err) {
      logger.warn(`Could not ban user for link: ${err.message}`);
    }
  }

  // Send notification
  const lines = [
    styledLine('User', normalizedMessage.sender.replace('@s.whatsapp.net', '')),
    styledLine('Link', firstLink),
    styledLine('Domain', firstDomain),
    styledLine('Action', action.toUpperCase()),
    styledLine('Warnings', String(count))
  ].join('\n');
  try {
    await sock.sendMessage(normalizedMessage.remoteJid, {
      text: commandBox('ANTI-LINK', lines),
      linkPreview: false
    });
  } catch (err) {
    logger.error(err, 'Failed to send anti-link notification');
  }
}

module.exports = { checkAntiLink };
