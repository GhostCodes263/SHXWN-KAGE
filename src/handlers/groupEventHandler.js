const logger = require('../utils/logger');
const { getRecord, setPendingGroup } = require('../verification/verificationStore');
const { getGroupSettings, updateGroupSettings, resetJoinCount } = require('../utils/raidStore');
const { commandBox, styledLine } = require('../utils/format');

/**
 * Handles group participant updates (join/leave).
 */
async function handleGroupParticipantsUpdate(sock, update) {
  console.log('GROUP EVENT:', JSON.stringify(update, null, 2));

  const groupJid = update.id;
  const action = update.action;
  const participants = update.participants || [];

  if (!groupJid || !participants.length) return;

  // Only care about adds
  if (action !== 'add') return;

  const joins = participants;

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
      const raidAction = raidSettings.action || 'lockdown';
      logger.warn(`Anti-raid triggered in ${groupJid}: action=${raidAction}`);
      if (raidAction === 'lockdown') {
        await sock.groupSettingUpdate(groupJid, 'announcement');
        updateGroupSettings(groupJid, { locked: true });
        await sock.sendMessage(groupJid, {
          text: commandBox('ANTI-RAID', [
            styledLine('Mode', 'LOCKDOWN ACTIVATED'),
            styledLine('Reason', `${raidSettings.joinCount} joins in 1 min`)
          ].join('\n')),
          linkPreview: false
        });
      } else if (raidAction === 'kick' || raidAction === 'ban') {
        const joiners = joins.map(p => p.phoneNumber || p.id);
        await sock.groupParticipantsUpdate(groupJid, joiners, 'remove');
        await sock.sendMessage(groupJid, {
          text: commandBox('ANTI-RAID', [
            styledLine('Action', raidAction.toUpperCase()),
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
    // Use phoneNumber (real JID) if available, else id (LID)
    const userJid = joiner.phoneNumber || joiner.id;
    const record = getRecord(userJid);
    if (!record || record.status !== 'APPROVED') {
      setPendingGroup(userJid, groupJid);
      try {
        await sock.groupParticipantsUpdate(groupJid, [userJid], 'remove');
        logger.info(`Kicked unverified user ${userJid} from ${groupJid}`);
      } catch (err) {
        logger.warn(`Failed to kick unverified user: ${err.message}`);
      }
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
