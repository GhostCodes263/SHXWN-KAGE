const { commandBox, styledLine } = require('../../utils/format');

module.exports = {
  name: 'demote',
  aliases: ['unadmin'],
  category: 'group',
  description: 'Demote an admin to member',
  usage: '.demote @user',
  permissions: ['ADMIN'],
  cooldown: 5,
  groupOnly: true,
  execute: async (ctx) => {
    const mentioned = ctx.normalized.mentionedJids;
    if (!mentioned.length) {
      await ctx.sock.sendMessage(ctx.normalized.remoteJid, {
        text: commandBox('DEMOTE', [styledLine('Error', 'Mention a user')].join('\n'))
      });
      return;
    }
    const target = mentioned[0];
    try {
      await ctx.sock.groupParticipantsUpdate(ctx.normalized.remoteJid, [target], 'demote');
      await ctx.sock.sendMessage(ctx.normalized.remoteJid, {
        text: commandBox('DEMOTE', [styledLine('Status', 'MEMBER DEMOTED')].join('\n'))
      });
    } catch (err) {
      await ctx.sock.sendMessage(ctx.normalized.remoteJid, {
        text: commandBox('DEMOTE', [styledLine('Error', err.message)].join('\n'))
      });
    }
  }
};
