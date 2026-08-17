const { commandBox, styledLine } = require('../../utils/format');

module.exports = {
  name: 'resetlink',
  aliases: ['revokelink'],
  category: 'group',
  description: 'Reset group invite link',
  usage: '.resetlink',
  permissions: ['ADMIN'],
  cooldown: 5,
  groupOnly: true,
  execute: async (ctx) => {
    try {
      await ctx.sock.groupRevokeInvite(ctx.normalized.remoteJid);
      const code = await ctx.sock.groupInviteCode(ctx.normalized.remoteJid);
      const link = `https://chat.whatsapp.com/${code}`;
      const lines = [
        styledLine('New Link', link)
      ].join('\n');
      await ctx.sock.sendMessage(ctx.normalized.remoteJid, {
        text: commandBox('LINK RESET', lines)
      });
    } catch (err) {
      await ctx.sock.sendMessage(ctx.normalized.remoteJid, {
        text: commandBox('LINK RESET', [styledLine('Error', err.message)].join('\n'))
      });
    }
  }
};
