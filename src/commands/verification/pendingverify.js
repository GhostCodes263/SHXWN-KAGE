const { getSessions } = require('../../verification/verificationStore');
const { STATES } = require('../../verification/verificationEngine');
const { commandBox, styledLine } = require('../../utils/format');

module.exports = {
  name: 'pendingverify',
  aliases: ['pending'],
  category: 'verification',
  description: 'List users pending verification review',
  usage: '.pendingverify',
  permissions: ['ADMIN'],
  cooldown: 3,
  execute: async (ctx) => {
    const sessions = getSessions();
    const pending = Object.values(sessions).filter(s => s.state === STATES.PENDING_REVIEW);
    if (!pending.length) {
      await ctx.sock.sendMessage(ctx.normalized.remoteJid, {
        text: commandBox('PENDING VERIFY', [
          styledLine('Status', 'NO PENDING')
        ].join('\n'))
      });
      return;
    }
    const lines = pending.map((s, i) => {
      const name = s.data.name || 'Unknown';
      return `┃ [${i + 1}] ${name} (${s.userJid})`;
    }).join('\n');
    await ctx.sock.sendMessage(ctx.normalized.remoteJid, {
      text: commandBox('PENDING VERIFY', lines)
    });
  }
};
