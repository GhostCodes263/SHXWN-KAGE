const { commandBox, styledLine } = require('../../utils/format');
const { updateGroupSettings } = require('../../utils/raidStore');

module.exports = {
  name: 'lockdown',
  aliases: ['lock'],
  category: 'security',
  description: 'Lock the group (only admins can send messages)',
  usage: '.lockdown',
  permissions: ['ADMIN'],
  cooldown: 3,
  groupOnly: true,
  execute: async (ctx) => {
    try {
      await ctx.sock.groupSettingUpdate(ctx.normalized.remoteJid, 'announcement');
      updateGroupSettings(ctx.normalized.remoteJid, { locked: true });
      await ctx.sock.sendMessage(ctx.normalized.remoteJid, {
        text: commandBox('LOCKDOWN', [styledLine('Status', 'GROUP LOCKED')].join('\n'))
      });
    } catch (err) {
      await ctx.sock.sendMessage(ctx.normalized.remoteJid, {
        text: commandBox('LOCKDOWN', [styledLine('Error', err.message)].join('\n'))
      });
    }
  }
};
