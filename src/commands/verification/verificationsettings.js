const { getSettings, updateSettings } = require('../../verification/verificationStore');
const { commandBox, styledLine } = require('../../utils/format');

module.exports = {
  name: 'verification-settings',
  aliases: ['vsettings'],
  category: 'verification',
  description: 'Manage verification settings (on/off/autoapprove/review)',
  usage: '.verification-settings <on|off|autoapprove|review>',
  permissions: ['ADMIN'],
  cooldown: 3,
  execute: async (ctx) => {
    const sub = ctx.args[0]?.toLowerCase();
    const settings = getSettings();

    if (!sub) {
      const lines = [
        styledLine('Enabled', settings.enabled ? 'YES' : 'NO'),
        styledLine('Admin Review', settings.adminReview ? 'YES' : 'NO')
      ].join('\n');
      await ctx.sock.sendMessage(ctx.normalized.remoteJid, {
        text: commandBox('VERIFICATION SETTINGS', lines)
      });
      return;
    }

    if (sub === 'on') {
      updateSettings({ enabled: true });
      await ctx.sock.sendMessage(ctx.normalized.remoteJid, {
        text: commandBox('VERIFICATION SETTINGS', [styledLine('Status', 'ENABLED')].join('\n'))
      });
    } else if (sub === 'off') {
      updateSettings({ enabled: false });
      await ctx.sock.sendMessage(ctx.normalized.remoteJid, {
        text: commandBox('VERIFICATION SETTINGS', [styledLine('Status', 'DISABLED')].join('\n'))
      });
    } else if (sub === 'autoapprove') {
      updateSettings({ adminReview: false });
      await ctx.sock.sendMessage(ctx.normalized.remoteJid, {
        text: commandBox('VERIFICATION SETTINGS', [styledLine('Admin Review', 'NO (Auto-approve)')].join('\n'))
      });
    } else if (sub === 'review') {
      updateSettings({ adminReview: true });
      await ctx.sock.sendMessage(ctx.normalized.remoteJid, {
        text: commandBox('VERIFICATION SETTINGS', [styledLine('Admin Review', 'YES')].join('\n'))
      });
    } else {
      await ctx.sock.sendMessage(ctx.normalized.remoteJid, {
        text: commandBox('VERIFICATION SETTINGS', [styledLine('Error', 'Invalid subcommand')].join('\n'))
      });
    }
  }
};
