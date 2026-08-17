const logger = require('../utils/logger');
const { getGroupSettings, updateGroupSettings, resetJoinCount } = require('../utils/raidStore');
const { commandBox, styledLine } = require('../utils/format');

/**
 * Handles group participant updates (join/leave).
 */
async function handleGroupParticipantsUpdate(sock, update) {
  const { id: groupJid, participants } = update;
  if (!groupJid || !participants || !participants.length) return;

  const joins = participants.filter((p) => p.action === 'add');
  if (!joins.length) return;

  const settings = getGroupSettings(groupJid);
  if (!settings.enabled) return;

  const now = Date.now();
  const windowMs = 60 * 1000; // 1 minute

  // Reset if last join was longer than 1 minute ago
  if (now - settings.lastJoinTime > windowMs) {
    settings.joinCount = 0;
  }

  settings.joinCount += joins.length;
  settings.lastJoinTime = now;
  updateGroupSettings(groupJid, settings);

  logger.info(`Raid detection: ${settings.joinCount} joins in 1 min in ${groupJid}`);

  if (settings.joinCount >= settings.threshold) {
    const action = settings.action || 'lockdown';
    logger.warn(`Anti-raid triggered in ${groupJid}: action=${action}`);

    if (action === 'lockdown') {
      try {
        await sock.groupSettingUpdate(groupJid, 'announcement');
        updateGroupSettings(groupJid, { locked: true });
        const lines = [
          styledLine('Mode', 'LOCKDOWN ACTIVATED'),
          styledLine('Reason', `${settings.joinCount} joins in 1 min`),
          styledLine('Threshold', String(settings.threshold))
        ].join('\n');
        await sock.sendMessage(groupJid, {
          text: commandBox('ANTI-RAID', lines),
          linkPreview: false
        });
      } catch (err) {
        logger.error(err, 'Failed to activate lockdown');
      }
    } else if (action === 'kick' || action === 'ban') {
      // Kick/ban recent joiners
      try {
        const joiners = joins.map((p) => p.id);
        await sock.groupParticipantsUpdate(groupJid, joiners, 'remove');
        const lines = [
          styledLine('Action', action.toUpperCase()),
          styledLine('Members Removed', String(joiners.length)),
          styledLine('Reason', `Raid detected: ${settings.joinCount} joins/min`)
        ].join('\n');
        await sock.sendMessage(groupJid, {
          text: commandBox('ANTI-RAID', lines),
          linkPreview: false
        });
      } catch (err) {
        logger.error(err, `Failed to ${action} joiners`);
      }
    }

    resetJoinCount(groupJid);
  }
}

module.exports = { handleGroupParticipantsUpdate };
