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
    const sent = await ctx.sock.sendMessage(ctx.normalized.remoteJid, {
      text: '🏓 Pong!'
    });
    const latency = Date.now() - start;
    await ctx.sock.sendMessage(ctx.normalized.remoteJid, {
      text: `⚡ Latency: ${latency}ms`
    });
  }
};
