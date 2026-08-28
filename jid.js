async function command(sock, from, msg) {
    if (!from.endsWith('@g.us')) return sock.sendMessage(from, { text: '*❌ ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ ɪs ғᴏʀ ɢʀᴏᴜᴘs.*' }, { quoted: msg });
    await sock.sendMessage(from, { text: `*🆔 ɢʀᴏᴜᴘ ᴊɪᴅ:*
\`${from}\`` }, { quoted: msg });
}
module.exports = command;
