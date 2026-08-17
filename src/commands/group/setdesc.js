const { commandBox, styledLine } = require('../../utils/format');

module.exports = {
  name: 'setdesc',
  aliases: ['setdescription'],
  category: 'group',
  description: 'Set group description',
  usage: '.setdesc <description>',
  permissions: ['ADMIN'],
  cooldown: 5,
  groupOnly: true,
  execute: async (ctx) => {
    const newDesc = ctx.args.join(' ');
    if (!newDesc) {
      await ctx.sock.sendMessage(ctx.normalized.remoteJid, {
        text: commandBox('SETDESC', [styledLine('Error', 'Provide a description')].join('\n'))
      });
      return;
    }
    try {
      await ctx.sock.groupUpdateDescription(ctx.normalized.remoteJid, newDesc);
      await ctx.sock.sendMessage(ctx.normalized.remoteJid, {
        text: commandBox('SETDESC', [styledLine('Status', 'DESCRIPTION UPDATED')].join('\n'))
      });
    } catch (err) {
      await ctx.sock.sendMessage(ctx.normalized.remoteJid, {
        text: commandBox('SETDESC', [styledLine('Error', err.message)].join('\n'))
      });
    }
  }
};
