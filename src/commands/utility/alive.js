module.exports = {
  name: 'alive',
  aliases: ['online', 'status'],
  category: 'utility',
  description: 'Check if the bot is alive',
  usage: '.alive',
  permissions: ['USER'],
  cooldown: 3,
  execute: async (ctx) => {
    await ctx.sock.sendMessage(ctx.normalized.remoteJid, {
      text: '╔══════════════════════════════════╗\n' +
            '║        SHXWN-KAGE CORE           ║\n' +
            '╠══════════════════════════════════╣\n' +
            '║ Status       : ONLINE            ║\n' +
            '║ Mode         : DEVELOPMENT       ║\n' +
            '║ Prefix       : ' + ctx.config.botPrefix + '                ║\n' +
            '╚══════════════════════════════════╝'
    });
  }
};
