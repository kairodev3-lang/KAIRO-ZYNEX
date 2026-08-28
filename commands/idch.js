function findNewsletterInfo(value, seen = new Set()) {
    if (!value || typeof value !== 'object' || seen.has(value)) return null;
    seen.add(value);
    if (value.forwardedNewsletterMessageInfo?.newsletterJid) return value.forwardedNewsletterMessageInfo;
    for (const key of Object.keys(value)) {
        const found = findNewsletterInfo(value[key], seen);
        if (found) return found;
    }
    return null;
}
async function command(sock, from, msg) {
    const info = findNewsletterInfo(msg.message);
    const id = info?.newsletterJid || (from.endsWith('@newsletter') ? from : null);
    if (!id) return sock.sendMessage(from, { text: '*❌ ʀᴇᴘʟʏ ᴛᴏ ᴀ ғᴏʀᴡᴀʀᴅᴇᴅ ᴄʜᴀɴɴᴇʟ ᴍᴇssᴀɢᴇ ᴀɴᴅ ᴜsᴇ .ɪᴅᴄʜ*' }, { quoted: msg });
    await sock.sendMessage(from, { text: `*📢 ᴄʜᴀɴɴᴇʟ ɪᴅ:*\n\`${id}\`` }, { quoted: msg });
}
module.exports = command;
