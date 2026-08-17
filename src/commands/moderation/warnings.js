const { commandBox, styledLine } = require('../../utils/format');
const { getWarnings } = require('../../utils/warningStore');

module.exports = {
  name: 'warnings',
  aliases: ['warnlist', 'checkwarn'],
  category: 'moderation',
  description: 'Check warnings for a user',
  usage: '.warnings @user',
  permissions: ['ADMIN'],
  cooldown: 3,
  groupOnly: true,
  execute: async (ctx) => {
    const mentioned = ctx.normalized.mentionedJids;
    if (!mentioned.length) {
      await ctx.sock.sendMessage(ctx.normalized.remoteJid, {
        text: commandBox('WARNINGS', [styledLine('Error', 'Mention a user')].join('\n'))
      });
      return;
    }
    const target = mentioned[0];
    const warnings = getWarnings(ctx.normalized.remoteJid, target);
    if (!warnings.length) {
      await ctx.sock.sendMessage(ctx.normalized.remoteJid, {
        text: commandBox('WARNINGS', [styledLine('Status', 'NO WARNINGS')].join('\n'))
      });
      return;
    }
    const lines = warnings.map((w, i) => {
      const date = new Date(w.timestamp).toISOString().slice(0, 10);
      return `┃ [${i + 1}] ${date} - ${w.reason}`;
    }).join('\n');
    await ctx.sock.sendMessage(ctx.normalized.remoteJid, {
      text: commandBox('WARNINGS', lines)
    });
  }
};
