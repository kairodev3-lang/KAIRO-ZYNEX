async function command(sock, from, msg, q, createPairing) {
    if (from.endsWith('@g.us')) return sock.sendMessage(from, { text: '*❌ ᴜsᴇ .ᴘᴀɪʀ ɪɴ ᴘʀɪᴠᴀᴛᴇ ᴄʜᴀᴛs ᴏɴʟʏ.*' }, { quoted: msg });
    const number = String(q || '').replace(/\D/g, '');
    if (!/^\d{8,15}$/.test(number)) {
        return sock.sendMessage(from, { text: '*❌ ᴜsᴀɢᴇ: .ᴘᴀɪʀ 509 xxx*
*ɪɴᴄʟᴜᴅᴇ ᴛʜᴇ ᴄᴏᴜɴᴛʀʏ ᴄᴏᴅᴇ.*' }, { quoted: msg });
    }
    try {
        await createPairing(number, from);
    } catch (e) {
        await sock.sendMessage(from, { text: `*❌ ᴘᴀɪʀɪɴɢ ғᴀɪʟᴇᴅ:* ${e.message}` }, { quoted: msg });
    }
}
module.exports = command;
