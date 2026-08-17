const { commandBox, styledLine } = require('../../utils/format');

module.exports = {
  name: 'setname',
  aliases: ['setsubject'],
  category: 'group',
  description: 'Set group name',
  usage: '.setname <new name>',
  permissions: ['ADMIN'],
  cooldown: 5,
  groupOnly: true,
  execute: async (ctx) => {
    const newName = ctx.args.join(' ');
    if (!newName) {
      await ctx.sock.sendMessage(ctx.normalized.remoteJid, {
        text: commandBox('SETNAME', [styledLine('Error', 'Provide a name')].join('\n'))
      });
      return;
    }
    try {
      await ctx.sock.groupUpdateSubject(ctx.normalized.remoteJid, newName);
      await ctx.sock.sendMessage(ctx.normalized.remoteJid, {
        text: commandBox('SETNAME', [styledLine('Status', 'NAME UPDATED')].join('\n'))
      });
    } catch (err) {
      await ctx.sock.sendMessage(ctx.normalized.remoteJid, {
        text: commandBox('SETNAME', [styledLine('Error', err.message)].join('\n'))
      });
    }
  }
};
