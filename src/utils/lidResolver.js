const fs = require('fs');
const path = require('path');
const config = require('../config');
const logger = require('./logger');

/**
 * Resolves a JID that may be an LID (ends with @lid) to a proper WhatsApp JID
 * by reading the session mapping files created by Baileys.
 */
function resolveLidToJid(jid) {
  if (!jid || !jid.endsWith('@lid')) return jid;

  const lid = jid.replace('@lid', '');
  const sessionDir = path.resolve(config.rootDir, config.sessionPath);
  const possibleFiles = [
    path.join(sessionDir, `lid-mapping-${lid}.json`),
    path.join(sessionDir, `lid-mapping-${lid}_reverse.json`)
  ];

  for (const filePath of possibleFiles) {
    if (fs.existsSync(filePath)) {
      try {
        const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

        // Case 1: Mapping file is an object like { lid, jid } or { jid: ... }
        if (data && typeof data === 'object' && !Array.isArray(data)) {
          const possibleJid = data.jid || data.userJid || data.phone;
          if (possibleJid && !possibleJid.endsWith('@lid')) {
            logger.debug(`Resolved LID ${lid} to JID ${possibleJid}`);
            return possibleJid;
          }
        }

        // Case 2: Mapping file contains a plain string JID (possibly quoted)
        if (typeof data === 'string' && data.length > 0) {
          let resolved = data.trim();
          // Remove any quotes if present (JSON.parse already did, but just in case)
          resolved = resolved.replace(/^["']|["']$/g, '');
          // If it doesn't already have @, append @s.whatsapp.net
          if (!resolved.includes('@')) {
            resolved = `${resolved}@s.whatsapp.net`;
          }
          logger.debug(`Resolved LID ${lid} to JID ${resolved}`);
          return resolved;
        }
      } catch (err) {
        logger.warn(`Failed to parse LID mapping file: ${filePath}`);
      }
    }
  }

  // If not resolved, return original (will likely fail later, but better than silently wrong)
  logger.warn(`Could not resolve LID ${lid} to JID`);
  return jid;
}

module.exports = { resolveLidToJid };
