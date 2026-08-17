const { resolveLidToJid } = require('./lidResolver');

/**
 * Normalizes a raw Baileys message into a clean context object.
 */
function normalizeMessage(msg, sock) {
  const { key, message, pushName, messageTimestamp, remoteJid: rawRemoteJid } = msg;

  // Resolve possible LID JIDs
  const rawSender = key.participant || key.remoteJid;

  let sender = resolveLidToJid(rawSender);

  // For private messages, remoteJid is usually the same as sender.
  // If remoteJid is undefined, fall back to sender.
  let remoteJid = resolveLidToJid(rawRemoteJid);
  if (!remoteJid) {
    remoteJid = sender;
  }

  const isGroup = remoteJid?.endsWith('@g.us');
  const messageId = key.id;

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
