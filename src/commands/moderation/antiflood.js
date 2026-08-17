const { commandBox, styledLine } = require('../../utils/format');
const { updateGroupSettings, getGroupSettings } = require('../../utils/spamStore');

module.exports = {
  name: 'antiflood',
  aliases: ['aflood'],
  category: 'moderation',
  description: 'Set flood detection threshold',
  usage: '.antiflood <threshold>',
  permissions: ['ADMIN'],
  cooldown: 3,
  groupOnly: true,
  execute: async (ctx) => {
    const threshold = parseInt(ctx.args[0], 10);
    const groupJid = ctx.normalized.remoteJid;
    if (isNaN(threshold) || threshold < 2 || threshold > 100) {
      await ctx.sock.sendMessage(groupJid, { text: commandBox('ANTI-FLOOD', [styledLine('Error', 'Threshold must be 2-100')].join('\n')) });
      return;
    }
    updateGroupSettings(groupJid, { floodThreshold: threshold });
    await ctx.sock.sendMessage(groupJid, {
      text: commandBox('ANTI-FLOOD', [styledLine('Threshold', String(threshold))].join('\n'))
    });
  }
};
