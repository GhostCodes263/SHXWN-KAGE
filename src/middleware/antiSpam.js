const logger = require('../utils/logger');
const { getGroupSettings } = require('../utils/spamStore');
const { addWarning } = require('../utils/warningStore');
const { commandBox, styledLine } = require('../utils/format');

// In-memory tracker: Map<groupJid, Map<userJid, { timestamps: number[], texts: Map<string, number> }>>
const messageTrackers = new Map();

function getTracker(groupJid, userJid) {
  if (!messageTrackers.has(groupJid)) {
    messageTrackers.set(groupJid, new Map());
  }
  const groupMap = messageTrackers.get(groupJid);
  if (!groupMap.has(userJid)) {
    groupMap.set(userJid, { timestamps: [], texts: new Map() });
  }
  return groupMap.get(userJid);
}

function pruneOld(tracker, now, windowSeconds) {
  const cutoff = now - windowSeconds * 1000;
  tracker.timestamps = tracker.timestamps.filter((t) => t > cutoff);
}

/**
 * Checks a message for spam/flooding.
 */
async function checkAntiSpam(sock, normalizedMessage) {
  if (!normalizedMessage.isGroup) return;
  if (!normalizedMessage.text) return;
  if (normalizedMessage.text.startsWith('.')) return;

  const settings = getGroupSettings(normalizedMessage.remoteJid);
  if (!settings.enabled) return;

  const groupJid = normalizedMessage.remoteJid;
  const userJid = normalizedMessage.sender;
  const now = Date.now();

  const tracker = getTracker(groupJid, userJid);
  const windowMs = settings.windowSeconds * 1000;
  pruneOld(tracker, now, settings.windowSeconds);

  // Add current message
  tracker.timestamps.push(now);

  // Duplicate detection
  const text = normalizedMessage.text.toLowerCase();
  tracker.texts.set(text, (tracker.texts.get(text) || 0) + 1);
  const duplicateCount = tracker.texts.get(text);

  // Flood detection
  const messageCount = tracker.timestamps.length;
  const isFlood = messageCount >= settings.floodThreshold;

  // Spam detection (duplicate)
  const isDuplicate = duplicateCount >= settings.maxDuplicates;

  if (!isFlood && !isDuplicate) {
    // Clean text map for old texts? We'll just keep but prune later
    return;
  }

  const reason = isDuplicate
    ? `Duplicate message ${duplicateCount} times`
    : `Flooding: ${messageCount} messages in ${settings.windowSeconds}s`;

  logger.info(`Anti-spam triggered for ${userJid}: ${reason}`);

  // Warn
  const count = addWarning(groupJid, userJid, reason, 'ANTI-SPAM');

  // Action
  const action = settings.action || 'warn';

  let deleted = false;
  if (action === 'delete' || action === 'kick' || action === 'ban') {
    const rawKey = normalizedMessage.raw.key || {};
    const deletePayload = {
      remoteJid: rawKey.remoteJid || normalizedMessage.remoteJid,
      id: rawKey.id || normalizedMessage.id
    };
    if (rawKey.participant) {
      deletePayload.participant = rawKey.participant;
    }
    try {
      await sock.sendMessage(rawKey.remoteJid || normalizedMessage.remoteJid, {
        delete: deletePayload
      });
      deleted = true;
      logger.info('Deleted spam message successfully.');
    } catch (err) {
      logger.warn(`Could not delete spam message: ${err.message}`);
    }
  }

  if (action === 'kick' && !deleted) {
    try {
      await sock.groupParticipantsUpdate(groupJid, [userJid], 'remove');
    } catch (err) {
      logger.warn(`Could not kick spammer: ${err.message}`);
    }
  }
  if (action === 'ban') {
    try {
      await sock.groupParticipantsUpdate(groupJid, [userJid], 'remove');
    } catch (err) {
      logger.warn(`Could not ban spammer: ${err.message}`);
    }
  }

  // Notify group
  const lines = [
    styledLine('User', userJid.replace('@s.whatsapp.net', '')),
    styledLine('Reason', reason),
    styledLine('Action', action.toUpperCase()),
    styledLine('Warnings', String(count))
  ].join('\n');
  try {
    await sock.sendMessage(groupJid, {
      text: commandBox('ANTI-SPAM', lines),
      linkPreview: false
    });
  } catch (err) {
    logger.error(err, 'Failed to send anti-spam notification');
  }

  // Reset duplicate count for this text to avoid repeated warnings? We'll clear after action
  tracker.texts.delete(text);
}

module.exports = { checkAntiSpam };
