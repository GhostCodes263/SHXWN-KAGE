const config = require('../config');
const { resolveLidToJid } = require('./lidResolver');
const { getOwners } = require('./ownerStore');

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
 * Determine if a sender number is the bot's own number.
 */
function isBotItself(senderNumber, sock) {
  if (!senderNumber || !sock || !sock.user) return false;
  const botJid = sock.user.id;
  if (!botJid) return false;
  const botNumber = botJid.replace(/@.*$/, '').replace(/[^0-9]/g, '');
  return senderNumber === botNumber;
}

/**
 * Determine if a sender number is an owner.
 */
function isOwnerNumber(senderNumber, sock) {
  if (!senderNumber) return false;
  // Main owner from config
  if (senderNumber === config.ownerNumber) return true;
  // Bot's own number
  if (isBotItself(senderNumber, sock)) return true;
  // Additional owners from file
  const additionalOwners = getOwners();
  return additionalOwners.includes(senderNumber);
}

/**
 * Determines permission level for a message sender.
 */
async function getPermissionLevel(ctx) {
  const sender = ctx.normalized.sender;
  const sock = ctx.sock;

  const senderNumber = sender
    ? sender.replace(/@.*$/, '').replace(/[^0-9]/g, '')
    : '';

  if (isOwnerNumber(senderNumber, sock)) {
    return { level: 'OWNER', priority: PERMISSIONS.OWNER, isOwner: true, isAdmin: true };
  }

  let isAdmin = false;

  if (ctx.normalized.isGroup) {
    try {
      const groupJid = ctx.normalized.remoteJid;
      const metadata = await sock.groupMetadata(groupJid);
      const participants = metadata.participants || [];

      for (const p of participants) {
        const candidateJids = [
          p.id,
          p.participantAlt,
          resolveLidToJid(p.id)
        ].filter(Boolean);

        const isMatch = candidateJids.some((jid) => jid === sender);

        if (isMatch && (p.admin === 'admin' || p.admin === 'superadmin')) {
          isAdmin = true;
          break;
        }
      }
    } catch (err) {
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
