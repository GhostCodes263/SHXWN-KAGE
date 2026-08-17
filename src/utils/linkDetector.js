/**
 * Detects links and suspicious domains in text.
 */
function detectLinks(text) {
  if (!text) return [];
  const urlRegex = /(https?:\/\/[^\s]+|www\.[^\s]+|[a-zA-Z0-9-]+\.[a-zA-Z]{2,}[^\s]*)/g;
  const matches = text.match(urlRegex) || [];
  return matches.map((m) => m.replace(/[.,;!?)]+$/, '')); // trim trailing punctuation
}

function extractDomain(url) {
  const match = url.match(/^(?:https?:\/\/)?(?:www\.)?([^\/:]+)/i);
  return match ? match[1].toLowerCase() : url.toLowerCase();
}

function isWhatsAppLink(url) {
  return /chat\.whatsapp\.com|wa\.me/i.test(url);
}

function isTelegramLink(url) {
  return /t\.me|telegram\.me/i.test(url);
}

function isDiscordLink(url) {
  return /discord\.gg|discord\.com\/invite/i.test(url);
}

function isFacebookLink(url) {
  return /facebook\.com|fb\.me|fb\.com/i.test(url);
}

function isInstagramLink(url) {
  return /instagram\.com|instagr\.am/i.test(url);
}

function isTikTokLink(url) {
  return /tiktok\.com/i.test(url);
}

function isShortenedUrl(url) {
  return /bit\.ly|tinyurl\.com|goo\.gl|is\.gd|buff\.ly|rebrand\.ly|short\.ly|cutt\.ly|t\.co|ow\.ly/i.test(url);
}

function isSuspiciousDomain(domain) {
  // Simple heuristic: unknown TLDs or scam keywords
  if (/\.(xyz|top|tk|ml|ga|cf|gq|info|loan|win|bid|download|stream|club|online|site)$/i.test(domain)) {
    return true;
  }
  if (/crypto|airdrop|giveaway|prize|claim|free|bonus|reward|investment|earn|money|forex|trade/i.test(domain)) {
    return true;
  }
  return false;
}

function classifyLink(url) {
  const domain = extractDomain(url);
  if (isWhatsAppLink(url)) return { type: 'whatsapp', domain };
  if (isTelegramLink(url)) return { type: 'telegram', domain };
  if (isDiscordLink(url)) return { type: 'discord', domain };
  if (isFacebookLink(url)) return { type: 'facebook', domain };
  if (isInstagramLink(url)) return { type: 'instagram', domain };
  if (isTikTokLink(url)) return { type: 'tiktok', domain };
  if (isShortenedUrl(url)) return { type: 'shortened', domain };
  if (isSuspiciousDomain(domain)) return { type: 'suspicious', domain };
  return { type: 'other', domain };
}

module.exports = {
  detectLinks,
  extractDomain,
  classifyLink,
  isWhatsAppLink,
  isTelegramLink,
  isDiscordLink,
  isFacebookLink,
  isInstagramLink,
  isTikTokLink,
  isShortenedUrl,
  isSuspiciousDomain
};
