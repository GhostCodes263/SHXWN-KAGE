const { commandBox, styledLine } = require('../../utils/format');
const { getGroupSettings, updateGroupSettings } = require('../../utils/raidStore');

module.exports = {
  name: 'antiraid',
  aliases: ['raidprotect', 'raidmode'],
  category: 'security',
  description: 'Manage anti-raid settings (on/off/action/threshold/status)',
  usage: '.antiraid <on|off|action <lockdown|kick|ban>|threshold <n>|status>',
  permissions: ['ADMIN'],
  cooldown: 3,
  groupOnly: true,
  execute: async (ctx) => {
    const sub = ctx.args[0]?.toLowerCase();
    const groupJid = ctx.normalized.remoteJid;
    const settings = getGroupSettings(groupJid);

    if (!sub) {
      const lines = [
        styledLine('Enabled', settings.enabled ? 'YES' : 'NO'),
        styledLine('Action', settings.action.toUpperCase()),
        styledLine('Threshold', String(settings.threshold)),
        styledLine('Locked', settings.locked ? 'YES' : 'NO')
      ].join('\n');
      await ctx.sock.sendMessage(groupJid, { text: commandBox('ANTI-RAID', lines) });
      return;
    }

    if (sub === 'on') {
      updateGroupSettings(groupJid, { enabled: true });
      await ctx.sock.sendMessage(groupJid, { text: commandBox('ANTI-RAID', [styledLine('Status', 'ENABLED')].join('\n')) });
    } else if (sub === 'off') {
      updateGroupSettings(groupJid, { enabled: false });
      await ctx.sock.sendMessage(groupJid, { text: commandBox('ANTI-RAID', [styledLine('Status', 'DISABLED')].join('\n')) });
    } else if (sub === 'action') {
      const action = ctx.args[1]?.toLowerCase();
      const valid = ['lockdown', 'kick', 'ban'];
      if (!valid.includes(action)) {
        await ctx.sock.sendMessage(groupJid, { text: commandBox('ANTI-RAID', [styledLine('Error', 'Invalid action')].join('\n')) });
        return;
      }
      updateGroupSettings(groupJid, { action });
      await ctx.sock.sendMessage(groupJid, { text: commandBox('ANTI-RAID', [styledLine('Action', action.toUpperCase())].join('\n')) });
    } else if (sub === 'threshold') {
      const threshold = parseInt(ctx.args[1], 10);
      if (isNaN(threshold) || threshold < 2 || threshold > 100) {
        await ctx.sock.sendMessage(groupJid, { text: commandBox('ANTI-RAID', [styledLine('Error', 'Threshold must be 2-100')].join('\n')) });
        return;
      }
      updateGroupSettings(groupJid, { threshold });
      await ctx.sock.sendMessage(groupJid, { text: commandBox('ANTI-RAID', [styledLine('Threshold', String(threshold))].join('\n')) });
    } else if (sub === 'status') {
      const lines = [
        styledLine('Enabled', settings.enabled ? 'YES' : 'NO'),
        styledLine('Action', settings.action.toUpperCase()),
        styledLine('Threshold', String(settings.threshold)),
        styledLine('Locked', settings.locked ? 'YES' : 'NO')
      ].join('\n');
      await ctx.sock.sendMessage(groupJid, { text: commandBox('ANTI-RAID', lines) });
    } else {
      await ctx.sock.sendMessage(groupJid, { text: commandBox('ANTI-RAID', [styledLine('Error', 'Invalid subcommand')].join('\n')) });
    }
  }
};
