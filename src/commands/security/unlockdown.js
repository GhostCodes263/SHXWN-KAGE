const { commandBox, styledLine } = require('../../utils/format');
const { updateGroupSettings } = require('../../utils/raidStore');

module.exports = {
  name: 'unlockdown',
  aliases: ['unlock'],
  category: 'security',
  description: 'Unlock the group (all members can send messages)',
  usage: '.unlockdown',
  permissions: ['ADMIN'],
  cooldown: 3,
  groupOnly: true,
  execute: async (ctx) => {
    try {
      await ctx.sock.groupSettingUpdate(ctx.normalized.remoteJid, 'not_announcement');
      updateGroupSettings(ctx.normalized.remoteJid, { locked: false });
      await ctx.sock.sendMessage(ctx.normalized.remoteJid, {
        text: commandBox('LOCKDOWN', [styledLine('Status', 'GROUP UNLOCKED')].join('\n'))
      });
    } catch (err) {
      await ctx.sock.sendMessage(ctx.normalized.remoteJid, {
        text: commandBox('LOCKDOWN', [styledLine('Error', err.message)].join('\n'))
      });
    }
  }
};
