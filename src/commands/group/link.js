const { commandBox, styledLine } = require('../../utils/format');

module.exports = {
  name: 'link',
  aliases: ['grouplink', 'invitelink'],
  category: 'group',
  description: 'Get group invite link',
  usage: '.link',
  permissions: ['ADMIN'],
  cooldown: 5,
  groupOnly: true,
  execute: async (ctx) => {
    try {
      const code = await ctx.sock.groupInviteCode(ctx.normalized.remoteJid);
      const link = `https://chat.whatsapp.com/${code}`;
      const lines = [
        styledLine('Link', link)
      ].join('\n');
      await ctx.sock.sendMessage(ctx.normalized.remoteJid, {
        text: commandBox('INVITE LINK', lines)
      });
    } catch (err) {
      await ctx.sock.sendMessage(ctx.normalized.remoteJid, {
        text: commandBox('INVITE LINK', [styledLine('Error', err.message)].join('\n'))
      });
    }
  }
};
