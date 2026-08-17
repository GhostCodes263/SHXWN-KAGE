const crypto = require('crypto');
const { commandBox, styledLine } = require('../../utils/format');

module.exports = {
  name: 'password',
  aliases: ['passgen', 'genpass'],
  category: 'utility',
  description: 'Generate a secure password',
  usage: '.password [length]',
  permissions: ['USER'],
  cooldown: 3,
  execute: async (ctx) => {
    const length = parseInt(ctx.args[0], 10) || 12;
    if (length < 8 || length > 128) {
      await ctx.sock.sendMessage(ctx.normalized.remoteJid, {
        text: commandBox('PASSWORD', [styledLine('Error', 'Length must be 8-128')].join('\n'))
      });
      return;
    }
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+';
    const bytes = crypto.randomBytes(length);
    let password = '';
    for (let i = 0; i < length; i++) {
      password += charset[bytes[i] % charset.length];
    }
    const lines = [
      styledLine('Length', String(length)),
      styledLine('Password', password)
    ].join('\n');
    await ctx.sock.sendMessage(ctx.normalized.remoteJid, {
      text: commandBox('PASSWORD', lines)
    });
  }
};
