const { commandBox, styledLine } = require('../../utils/format');
const { removeOwner } = require('../../utils/ownerStore');

module.exports = {
  name: 'removeowner',
  aliases: ['ownerdel', 'delowner'],
  category: 'owner',
  description: 'Remove an owner number',
  usage: '.removeowner <number>',
  permissions: ['OWNER'],
  cooldown: 3,
  execute: async (ctx) => {
    const number = ctx.args[0]?.replace(/[^0-9]/g, '');
    if (!number) {
      await ctx.sock.sendMessage(ctx.normalized.remoteJid, {
        text: commandBox('REMOVE OWNER', [styledLine('Error', 'Provide a number')].join('\n'))
      });
      return;
    }
    const removed = removeOwner(number);
    const status = removed ? 'OWNER REMOVED' : 'NOT FOUND';
    await ctx.sock.sendMessage(ctx.normalized.remoteJid, {
      text: commandBox('REMOVE OWNER', [styledLine('Status', status)].join('\n'))
    });
  }
};
