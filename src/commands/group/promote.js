const { commandBox, styledLine } = require('../../utils/format');

module.exports = {
  name: 'promote',
  aliases: ['admin'],
  category: 'group',
  description: 'Promote a member to admin',
  usage: '.promote @user',
  permissions: ['ADMIN'],
  cooldown: 5,
  groupOnly: true,
  execute: async (ctx) => {
    const mentioned = ctx.normalized.mentionedJids;
    if (!mentioned.length) {
      await ctx.sock.sendMessage(ctx.normalized.remoteJid, {
        text: commandBox('PROMOTE', [styledLine('Error', 'Mention a user')].join('\n'))
      });
      return;
    }
    const target = mentioned[0];
    try {
      await ctx.sock.groupParticipantsUpdate(ctx.normalized.remoteJid, [target], 'promote');
      await ctx.sock.sendMessage(ctx.normalized.remoteJid, {
        text: commandBox('PROMOTE', [styledLine('Status', 'MEMBER PROMOTED')].join('\n'))
      });
    } catch (err) {
      await ctx.sock.sendMessage(ctx.normalized.remoteJid, {
        text: commandBox('PROMOTE', [styledLine('Error', err.message)].join('\n'))
      });
    }
  }
};
