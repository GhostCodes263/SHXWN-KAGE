const config = require('../config');
const { resolveLidToJid } = require('./lidResolver');

const PERMISSIONS = {
  OWNER: 7,
  SUPERADMIN: 6,
  ADMIN: 5,
  MODERATOR: 4,
  VIP: 3,
  VERIFIED: 2,
  USER: 1,
  BANNED: 0
};

/**
 * Determines permission level for a message sender.
 * @param {Object} ctx - Contains sock and normalized message.
 */
async function getPermissionLevel(ctx) {
  const sender = ctx.normalized.sender;
  const ownerNumber = config.ownerNumber;
  const sock = ctx.sock;

  // Normalize sender to digits only
  const senderNumber = sender
    ? sender.replace(/@.*$/, '').replace(/[^0-9]/g, '')
    : '';

  // Owner check
  if (senderNumber && senderNumber === ownerNumber) {
    return { level: 'OWNER', priority: PERMISSIONS.OWNER, isOwner: true, isAdmin: true };
  }

  let isAdmin = false;

  // Group admin check
  if (ctx.normalized.isGroup) {
    try {
      const groupJid = ctx.normalized.remoteJid;
      const metadata = await sock.groupMetadata(groupJid);
      const participants = metadata.participants || [];

      for (const p of participants) {
        // Candidate IDs for comparison
        const candidateJids = [
          p.id,
          p.participantAlt,
          // resolve LID to JID if p.id is LID
          resolveLidToJid(p.id)
        ].filter(Boolean);

        const isMatch = candidateJids.some((jid) => jid === sender);

        if (isMatch && (p.admin === 'admin' || p.admin === 'superadmin')) {
          isAdmin = true;
          break;
        }
      }
    } catch (err) {
      // Log error but continue
      console.error('Failed to get group metadata for permission check:', err.message);
    }
  }

  if (isAdmin) {
    return { level: 'ADMIN', priority: PERMISSIONS.ADMIN, isOwner: false, isAdmin: true };
  }

  return { level: 'USER', priority: PERMISSIONS.USER, isOwner: false, isAdmin: false };
}

function hasPermission(userLevel, requiredPermissions) {
  const userPriority = PERMISSIONS[userLevel] ?? PERMISSIONS.USER;
  const maxRequiredPriority = Math.max(
    ...requiredPermissions.map((p) => PERMISSIONS[p] ?? PERMISSIONS.USER)
  );
  return userPriority >= maxRequiredPriority;
}

module.exports = {
  PERMISSIONS,
  getPermissionLevel,
  hasPermission
};
