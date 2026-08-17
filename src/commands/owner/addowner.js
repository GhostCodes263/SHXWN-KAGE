const { commandBox, styledLine } = require('../../utils/format');
const { addOwner } = require('../../utils/ownerStore');

module.exports = {
  name: 'addowner',
  aliases: ['owneradd', 'newowner'],
  category: 'owner',
  description: 'Add a new owner number',
  usage: '.addowner <number>',
  permissions: ['OWNER'],
  cooldown: 3,
  execute: async (ctx) => {
    const number = ctx.args[0]?.replace(/[^0-9]/g, '');
    if (!number) {
      await ctx.sock.sendMessage(ctx.normalized.remoteJid, {
        text: commandBox('ADD OWNER', [styledLine('Error', 'Provide a number')].join('\n'))
      });
      return;
    }
    const added = addOwner(number);
    const status = added ? 'OWNER ADDED' : 'ALREADY EXISTS';
    await ctx.sock.sendMessage(ctx.normalized.remoteJid, {
      text: commandBox('ADD OWNER', [styledLine('Status', status)].join('\n'))
    });
  }
};
