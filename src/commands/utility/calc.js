const { commandBox, styledLine } = require('../../utils/format');

function safeEval(expr) {
  // Allow only digits, operators, parentheses, decimal point, spaces
  const sanitized = expr.replace(/[^0-9+\-*/().%\s]/g, '');
  if (sanitized !== expr) return null;
  try {
    // eslint-disable-next-line no-new-func
    const result = Function('"use strict";return (' + sanitized + ')')();
    if (typeof result !== 'number' || isNaN(result)) return null;
    return Number(result.toFixed(6));
  } catch {
    return null;
  }
}

module.exports = {
  name: 'calc',
  aliases: ['math', 'calculate'],
  category: 'utility',
  description: 'Evaluate a mathematical expression',
  usage: '.calc <expression>',
  permissions: ['USER'],
  cooldown: 3,
  execute: async (ctx) => {
    const expr = ctx.args.join(' ');
    if (!expr) {
      await ctx.sock.sendMessage(ctx.normalized.remoteJid, {
        text: commandBox('CALC', [styledLine('Error', 'No expression')].join('\n'))
      });
      return;
    }
    const result = safeEval(expr);
    const lines = [
      styledLine('Expression', expr),
      styledLine('Result', result === null ? 'Invalid' : String(result))
    ].join('\n');
    await ctx.sock.sendMessage(ctx.normalized.remoteJid, {
      text: commandBox('CALC', lines)
    });
  }
};
