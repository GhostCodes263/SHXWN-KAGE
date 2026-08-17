const config = require('../config');

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

function getPermissionLevel(context) {
  const sender = context.normalized.sender;
  const ownerNumber = config.ownerNumber;

  // Normalize sender to digits only for comparison
  const senderNumber = sender
    ? sender.replace(/@.*$/, '').replace(/[^0-9]/g, '')
    : '';

  if (senderNumber && senderNumber === ownerNumber) {
    return { level: 'OWNER', priority: PERMISSIONS.OWNER, isOwner: true };
  }

  // Future: group admin detection, VIP, etc.

  return { level: 'USER', priority: PERMISSIONS.USER, isOwner: false };
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
