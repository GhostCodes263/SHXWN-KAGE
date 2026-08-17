const { commandBox, styledLine } = require('../../utils/format');
const { getOwners } = require('../../utils/ownerStore');
const config = require('../../config');

module.exports = {
  name: 'listowners',
  aliases: ['owners'],
  category: 'owner',
  description: 'List all owner numbers',
  usage: '.listowners',
  permissions: ['OWNER'],
  cooldown: 3,
  execute: async (ctx) => {
    const mainOwner = config.ownerNumber;
    const additionalOwners = getOwners();
    const all = [mainOwner, ...additionalOwners];
    const lines = all.map((n, i) => `┃ [${i + 1}] ${n}`).join('\n');
    await ctx.sock.sendMessage(ctx.normalized.remoteJid, {
      text: commandBox('OWNERS', lines)
    });
  }
};
