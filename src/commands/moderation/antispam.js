const { commandBox, styledLine } = require('../../utils/format');
const { getGroupSettings, updateGroupSettings } = require('../../utils/spamStore');

module.exports = {
  name: 'antispam',
  aliases: ['aspam'],
  category: 'moderation',
  description: 'Manage anti-spam settings (on/off/action)',
  usage: '.antispam <on|off|action <warn|delete|kick|ban>>',
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
        styledLine('Max Msgs', String(settings.maxMessages)),
        styledLine('Window', `${settings.windowSeconds}s`)
      ].join('\n');
      await ctx.sock.sendMessage(groupJid, { text: commandBox('ANTI-SPAM', lines) });
      return;
    }

    if (sub === 'on') {
      updateGroupSettings(groupJid, { enabled: true });
      await ctx.sock.sendMessage(groupJid, { text: commandBox('ANTI-SPAM', [styledLine('Status', 'ENABLED')].join('\n')) });
    } else if (sub === 'off') {
      updateGroupSettings(groupJid, { enabled: false });
      await ctx.sock.sendMessage(groupJid, { text: commandBox('ANTI-SPAM', [styledLine('Status', 'DISABLED')].join('\n')) });
    } else if (sub === 'action') {
      const action = ctx.args[1]?.toLowerCase();
      const valid = ['warn', 'delete', 'kick', 'ban'];
      if (!valid.includes(action)) {
        await ctx.sock.sendMessage(groupJid, { text: commandBox('ANTI-SPAM', [styledLine('Error', 'Invalid action')].join('\n')) });
        return;
      }
      updateGroupSettings(groupJid, { action });
      await ctx.sock.sendMessage(groupJid, { text: commandBox('ANTI-SPAM', [styledLine('Action', action.toUpperCase())].join('\n')) });
    } else {
      await ctx.sock.sendMessage(groupJid, { text: commandBox('ANTI-SPAM', [styledLine('Error', 'Invalid subcommand')].join('\n')) });
    }
  }
};
