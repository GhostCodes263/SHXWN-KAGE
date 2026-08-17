const { resolveLidToJid } = require('./lidResolver');

function resolveJid(jid) {
  if (!jid) return undefined;
  return resolveLidToJid(jid);
}

/**
 * Normalizes a raw Baileys message into a clean context object.
 */
function normalizeMessage(msg, sock) {
  const { key, message, pushName, messageTimestamp } = msg;
  const {
    remoteJid: rawRemoteJid,
    remoteJidAlt,
    participant,
    participantAlt,
    fromMe
  } = key;

  // Determine chat JID (remoteJid)
  let remoteJid;
  if (rawRemoteJid) {
    remoteJid = resolveJid(rawRemoteJid);
  } else if (remoteJidAlt) {
    remoteJid = remoteJidAlt;
  }

  // Determine sender JID
  let rawSender;
  if (fromMe) {
    // Message sent by the bot itself => sender is the bot
    rawSender = sock.user?.id || config.ownerNumber + '@s.whatsapp.net';
  } else if (participant && participant !== '') {
    rawSender = participant;
  } else if (participantAlt) {
    rawSender = participantAlt;
  } else {
    rawSender = rawRemoteJid || remoteJid || '';
  }

  let sender = resolveJid(rawSender);

  // Fallback if remoteJid is undefined
  if (!remoteJid) {
    remoteJid = sender;
  }

  const isGroup = remoteJid?.endsWith('@g.us');
  const messageId = key.id;

  // Extract text
  let text = '';
  if (message) {
    if (message.conversation) text = message.conversation;
    else if (message.extendedTextMessage?.text) text = message.extendedTextMessage.text;
    else if (message.imageMessage?.caption) text = message.imageMessage.caption;
    else if (message.videoMessage?.caption) text = message.videoMessage.caption;
    else if (message.ephemeralMessage) {
      const inner = message.ephemeralMessage.message;
      if (inner.conversation) text = inner.conversation;
      else if (inner.extendedTextMessage?.text) text = inner.extendedTextMessage.text;
      else if (inner.imageMessage?.caption) text = inner.imageMessage.caption;
      else if (inner.videoMessage?.caption) text = inner.videoMessage.caption;
    }
  }

  // Determine media
  let mediaType = null;
  let mediaMessage = null;
  if (message) {
    if (message.imageMessage) { mediaType = 'image'; mediaMessage = message.imageMessage; }
    else if (message.videoMessage) { mediaType = 'video'; mediaMessage = message.videoMessage; }
    else if (message.audioMessage) { mediaType = 'audio'; mediaMessage = message.audioMessage; }
    else if (message.documentMessage) { mediaType = 'document'; mediaMessage = message.documentMessage; }
    else if (message.stickerMessage) { mediaType = 'sticker'; mediaMessage = message.stickerMessage; }
    else if (message.ephemeralMessage) {
      const inner = message.ephemeralMessage.message;
      if (inner.imageMessage) { mediaType = 'image'; mediaMessage = inner.imageMessage; }
      else if (inner.videoMessage) { mediaType = 'video'; mediaMessage = inner.videoMessage; }
      else if (inner.audioMessage) { mediaType = 'audio'; mediaMessage = inner.audioMessage; }
      else if (inner.documentMessage) { mediaType = 'document'; mediaMessage = inner.documentMessage; }
      else if (inner.stickerMessage) { mediaType = 'sticker'; mediaMessage = inner.stickerMessage; }
    }
  }

  const quotedMessage = message?.extendedTextMessage?.contextInfo?.quotedMessage || null;
  const mentionedJids = message?.extendedTextMessage?.contextInfo?.mentionedJid || [];

  return {
    raw: msg,
    id: messageId,
    remoteJid,
    sender,
    isGroup,
    fromMe: fromMe === true,
    pushName,
    text,
    mediaType,
    mediaMessage,
    quotedMessage,
    mentionedJids,
    timestamp: messageTimestamp
  };
}

module.exports = { normalizeMessage };
