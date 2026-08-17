const logger = require('../utils/logger');
const { getRecord, setPendingGroup } = require('../verification/verificationStore');
const { getGroupSettings, updateGroupSettings, resetJoinCount } = require('../utils/raidStore');
const { commandBox, styledLine } = require('../utils/format');

/**
 * Handles group participant updates (join/leave).
 */
async function handleGroupParticipantsUpdate(sock, update) {
  const { id: groupJid, participants } = update;
  if (!groupJid || !participants || !participants.length) return;

  const joins = participants.filter(p => p.action === 'add');
  if (!joins.length) return;

  // Anti-raid check
  const raidSettings = getGroupSettings(groupJid);
  if (raidSettings.enabled) {
    const now = Date.now();
    const windowMs = 60 * 1000;
    if (now - raidSettings.lastJoinTime > windowMs) {
      raidSettings.joinCount = 0;
    }
    raidSettings.joinCount += joins.length;
    raidSettings.lastJoinTime = now;
    updateGroupSettings(groupJid, raidSettings);
    logger.info(`Raid detection: ${raidSettings.joinCount} joins in 1 min in ${groupJid}`);

    if (raidSettings.joinCount >= raidSettings.threshold) {
      const action = raidSettings.action || 'lockdown';
      logger.warn(`Anti-raid triggered in ${groupJid}: action=${action}`);
      if (action === 'lockdown') {
        await sock.groupSettingUpdate(groupJid, 'announcement');
        updateGroupSettings(groupJid, { locked: true });
        await sock.sendMessage(groupJid, {
          text: commandBox('ANTI-RAID', [
            styledLine('Mode', 'LOCKDOWN ACTIVATED'),
            styledLine('Reason', `${raidSettings.joinCount} joins in 1 min`)
          ].join('\n')),
          linkPreview: false
        });
      } else if (action === 'kick' || action === 'ban') {
        const joiners = joins.map(p => p.id);
        await sock.groupParticipantsUpdate(groupJid, joiners, 'remove');
        await sock.sendMessage(groupJid, {
          text: commandBox('ANTI-RAID', [
            styledLine('Action', action.toUpperCase()),
            styledLine('Members Removed', String(joiners.length))
          ].join('\n')),
          linkPreview: false
        });
      }
      resetJoinCount(groupJid);
    }
  }

  // Verification check
  for (const joiner of joins) {
    const userJid = joiner.id;
    const record = getRecord(userJid);
    if (!record || record.status !== 'APPROVED') {
      // Set pending group for later verification
      setPendingGroup(userJid, groupJid);
      // Kick
      try {
        await sock.groupParticipantsUpdate(groupJid, [userJid], 'remove');
        logger.info(`Kicked unverified user ${userJid} from ${groupJid}`);
      } catch (err) {
        logger.warn(`Failed to kick unverified user: ${err.message}`);
      }
      // Send private message
      try {
        await sock.sendMessage(userJid, {
          text: commandBox('NOT VERIFIED', [
            styledLine('Status', 'ACCESS DENIED'),
            styledLine('Action', 'Please type .joingroup to verify and rejoin.')
          ].join('\n')),
          linkPreview: false
        });
      } catch (err) {
        logger.warn(`Could not DM unverified user: ${err.message}`);
      }
    }
  }
}

module.exports = { handleGroupParticipantsUpdate };
