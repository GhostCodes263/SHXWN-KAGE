const { commandBox, styledLine } = require('../../utils/format');

module.exports = {
  name: 'ping',
  aliases: ['p'],
  category: 'utility',
  description: 'Check bot responsiveness',
  usage: '.ping',
  permissions: ['USER'],
  cooldown: 3,
  execute: async (ctx) => {
    const start = Date.now();
    await ctx.sock.sendMessage(ctx.normalized.remoteJid, {
      text: commandBox('PING', [
        styledLine('Status', 'ONLINE'),
        styledLine('Latency', '...')
      ].join('\n'))
    });
    const latency = Date.now() - start;
    await ctx.sock.sendMessage(ctx.normalized.remoteJid, {
      text: commandBox('PING', [
        styledLine('Status', 'ONLINE'),
        styledLine('Latency', `${latency}ms`)
      ].join('\n'))
    });
  }
};
