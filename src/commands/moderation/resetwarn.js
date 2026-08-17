const { commandBox, styledLine } = require('../../utils/format');
const { clearWarnings } = require('../../utils/warningStore');

module.exports = {
  name: 'resetwarn',
  aliases: ['clearwarn'],
  category: 'moderation',
  description: 'Reset warnings for a user',
  usage: '.resetwarn @user',
  permissions: ['ADMIN'],
  cooldown: 3,
  groupOnly: true,
  execute: async (ctx) => {
    const mentioned = ctx.normalized.mentionedJids;
    if (!mentioned.length) {
      await ctx.sock.sendMessage(ctx.normalized.remoteJid, {
        text: commandBox('RESETWARN', [styledLine('Error', 'Mention a user')].join('\n'))
      });
      return;
    }
    const target = mentioned[0];
    clearWarnings(ctx.normalized.remoteJid, target);
    await ctx.sock.sendMessage(ctx.normalized.remoteJid, {
      text: commandBox('RESETWARN', [styledLine('Status', 'WARNINGS CLEARED')].join('\n'))
    });
  }
};
