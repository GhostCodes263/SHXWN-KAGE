const { commandBox, styledLine } = require('../../utils/format');

module.exports = {
  name: 'kick',
  aliases: ['remove'],
  category: 'group',
  description: 'Kick a member from the group',
  usage: '.kick @user',
  permissions: ['ADMIN'],
  cooldown: 5,
  groupOnly: true,
  execute: async (ctx) => {
    const mentioned = ctx.normalized.mentionedJids;
    if (!mentioned.length) {
      await ctx.sock.sendMessage(ctx.normalized.remoteJid, {
        text: commandBox('KICK', [styledLine('Error', 'Mention a user')].join('\n'))
      });
      return;
    }
    const target = mentioned[0];
    try {
      await ctx.sock.groupParticipantsUpdate(ctx.normalized.remoteJid, [target], 'remove');
      await ctx.sock.sendMessage(ctx.normalized.remoteJid, {
        text: commandBox('KICK', [styledLine('Status', 'MEMBER REMOVED')].join('\n'))
      });
    } catch (err) {
      await ctx.sock.sendMessage(ctx.normalized.remoteJid, {
        text: commandBox('KICK', [styledLine('Error', err.message)].join('\n'))
      });
    }
  }
};
