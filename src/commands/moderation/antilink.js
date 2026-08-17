const { commandBox, styledLine } = require('../../utils/format');
const { getGroupSettings, updateGroupSettings, addDomainToWhitelist, removeDomainFromWhitelist } = require('../../utils/antiLinkStore');

module.exports = {
  name: 'antilink',
  aliases: ['alink'],
  category: 'moderation',
  description: 'Manage anti-link settings (on/off, action, whitelist)',
  usage: '.antilink <on|off|action <warn|delete|kick|ban>|allowdomain <domain>|deldomain <domain>|listdomains>',
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
        styledLine('Whitelist', String(settings.whitelist.length))
      ].join('\n');
      await ctx.sock.sendMessage(groupJid, { text: commandBox('ANTI-LINK', lines) });
      return;
    }

    if (sub === 'on') {
      updateGroupSettings(groupJid, { enabled: true });
      await ctx.sock.sendMessage(groupJid, { text: commandBox('ANTI-LINK', [styledLine('Status', 'ENABLED')].join('\n')) });
    } else if (sub === 'off') {
      updateGroupSettings(groupJid, { enabled: false });
      await ctx.sock.sendMessage(groupJid, { text: commandBox('ANTI-LINK', [styledLine('Status', 'DISABLED')].join('\n')) });
    } else if (sub === 'action') {
      const action = ctx.args[1]?.toLowerCase();
      const valid = ['warn', 'delete', 'kick', 'ban'];
      if (!valid.includes(action)) {
        await ctx.sock.sendMessage(groupJid, { text: commandBox('ANTI-LINK', [styledLine('Error', 'Invalid action')].join('\n')) });
        return;
      }
      updateGroupSettings(groupJid, { action });
      await ctx.sock.sendMessage(groupJid, { text: commandBox('ANTI-LINK', [styledLine('Action', action.toUpperCase())].join('\n')) });
    } else if (sub === 'allowdomain') {
      const domain = ctx.args[1]?.toLowerCase();
      if (!domain) {
        await ctx.sock.sendMessage(groupJid, { text: commandBox('ANTI-LINK', [styledLine('Error', 'Provide domain')].join('\n')) });
        return;
      }
      addDomainToWhitelist(groupJid, domain);
      await ctx.sock.sendMessage(groupJid, { text: commandBox('ANTI-LINK', [styledLine('Status', 'DOMAIN WHITELISTED')].join('\n')) });
    } else if (sub === 'deldomain') {
      const domain = ctx.args[1]?.toLowerCase();
      if (!domain) {
        await ctx.sock.sendMessage(groupJid, { text: commandBox('ANTI-LINK', [styledLine('Error', 'Provide domain')].join('\n')) });
        return;
      }
      removeDomainFromWhitelist(groupJid, domain);
      await ctx.sock.sendMessage(groupJid, { text: commandBox('ANTI-LINK', [styledLine('Status', 'DOMAIN REMOVED')].join('\n')) });
    } else if (sub === 'listdomains') {
      const whitelist = settings.whitelist || [];
      if (!whitelist.length) {
        await ctx.sock.sendMessage(groupJid, { text: commandBox('ANTI-LINK', [styledLine('Status', 'NO WHITELISTED DOMAINS')].join('\n')) });
        return;
      }
      const lines = whitelist.map((d, i) => `┃ [${i + 1}] ${d}`).join('\n');
      await ctx.sock.sendMessage(groupJid, { text: commandBox('ANTI-LINK WHITELIST', lines) });
    } else {
      await ctx.sock.sendMessage(groupJid, { text: commandBox('ANTI-LINK', [styledLine('Error', 'Invalid subcommand')].join('\n')) });
    }
  }
};
