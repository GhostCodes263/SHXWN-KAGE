module.exports = {
  name: 'info',
  aliases: ['botinfo', 'about'],
  category: 'utility',
  description: 'Show bot information',
  usage: '.info',
  permissions: ['USER'],
  cooldown: 3,
  execute: async (ctx) => {
    const { botName, ownerName, environment } = ctx.config;
    await ctx.sock.sendMessage(ctx.normalized.remoteJid, {
      text: `╭━━━〔 ⚔️ ${botName} 〕━━━╮\n` +
            `┃  SHXWN-KAGE SYSTEM\n` +
            `┃  Status: ONLINE\n` +
            `┃  Mode: ${environment.toUpperCase()}\n` +
            `┃  Prefix: ${ctx.config.botPrefix}\n` +
            `┃  Owner: ${ownerName}\n` +
            `╰━━━━━━━━━━━━━━━━━━━━━╯`
    });
  }
};
