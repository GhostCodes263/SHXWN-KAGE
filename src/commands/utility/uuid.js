const crypto = require('crypto');
const { commandBox, styledLine } = require('../../utils/format');

module.exports = {
  name: 'uuid',
  aliases: ['idgen'],
  category: 'utility',
  description: 'Generate a random UUID',
  usage: '.uuid',
  permissions: ['USER'],
  cooldown: 3,
  execute: async (ctx) => {
    const uuid = crypto.randomUUID();
    const lines = [
      styledLine('UUID', uuid)
    ].join('\n');
    await ctx.sock.sendMessage(ctx.normalized.remoteJid, {
      text: commandBox('UUID', lines)
    });
  }
};
