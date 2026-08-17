const { commandBox, styledLine } = require('../../utils/format');

module.exports = {
  name: 'add',
  aliases: ['invite'],
  category: 'group',
  description: 'Add a member to the group',
  usage: '.add <number>',
  permissions: ['ADMIN'],
  cooldown: 5,
  groupOnly: true,
  execute: async (ctx) => {
    const number = ctx.args[0]?.replace(/[^0-9]/g, '');
    if (!number) {
      await ctx.sock.sendMessage(ctx.normalized.remoteJid, {
        text: commandBox('ADD', [styledLine('Error', 'Provide a number')].join('\n'))
      });
      return;
    }
    const jid = number + '@s.whatsapp.net';
    try {
      await ctx.sock.groupParticipantsUpdate(ctx.normalized.remoteJid, [jid], 'add');
      await ctx.sock.sendMessage(ctx.normalized.remoteJid, {
        text: commandBox('ADD', [styledLine('Status', 'MEMBER ADDED')].join('\n'))
      });
    } catch (err) {
      await ctx.sock.sendMessage(ctx.normalized.remoteJid, {
        text: commandBox('ADD', [styledLine('Error', err.message)].join('\n'))
      });
    }
  }
};
